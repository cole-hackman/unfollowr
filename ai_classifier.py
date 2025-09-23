"""
AI-powered account classification using Google Gemini
Implements heuristic-first classification with LLM fallback for ambiguous cases
"""

import json
import logging
import os
import re
from typing import Dict, List, Optional, TypedDict
from dataclasses import dataclass, asdict

from google import genai
from google.genai import types


# Configure Gemini API with error handling
try:
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    API_AVAILABLE = True
except Exception as e:
    logging.warning(f"Gemini API client initialization failed: {e}")
    client = None
    API_AVAILABLE = False


class Account(TypedDict):
    username: str
    fullName: Optional[str]
    bio: Optional[str]
    followersCount: Optional[int]
    followingCount: Optional[int]
    nonFollower: bool
    segment: Optional[str]  # celebrity, creator, brand, friend, spam, unknown
    suggestionScore: Optional[float]
    explanations: List[str]


@dataclass
class ClassificationResult:
    segment: str
    confidence: float
    explanations: List[str]


class AccountClassifier:
    """Hybrid classifier using heuristics + LLM for Instagram account analysis"""
    
    # Keywords for different segments
    CELEBRITY_KEYWORDS = [
        'verified', 'official', 'actor', 'actress', 'singer', 'musician', 'artist',
        'celebrity', 'star', 'famous', 'award', 'grammy', 'oscar', 'emmy'
    ]
    
    BRAND_KEYWORDS = [
        'shop', 'store', 'brand', 'company', 'business', 'official', 'inc',
        'llc', 'corp', 'limited', 'fashion', 'clothing', 'beauty', 'tech',
        'startup', 'agency', 'marketing', 'sales', 'buy', 'order', 'discount'
    ]
    
    CREATOR_KEYWORDS = [
        'influencer', 'blogger', 'youtuber', 'content', 'creator', 'fitness',
        'coach', 'trainer', 'photographer', 'artist', 'designer', 'travel',
        'food', 'lifestyle', 'fashion', 'beauty', 'tech', 'gaming'
    ]
    
    SPAM_KEYWORDS = [
        'follow for follow', 'f4f', 'followback', 'follow4follow', 'dm for',
        'crypto', 'bitcoin', 'forex', 'trading', 'investment', 'money',
        'rich', 'millionaire', 'entrepreneur', 'business opportunity',
        'make money', 'earn money', 'giveaway', 'free money', 'cash app'
    ]
    
    # Patterns that suggest real person
    REAL_PERSON_PATTERNS = [
        r'^[A-Za-z]+ [A-Za-z]+$',  # First Last
        r'^\w+\s+\w+$',  # Simple name patterns
    ]
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def classify_account_heuristic(self, account: Dict) -> Optional[ClassificationResult]:
        """
        Use heuristic rules to classify account. Returns None if ambiguous.
        """
        username = account.get('username', '').lower()
        full_name = account.get('fullName', '').lower() if account.get('fullName') else ''
        bio = account.get('bio', '').lower() if account.get('bio') else ''
        followers = account.get('followersCount', 0) or 0
        following = account.get('followingCount', 0) or 0
        
        text_content = f"{username} {full_name} {bio}"
        explanations = []
        
        # High follower count suggests celebrity/brand
        if followers > 100000:
            if any(keyword in text_content for keyword in self.CELEBRITY_KEYWORDS):
                explanations.append(f"High follower count ({followers:,}) with celebrity keywords")
                return ClassificationResult("celebrity", 0.9, explanations)
            elif any(keyword in text_content for keyword in self.BRAND_KEYWORDS):
                explanations.append(f"High follower count ({followers:,}) with brand keywords")
                return ClassificationResult("brand", 0.9, explanations)
            else:
                explanations.append(f"High follower count ({followers:,})")
                return ClassificationResult("celebrity", 0.7, explanations)
        
        # Spam detection
        spam_score = sum(1 for keyword in self.SPAM_KEYWORDS if keyword in text_content)
        if spam_score >= 2:
            explanations.append(f"Multiple spam keywords ({spam_score} found)")
            return ClassificationResult("spam", 0.8, explanations)
        
        # Brand detection
        brand_score = sum(1 for keyword in self.BRAND_KEYWORDS if keyword in text_content)
        if brand_score >= 2:
            explanations.append(f"Multiple brand keywords ({brand_score} found)")
            return ClassificationResult("brand", 0.7, explanations)
        
        # Creator detection
        creator_score = sum(1 for keyword in self.CREATOR_KEYWORDS if keyword in text_content)
        if creator_score >= 2:
            explanations.append(f"Multiple creator keywords ({creator_score} found)")
            return ClassificationResult("creator", 0.7, explanations)
        
        # Real person detection (conservative)
        if followers < 5000 and following < 2000:
            # Check for real name patterns
            for pattern in self.REAL_PERSON_PATTERNS:
                if re.match(pattern, full_name):
                    explanations.append("Appears to be real person (low followers, real name pattern)")
                    return ClassificationResult("friend", 0.8, explanations)
        
        # If we can't classify with confidence, return None for LLM processing
        return None
    
    def classify_batch_with_ai(self, accounts: List[Dict]) -> List[ClassificationResult]:
        """
        Use Gemini to classify a batch of ambiguous accounts
        """
        if not accounts:
            return []
        
        if not API_AVAILABLE or client is None:
            self.logger.warning("AI API unavailable, using fallback classification")
            return [ClassificationResult('unknown', 0.3, ['AI unavailable']) for _ in accounts]
        
        try:
            # Prepare the prompt
            system_prompt = """You are an Instagram account classifier. Analyze the provided accounts and classify each into one of these segments:

- "celebrity": Famous people, verified accounts, entertainers, public figures
- "creator": Content creators, influencers, bloggers, artists, coaches
- "brand": Companies, businesses, official brand accounts, stores
- "friend": Real people, personal accounts, likely genuine connections
- "spam": Fake accounts, bots, suspicious activity, cryptocurrency/forex promotion

For each account, provide:
1. segment: one of the 5 categories above
2. confidence: float between 0.0-1.0
3. explanations: array of short reasons for the classification

Respond with valid JSON only, no additional text."""

            # Format accounts for AI
            formatted_accounts = []
            for i, account in enumerate(accounts):
                formatted_account = {
                    "id": i,
                    "username": account.get('username', ''),
                    "fullName": account.get('fullName', ''),
                    "bio": account.get('bio', ''),
                    "followersCount": account.get('followersCount', 0),
                    "followingCount": account.get('followingCount', 0)
                }
                formatted_accounts.append(formatted_account)
            
            user_prompt = f"Classify these Instagram accounts:\n{json.dumps(formatted_accounts, indent=2)}"
            
            # Call Gemini API
            response = client.models.generate_content(
                model="gemini-1.5-flash",
                contents=[
                    types.Content(role="user", parts=[types.Part(text=f"{system_prompt}\n\n{user_prompt}")])
                ],
                config=types.GenerateContentConfig(
                    temperature=0,
                    response_mime_type="application/json"
                )
            )
            
            # Parse response
            if not response.text:
                raise ValueError("Empty response from Gemini")
            result_data = json.loads(response.text)
            results = []
            
            for item in result_data:
                if isinstance(item, dict) and 'segment' in item:
                    results.append(ClassificationResult(
                        segment=item.get('segment', 'unknown'),
                        confidence=float(item.get('confidence', 0.5)),
                        explanations=item.get('explanations', ['AI classified'])
                    ))
                else:
                    # Fallback for malformed response
                    results.append(ClassificationResult('unknown', 0.3, ['AI classification failed']))
            
            return results
            
        except Exception as e:
            self.logger.error(f"AI classification failed: {e}")
            # Return fallback classifications
            return [ClassificationResult('unknown', 0.3, ['AI unavailable']) for _ in accounts]
    
    def calculate_suggestion_score(self, account: Dict, segment: str) -> float:
        """
        Calculate unfollow suggestion score based on segment and other factors
        """
        score = 0.0
        
        # Base score for non-followers
        if account.get('nonFollower', False):
            score += 0.6
        
        # Segment-based scoring
        segment_scores = {
            'celebrity': 0.3,
            'brand': 0.3,
            'creator': 0.2,
            'spam': 0.5,
            'friend': -0.7,  # Protect real people
            'unknown': 0.1
        }
        
        score += segment_scores.get(segment, 0.1)
        
        # High following ratio suggests less personal connection
        followers = account.get('followersCount', 0) or 0
        following = account.get('followingCount', 0) or 0
        
        if followers > 0 and following > 0:
            ratio = following / followers
            if ratio > 2:  # Following much more than followers
                score += 0.1
        
        # Clamp between 0 and 1
        return max(0.0, min(1.0, score))
    
    def enrich_accounts(self, accounts: List[Dict]) -> List[Account]:
        """
        Main method to enrich accounts with AI classification and scoring
        """
        enriched_accounts = []
        ambiguous_accounts = []
        ambiguous_indices = []
        
        # First pass: heuristic classification
        for i, account in enumerate(accounts):
            heuristic_result = self.classify_account_heuristic(account)
            
            if heuristic_result:
                # Use heuristic classification
                enriched_account = Account(
                    username=account['username'],
                    fullName=account.get('fullName'),
                    bio=account.get('bio'),
                    followersCount=account.get('followersCount'),
                    followingCount=account.get('followingCount'),
                    nonFollower=account.get('nonFollower', False),
                    segment=heuristic_result.segment,
                    suggestionScore=self.calculate_suggestion_score(account, heuristic_result.segment),
                    explanations=heuristic_result.explanations
                )
                enriched_accounts.append(enriched_account)
            else:
                # Mark for AI classification
                ambiguous_accounts.append(account)
                ambiguous_indices.append(i)
                # Add placeholder that will be updated
                enriched_accounts.append(None)
        
        # Second pass: AI classification for ambiguous accounts
        if ambiguous_accounts:
            self.logger.info(f"Classifying {len(ambiguous_accounts)} ambiguous accounts with AI")
            ai_results = self.classify_batch_with_ai(ambiguous_accounts)
            
            # Update placeholders with AI results
            for idx, ai_result in zip(ambiguous_indices, ai_results):
                account = accounts[idx]
                enriched_account = Account(
                    username=account['username'],
                    fullName=account.get('fullName'),
                    bio=account.get('bio'),
                    followersCount=account.get('followersCount'),
                    followingCount=account.get('followingCount'),
                    nonFollower=account.get('nonFollower', False),
                    segment=ai_result.segment,
                    suggestionScore=self.calculate_suggestion_score(account, ai_result.segment),
                    explanations=ai_result.explanations
                )
                enriched_accounts[idx] = enriched_account
        
        return [acc for acc in enriched_accounts if acc is not None]


def translate_query_to_filter(query: str) -> Dict:
    """
    Use Gemini to translate natural language query to filter parameters
    """
    if not API_AVAILABLE or client is None:
        logging.warning("AI API unavailable for query translation")
        return {"error": "AI features require API configuration"}
    
    try:
        system_prompt = """You are a query translator for an Instagram account filter system. Convert natural language queries into JSON filter objects.

Available filters:
- segments: array of ["celebrity", "creator", "brand", "friend", "spam", "unknown"]
- minSuggestion: float 0.0-1.0 (higher = more likely to unfollow)
- maxSuggestion: float 0.0-1.0
- hideFollowers: boolean (hide accounts that follow you back)
- showFollowers: boolean (show only accounts that follow you back)

Examples:
"Hide celebrities and brands" → {"segments": ["celebrity", "brand"], "hideThese": true}
"Show real friends who don't follow back" → {"segments": ["friend"], "hideFollowers": true}
"Show spam accounts" → {"segments": ["spam"]}
"Show high suggestion scores" → {"minSuggestion": 0.7}

Respond with valid JSON only."""

        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=[
                types.Content(role="user", parts=[types.Part(text=f"{system_prompt}\n\nQuery: {query}")])
            ],
            config=types.GenerateContentConfig(
                temperature=0,
                response_mime_type="application/json"
            )
        )
        
        if not response.text:
            raise ValueError("Empty response from Gemini")
        return json.loads(response.text)
        
    except Exception as e:
        logging.error(f"Query translation failed: {e}")
        return {"error": "Could not understand query"}


def get_gemini_client():
    """Get the Gemini client for chat functionality"""
    return client if API_AVAILABLE else None


# Global classifier instance
classifier = AccountClassifier()