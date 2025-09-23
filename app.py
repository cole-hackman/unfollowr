import os
import json
import logging
import re
import time
from datetime import datetime
from flask import Flask, render_template, request, flash, redirect, url_for, jsonify, session, Response
from werkzeug.utils import secure_filename
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.security import check_password_hash
from bs4 import BeautifulSoup
from admin_analytics import analytics

# Import AI classifier with proper error handling
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
AI_ENABLED = GEMINI_API_KEY is not None and GEMINI_API_KEY.strip() != ""

if AI_ENABLED:
    try:
        from ai_classifier import classifier, translate_query_to_filter
        logging.info("AI classifier imported successfully")
    except ImportError as e:
        logging.warning(f"AI classifier not available: {e}")
        AI_ENABLED = False
        classifier = None
        translate_query_to_filter = None

# Import connection classifier (always available)
try:
    from lib.classify_connections import connection_classifier
    logging.info("Connection classifier imported successfully")
except ImportError as e:
    logging.error(f"Connection classifier not available: {e}")
    connection_classifier = None
else:
    logging.info("AI classification disabled - no API key found")
    classifier = None
    translate_query_to_filter = None

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Admin configuration
ADMIN_PASSWORD_HASH = os.environ.get("ADMIN_PASSWORD_HASH", 
    "pbkdf2:sha256:600000$TBLSz8DLgFBjBKCe$d4654dcdacf5acd37c60ab2b7b3bf9c93b15e0e0e88e17e5bb9a8c3c3b70e2e5")  # Default: "admin123"

# Configure upload settings
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
ALLOWED_EXTENSIONS = {'json', 'html'}

def allowed_file(filename):
    """Check if file has allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def parse_followers_json(file_content):
    """Parse Instagram followers export JSON and extract usernames"""
    try:
        data = json.loads(file_content)
        usernames = set()
        
        # Handle the followers export format (array of objects)
        if isinstance(data, list):
            for item in data:
                if 'string_list_data' in item:
                    for entry in item['string_list_data']:
                        if 'value' in entry:
                            usernames.add(entry['value'])
        
        app.logger.debug(f"Parsed {len(usernames)} followers from JSON")
        return usernames
    except (json.JSONDecodeError, KeyError) as e:
        app.logger.error(f"Error parsing followers JSON: {e}")
        raise ValueError(f"Invalid followers JSON format: {str(e)}")

def parse_following_json(file_content):
    """Parse Instagram following export JSON and extract usernames with timestamps"""
    try:
        data = json.loads(file_content)
        usernames = set()
        user_timestamps = {}
        
        # Handle the following export format (object with relationships_following)
        if isinstance(data, dict) and 'relationships_following' in data:
            for item in data['relationships_following']:
                if 'string_list_data' in item:
                    for entry in item['string_list_data']:
                        if 'value' in entry:
                            username = entry['value']
                            usernames.add(username)
                            # Store timestamp if available
                            if 'timestamp' in entry:
                                user_timestamps[username] = entry['timestamp']
        
        app.logger.debug(f"Parsed {len(usernames)} following from JSON")
        return usernames, user_timestamps
    except (json.JSONDecodeError, KeyError) as e:
        app.logger.error(f"Error parsing following JSON: {e}")
        raise ValueError(f"Invalid following JSON format: {str(e)}")

def parse_followers_html(file_content):
    """Parse Instagram followers export HTML and extract usernames"""
    try:
        soup = BeautifulSoup(file_content, 'html.parser')
        usernames = set()
        
        # Find all links that contain Instagram profile URLs
        links = soup.find_all('a', href=re.compile(r'https://www\.instagram\.com/[^/]+/?$'))
        
        for link in links:
            href = link.get('href')
            if href:
                # Extract username from URL like https://www.instagram.com/username/
                username_match = re.search(r'instagram\.com/([^/]+)/?$', href)
                if username_match:
                    username = username_match.group(1)
                    usernames.add(username)
        
        # Also try to find usernames in text content if links are not available
        if not usernames:
            # Look for @username patterns in text
            text_content = soup.get_text()
            username_matches = re.findall(r'@([a-zA-Z0-9._]+)', text_content)
            for username in username_matches:
                usernames.add(username)
        
        app.logger.debug(f"Parsed {len(usernames)} followers from HTML")
        return usernames
    except Exception as e:
        app.logger.error(f"Error parsing followers HTML: {e}")
        raise ValueError(f"Invalid followers HTML format: {str(e)}")

def parse_following_html(file_content):
    """Parse Instagram following export HTML and extract usernames"""
    try:
        soup = BeautifulSoup(file_content, 'html.parser')
        usernames = set()
        user_timestamps = {}
        
        # Find all links that contain Instagram profile URLs
        links = soup.find_all('a', href=re.compile(r'https://www\.instagram\.com/[^/]+/?$'))
        
        for link in links:
            href = link.get('href')
            if href:
                # Extract username from URL like https://www.instagram.com/username/
                username_match = re.search(r'instagram\.com/([^/]+)/?$', href)
                if username_match:
                    username = username_match.group(1)
                    usernames.add(username)
        
        # Also try to find usernames in text content if links are not available
        if not usernames:
            # Look for @username patterns in text
            text_content = soup.get_text()
            username_matches = re.findall(r'@([a-zA-Z0-9._]+)', text_content)
            for username in username_matches:
                usernames.add(username)
        
        app.logger.debug(f"Parsed {len(usernames)} following from HTML")
        # HTML doesn't have timestamps, return empty dict
        return usernames, user_timestamps
    except Exception as e:
        app.logger.error(f"Error parsing following HTML: {e}")
        raise ValueError(f"Invalid following HTML format: {str(e)}")

def detect_file_format(file_content):
    """Detect if file content is JSON or HTML"""
    stripped_content = file_content.strip()
    
    # Try to parse as JSON first
    try:
        json.loads(stripped_content)
        return 'json'
    except json.JSONDecodeError:
        pass
    
    # Check if it looks like HTML
    if stripped_content.startswith('<') and 'html' in stripped_content.lower():
        return 'html'
    
    # Default to JSON if uncertain
    return 'json'

def parse_followers_file(file_content):
    """Parse followers file content (JSON or HTML) and extract usernames"""
    file_format = detect_file_format(file_content)
    
    if file_format == 'json':
        return parse_followers_json(file_content)
    elif file_format == 'html':
        return parse_followers_html(file_content)
    else:
        raise ValueError("Unsupported file format. Please upload a JSON or HTML file.")

def parse_following_file(file_content):
    """Parse following file content (JSON or HTML) and extract usernames with timestamps"""
    file_format = detect_file_format(file_content)
    
    if file_format == 'json':
        return parse_following_json(file_content)
    elif file_format == 'html':
        return parse_following_html(file_content)
    else:
        raise ValueError("Unsupported file format. Please upload a JSON or HTML file.")

def validate_file_size(file):
    """Validate file size before processing"""
    if file:
        # Check file size (Flask already handles MAX_CONTENT_LENGTH but let's be explicit)
        file.seek(0, 2)  # Seek to end
        size = file.tell()
        file.seek(0)  # Reset to beginning
        
        if size > 50 * 1024 * 1024:  # 50MB
            raise ValueError("File size too large. Maximum size is 50MB.")
        
        if size == 0:
            raise ValueError("File is empty.")

def log_usage_analytics(event_type, additional_data=None):
    """Log usage analytics using a simple counter-based approach"""
    try:
        stats_file = 'analytics_counters.json'
        
        # Read current counters
        stats = {
            'page_visits': 0,
            'analyses_completed': 0,
            'start_date': datetime.now().isoformat()[:10],
            'last_updated': datetime.now().isoformat()
        }
        
        if os.path.exists(stats_file):
            try:
                with open(stats_file, 'r') as f:
                    stats = json.load(f)
            except:
                pass  # Use defaults if file is corrupted
        
        # Update counters
        if event_type == 'page_visit':
            stats['page_visits'] += 1
        elif event_type == 'analysis_completed':
            stats['analyses_completed'] += 1
            # Store analysis details in additional_data for history
            if additional_data:
                if 'analysis_history' not in stats:
                    stats['analysis_history'] = []
                stats['analysis_history'].append({
                    'timestamp': datetime.now().isoformat(),
                    **additional_data
                })
                # Keep only last 10 analyses
                stats['analysis_history'] = stats['analysis_history'][-10:]
        
        stats['last_updated'] = datetime.now().isoformat()
        
        # Write updated counters atomically
        temp_file = f"{stats_file}.tmp"
        with open(temp_file, 'w') as f:
            json.dump(stats, f, indent=2)
        os.replace(temp_file, stats_file)
        
        # Log to application logs
        app.logger.info(f"ANALYTICS: {event_type} - Total visits: {stats['page_visits']}, Total analyses: {stats['analyses_completed']}")
            
    except Exception as e:
        # Don't let analytics errors break the app
        app.logger.warning(f"Analytics logging failed: {e}")

def get_usage_stats():
    """Get basic usage statistics from the counter file"""
    try:
        stats_file = 'analytics_counters.json'
        
        default_stats = {
            'total_analyses': 0,
            'total_page_visits': 0,
            'days_active': 0,
            'recent_activity': [],
            'start_date': 'N/A',
            'last_updated': 'N/A'
        }
        
        if not os.path.exists(stats_file):
            return default_stats
            
        with open(stats_file, 'r') as f:
            data = json.load(f)
        
        # Calculate days active
        start_date = data.get('start_date', datetime.now().isoformat()[:10])
        current_date = datetime.now().isoformat()[:10]
        try:
            from datetime import datetime as dt
            start = dt.fromisoformat(start_date)
            current = dt.fromisoformat(current_date)
            days_active = (current - start).days + 1
        except:
            days_active = 1
        
        # Get recent analysis history
        recent_activity = []
        if 'analysis_history' in data:
            for analysis in data['analysis_history'][-5:]:  # Last 5 analyses
                timestamp = analysis.get('timestamp', 'Unknown')[:19]  # Remove microseconds
                recent_activity.append(f"Analysis: {timestamp}")
        
        return {
            'total_analyses': data.get('analyses_completed', 0),
            'total_page_visits': data.get('page_visits', 0),
            'days_active': days_active,
            'recent_activity': recent_activity,
            'start_date': start_date,
            'last_updated': data.get('last_updated', 'N/A')[:19] if data.get('last_updated') else 'N/A'
        }
        
    except Exception as e:
        app.logger.warning(f"Could not read usage stats: {e}")
        return {
            'total_analyses': 0,
            'total_page_visits': 0,
            'days_active': 0,
            'recent_activity': [],
            'start_date': 'N/A',
            'last_updated': 'N/A'
        }

@app.route('/')
def index():
    """Main upload page"""
    # Log page visit
    log_usage_analytics('page_visit', {'page': 'index'})
    return render_template('index-new.html')

@app.route('/faq')
def faq():
    """FAQ page"""
    log_usage_analytics('page_visit', {'page': 'faq'})
    return render_template('faq.html')

@app.route('/admin/stats')
def admin_stats():
    """Simple admin page to view usage statistics"""
    # Simple protection - check for admin query parameter
    if request.args.get('key') != os.environ.get('ADMIN_KEY', 'admin123'):
        return "Access denied", 403
    
    stats = get_usage_stats()
    return f"""
    <html>
    <head><title>Unfollowr Usage Stats</title></head>
    <body style="font-family: Arial, sans-serif; margin: 40px;">
        <h1>Unfollowr Usage Statistics</h1>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Summary</h3>
            <p><strong>Total Analyses Completed:</strong> {stats['total_analyses']}</p>
            <p><strong>Total Page Visits:</strong> {stats['total_page_visits']}</p>
            <p><strong>Days Active:</strong> {stats['days_active']}</p>
            <p><strong>Started Tracking:</strong> {stats['start_date']}</p>
        </div>
        <div style="background: #f0f8ff; padding: 20px; border-radius: 8px;">
            <h3>Recent Activity</h3>
            {'<p>No recent activity</p>' if not stats['recent_activity'] else ''}
            {'<ul>' + ''.join([f'<li>{activity}</li>' for activity in stats['recent_activity']]) + '</ul>' if stats['recent_activity'] else ''}
        </div>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
            Note: No personal data is stored. Only usage counts and timestamps are tracked.<br>
            Last data update: {stats['last_updated']}<br>
            Dashboard viewed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}
        </p>
    </body>
    </html>
    """

@app.route('/compare', methods=['POST'])
def compare():
    """Process uploaded files and compare followers vs following"""
    try:
        # Check if files were uploaded
        if 'followers_file' not in request.files or 'following_file' not in request.files:
            flash('Please upload both followers and following files.', 'error')
            return redirect(url_for('index'))
        
        followers_file = request.files['followers_file']
        following_file = request.files['following_file']
        
        # Check if files are selected
        if followers_file.filename == '' or following_file.filename == '':
            flash('Please select both files.', 'error')
            return redirect(url_for('index'))
        
        # Validate file types
        if not (allowed_file(followers_file.filename) and allowed_file(following_file.filename)):
            flash('Only JSON and HTML files are allowed.', 'error')
            return redirect(url_for('index'))
        
        # Validate file sizes
        validate_file_size(followers_file)
        validate_file_size(following_file)
        
        # Read and parse files with timeout prevention
        app.logger.info("Starting file processing...")
        start_time = time.time()
        
        followers_content = followers_file.read().decode('utf-8')
        following_content = following_file.read().decode('utf-8')
        
        app.logger.info(f"File reading completed in {time.time() - start_time:.2f}s")
        
        # Parse files (auto-detect JSON or HTML) and extract usernames
        parse_start = time.time()
        followers_set = parse_followers_file(followers_content)
        following_set, user_timestamps = parse_following_file(following_content)
        app.logger.info(f"File parsing completed in {time.time() - parse_start:.2f}s")
        
        # Calculate non-followers (people you follow who don't follow back)
        non_followers = following_set - followers_set
        
        # Sort alphabetically
        non_followers_list = sorted(list(non_followers))
        
        # Group by first letter for easier navigation with custom sorting
        from itertools import groupby
        
        def custom_sort_key(username):
            """Custom sort key: A-Z, then numbers and symbols grouped under #"""
            first_char = username[0].upper()
            if first_char.isalpha():
                return (0, first_char)  # Letters first
            else:
                return (1, '#')  # All numbers and symbols under # at the end
        
        # Sort with custom key
        custom_sorted_list = sorted(non_followers_list, key=custom_sort_key)
        
        # Group users and ensure # comes last
        grouped_non_followers = {}
        for letter, users in groupby(custom_sorted_list, key=lambda u: u[0].upper() if u[0].upper().isalpha() else '#'):
            grouped_non_followers[letter] = list(users)
        
        # Reorder to ensure # is at the end
        if '#' in grouped_non_followers:
            hash_group = grouped_non_followers.pop('#')
            # Create ordered dict with letters first, then #
            ordered_groups = {}
            for key in sorted([k for k in grouped_non_followers.keys() if k != '#']):
                ordered_groups[key] = grouped_non_followers[key]
            ordered_groups['#'] = hash_group
            grouped_non_followers = ordered_groups
        
        app.logger.info(f"Found {len(non_followers_list)} non-followers out of {len(following_set)} following and {len(followers_set)} followers")
        
        # Log analytics for successful analysis
        session_id = analytics.generate_session_id(request)
        analytics.log_event(session_id, 'upload_completed', {
            'followers_count': len(followers_set),
            'following_count': len(following_set),
            'non_followers_count': len(non_followers_list),
            'file_types': {
                'followers': detect_file_format(followers_content),
                'following': detect_file_format(following_content)
            }
        })
        
        log_usage_analytics('analysis_completed', {
            'followers_count': len(followers_set),
            'following_count': len(following_set),
            'non_followers_count': len(non_followers_list),
            'file_types': {
                'followers': detect_file_format(followers_content),
                'following': detect_file_format(following_content)
            }
        })
        
        # Create user data with timestamps for frontend
        non_followers_with_data = []
        for username in custom_sorted_list:
            user_data = {
                'username': username,
                'timestamp': user_timestamps.get(username, 0)
            }
            non_followers_with_data.append(user_data)
        
        # AI Enhancement: Create account objects for classification (TIMEOUT PREVENTION)
        enriched_data = {}
        suggested_unfollows = []
        ai_enabled = False
        
        # Limit AI processing to prevent timeouts for large accounts
        MAX_AI_ACCOUNTS = 100  # Prevent timeouts by limiting AI processing
        
        if AI_ENABLED and classifier and len(non_followers_list) <= MAX_AI_ACCOUNTS:
            try:
                app.logger.info(f"Enriching {len(non_followers_list)} accounts with AI classification")
                
                # Create account objects (limited for performance)
                accounts_for_ai = []
                for username in non_followers_list[:MAX_AI_ACCOUNTS]:  # Limit to prevent timeout
                    account = {
                        'username': username,
                        'fullName': None,
                        'bio': None,  
                        'followersCount': None,
                        'followingCount': None,
                        'nonFollower': True
                    }
                    accounts_for_ai.append(account)
                
                # Add a small sample of mutual followers for context (limited)
                followers_who_follow_back = followers_set.intersection(following_set)
                sample_size = min(20, len(followers_who_follow_back))  # Reduced sample
                for username in list(followers_who_follow_back)[:sample_size]:
                    account = {
                        'username': username,
                        'fullName': None,
                        'bio': None,
                        'followersCount': None,
                        'followingCount': None,
                        'nonFollower': False
                    }
                    accounts_for_ai.append(account)
                
                app.logger.info(f"Processing {len(accounts_for_ai)} accounts with AI")
                
                # Classify accounts with timeout protection
                enriched_accounts = classifier.enrich_accounts(accounts_for_ai)
                ai_enabled = True
                
                # Log AI classification event
                session_id = analytics.generate_session_id(request)
                analytics.log_event(session_id, 'ai_classification', {
                    'accounts_processed': len(enriched_accounts),
                    'segments_found': len(set(acc.get('segment', 'unknown') for acc in enriched_accounts))
                })
                
                # Process enriched data for template
                enriched_data = {acc['username']: acc for acc in enriched_accounts}
                segments_summary = {}
                suggested_unfollows = []
                
                for acc in enriched_accounts:
                    segment = acc.get('segment', 'unknown')
                    segments_summary[segment] = segments_summary.get(segment, 0) + 1
                    
                    # Safe comparison with default values
                    suggestion_score = acc.get('suggestionScore') or 0
                    if acc.get('nonFollower') and suggestion_score > 0.5:
                        suggested_unfollows.append(acc)
                
                # Sort suggestions by score (safe sorting)
                suggested_unfollows.sort(key=lambda x: x.get('suggestionScore') or 0, reverse=True)
                
                app.logger.info(f"AI classification complete. Segments: {segments_summary}")
                
            except Exception as e:
                app.logger.error(f"AI enhancement failed: {e}")
                # Gracefully fall back to non-AI mode
                enriched_data = {}
                suggested_unfollows = []
                ai_enabled = False
                flash('AI features temporarily unavailable. Analysis completed without AI classification.', 'info')
        else:
            reason = "too many accounts" if len(non_followers_list) > MAX_AI_ACCOUNTS else "not enabled or classifier unavailable"
            app.logger.info(f"AI enhancement skipped - {reason}")
            enriched_data = {}
            suggested_unfollows = []

        # Pass data to results template
        # Apply enhanced connection classification
        classified_accounts = []
        classification_counts = {'unfollowers': 0, 'fans': 0, 'mutuals': 0, 'brand': 0, 'sports': 0, 'celebrity': 0, 'creator': 0, 'other': 0}
        
        if connection_classifier:
            try:
                # Build proper data dictionaries for full names
                followers_data_dict = {}
                following_data_dict = {}
                
                # Extract data from parsed results
                for username in followers_set:
                    # Try to get full name from parsed data if available
                    full_name = None
                    if hasattr(locals().get('followers_list'), '__iter__'):
                        for follower_data in followers_list:
                            if isinstance(follower_data, dict) and follower_data.get('username') == username:
                                full_name = follower_data.get('full_name')
                                break
                    followers_data_dict[username] = {'username': username, 'full_name': full_name}
                
                for username in following_set:
                    # Try to get full name from parsed data if available
                    full_name = None
                    if hasattr(locals().get('following_list'), '__iter__'):
                        for following_data in following_list:
                            if isinstance(following_data, dict) and following_data.get('username') == username:
                                full_name = following_data.get('full_name')
                                break
                    following_data_dict[username] = {'username': username, 'full_name': full_name}
                
                # Prepare data for classification
                followers_data = [followers_data_dict[username] for username in followers_set]
                following_data = [following_data_dict[username] for username in following_set]
                
                classified_accounts = connection_classifier.classify_connections(followers_data, following_data)
                classification_counts = connection_classifier.get_category_counts(classified_accounts)
                
                app.logger.info(f"Classification complete: {classification_counts}")
            except Exception as e:
                app.logger.error(f"Classification failed: {e}")
                import traceback
                app.logger.error(f"Traceback: {traceback.format_exc()}")
        
        return render_template('results-categorized.html', 
                             non_followers=custom_sorted_list,
                             non_followers_with_data=non_followers_with_data,
                             grouped_non_followers=grouped_non_followers,
                             user_timestamps=user_timestamps,
                             total_following=len(following_set),
                             total_followers=len(followers_set),
                             total_non_followers=len(non_followers_list),
                             enriched_data=enriched_data,
                             classified_accounts=classified_accounts,
                             classification_counts=classification_counts,
                             suggested_unfollows=suggested_unfollows,
                             ai_enabled=AI_ENABLED)
        
    except ValueError as e:
        flash(str(e), 'error')
        return redirect(url_for('index'))
    except Exception as e:
        app.logger.error(f"Unexpected error: {e}")
        flash('An unexpected error occurred while processing your files. Please check the file format and try again.', 'error')
        return redirect(url_for('index'))



@app.route('/api/ai/translate-query', methods=['POST'])
def translate_query():
    """Translate natural language query to filter parameters"""
    if not AI_ENABLED or not translate_query_to_filter:
        return jsonify({"error": "AI features require API key configuration"}), 503
    
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        if not query:
            return jsonify({"error": "Query is required"}), 400
        
        # Log AI query event
        session_id = analytics.generate_session_id(request)
        analytics.log_event(session_id, 'ai_query', {'query_length': len(query)})
        
        filter_params = translate_query_to_filter(query)
        return jsonify(filter_params)
        
    except Exception as e:
        app.logger.error(f"Query translation error: {e}")
        return jsonify({"error": "Failed to process query"}), 500


@app.route('/api/ai/classify-batch', methods=['POST'])
def classify_batch():
    """Classify a batch of accounts using AI"""
    if not AI_ENABLED or not classifier:
        return jsonify({"error": "AI features require API key configuration"}), 503
    
    try:
        data = request.get_json()
        accounts = data.get('accounts', [])
        
        if not accounts:
            return jsonify({"error": "Accounts are required"}), 400
        
        # Limit batch size
        if len(accounts) > 50:
            accounts = accounts[:50]
        
        enriched_accounts = classifier.enrich_accounts(accounts)
        return jsonify({"accounts": enriched_accounts})
        
    except Exception as e:
        app.logger.error(f"Batch classification error: {e}")
        return jsonify({"error": "Failed to classify accounts"}), 500

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    """Handle AI chat conversations with context awareness"""
    if not AI_ENABLED:
        return jsonify({"error": "AI features require API key configuration"}), 503
    
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        context = data.get('context', {})
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        # Log AI chat event
        session_id = analytics.generate_session_id(request)
        analytics.log_event(session_id, 'ai_chat', {
            'message_length': len(message),
            'category': context.get('currentCategory', 'unknown')
        })
        
        # Process the chat query
        response_data = process_chat_query(message, context)
        return jsonify(response_data)
        
    except Exception as e:
        app.logger.error(f"AI chat error: {e}")
        return jsonify({
            "error": "Chat processing failed",
            "response": "I apologize, but I encountered an error processing your request. Please try rephrasing your question."
        }), 500

def process_chat_query(message, context):
    """Process AI chat query using Gemini"""
    try:
        from ai_classifier import get_gemini_client
        
        client = get_gemini_client()
        if not client:
            return {
                "response": "AI assistant is currently unavailable. Please try again later."
            }
        
        # Extract context
        accounts = context.get('accounts', [])
        enriched_data = context.get('enrichedData', {})
        current_category = context.get('currentCategory', 'unfollowers')
        
        # Build context for AI
        context_info = build_chat_context(accounts, enriched_data, current_category)
        
        # Create conversation prompt
        system_prompt = f"""You are an AI assistant for Unfollowr, helping users understand their Instagram connections.

Context about user's data:
{context_info}

Categories explained:
- Unfollowers: Accounts they follow who don't follow back
- Too Famous: Celebrities, influencers with >100k followers who rarely follow back  
- Inner Circle: Close friends, people they interact with regularly
- Fan Club: Accounts that follow them but they don't follow back

Your role:
- Answer questions about their Instagram connections
- Provide insights about who to follow/unfollow
- Explain account categories and relationships
- Be conversational, helpful, and specific
- Keep responses concise but informative
- When mentioning specific accounts, explain why they fall into that category

User question: {message}

Respond in a helpful, conversational tone. If the user is asking about specific categories or actions, provide actionable insights."""
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=system_prompt
        )
        
        if not response or not response.text:
            return {
                "response": "I couldn't generate a response. Please try rephrasing your question."
            }
        
        ai_response = response.text.strip()
        
        # Check if response suggests category switching or filtering
        actions = extract_chat_actions(ai_response, message)
        
        return {
            "response": ai_response,
            "actions": actions
        }
        
    except Exception as e:
        app.logger.error(f"Chat processing error: {e}")
        return {
            "response": "I encountered an error processing your request. Please try again."
        }

def build_chat_context(accounts, enriched_data, current_category):
    """Build context summary for AI chat"""
    total = len(accounts)
    
    # Count segments
    segments = {}
    for username in accounts:
        if username in enriched_data:
            segment = enriched_data[username].get('segment', 'unknown')
            segments[segment] = segments.get(segment, 0) + 1
    
    context_parts = [
        f"Total accounts: {total}",
        f"Current view: {current_category}",
        f"Segments: {dict(segments)}"
    ]
    
    # Add some examples
    if total > 0:
        sample_accounts = list(accounts)[:5]
        context_parts.append(f"Sample accounts: {', '.join(sample_accounts)}")
    
    return '\n'.join(context_parts)

def extract_chat_actions(ai_response, user_message):
    """Extract actions from chat response"""
    actions = {}
    
    response_lower = ai_response.lower()
    message_lower = user_message.lower()
    
    # Check for category switching
    if any(term in response_lower or term in message_lower for term in ['too famous', 'celebrities', 'celebrity']):
        actions['switchCategory'] = 'too-famous'
    elif any(term in response_lower or term in message_lower for term in ['inner circle', 'close friends', 'friends']):
        actions['switchCategory'] = 'inner-circle'  
    elif any(term in response_lower or term in message_lower for term in ['fan club', 'followers']):
        actions['switchCategory'] = 'fan-club'
    
    # Check for segment filtering
    segments = []
    if 'celebrity' in response_lower or 'celebrities' in message_lower:
        segments.append('celebrity')
    if 'creator' in response_lower:
        segments.append('creator')
    if 'brand' in response_lower:
        segments.append('brand')
    if 'friend' in response_lower:
        segments.append('friend')
    if 'spam' in response_lower:
        segments.append('spam')
    
    if segments:
        actions['applyFilters'] = {'segments': segments}
    
    return actions


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)


@app.route('/privacy')
def privacy():
    """Privacy policy page"""
    session_id = analytics.generate_session_id(request)
    analytics.log_event(session_id, 'privacy_view')
    log_usage_analytics('privacy_view')
    return render_template('privacy.html')


# Admin Routes
@app.route('/admin')
def admin_login():
    """Admin login page"""
    if session.get('admin_authenticated'):
        return redirect(url_for('admin_dashboard'))
    return render_template('admin_login.html')


@app.route('/admin', methods=['POST'])
def admin_login_post():
    """Handle admin login"""
    password = request.form.get('password')
    
    if not password:
        flash('Password is required', 'error')
        return render_template('admin_login.html')
    
    # Check password (using Werkzeug's check_password_hash)
    if check_password_hash(ADMIN_PASSWORD_HASH, password) or password == "admin123":  # Fallback for dev
        session['admin_authenticated'] = True
        session_id = analytics.generate_session_id(request)
        analytics.log_event(session_id, 'admin_login')
        return redirect(url_for('admin_dashboard'))
    else:
        flash('Invalid password', 'error')
        return render_template('admin_login.html')


@app.route('/admin/dashboard')
def admin_dashboard():
    """Admin dashboard with analytics"""
    if not session.get('admin_authenticated'):
        return redirect(url_for('admin_login'))
    
    # Get dashboard data
    metrics = analytics.get_metrics()
    chart_data = analytics.get_chart_data()
    recent_sessions = analytics.get_recent_sessions()
    
    return render_template('admin_dashboard.html',
                         metrics=metrics,
                         chart_data=chart_data,
                         recent_sessions=recent_sessions)


@app.route('/admin/chart-data')
def admin_chart_data():
    """API endpoint for chart data"""
    if not session.get('admin_authenticated'):
        return jsonify({'error': 'Unauthorized'}), 401
    
    range_param = request.args.get('range', '7d')
    days_map = {'7d': 7, '30d': 30, '90d': 90}
    days = days_map.get(range_param, 7)
    
    chart_data = analytics.get_chart_data(days)
    return jsonify({
        'labels': chart_data['usage_labels'],
        'data': chart_data['usage_data']
    })


@app.route('/admin/export-csv')
def admin_export_csv():
    """Export analytics data as CSV"""
    if not session.get('admin_authenticated'):
        return redirect(url_for('admin_login'))
    
    csv_data = analytics.export_csv_data()
    response = Response(csv_data, mimetype='text/csv')
    response.headers['Content-Disposition'] = 'attachment; filename=unfollowr_analytics.csv'
    return response


@app.route('/admin/logout')
def admin_logout():
    """Admin logout"""
    session.pop('admin_authenticated', None)
    flash('Logged out successfully', 'info')
    return redirect(url_for('admin_login'))

@app.errorhandler(413)
def too_large(e):
    """Handle file too large error"""
    flash('File size too large. Maximum size is 50MB.', 'error')
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
