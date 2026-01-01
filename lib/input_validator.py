"""
Input validation utilities for security
"""

import re
import json
from typing import Any, Dict, List, Optional, Tuple
from werkzeug.datastructures import FileStorage


class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass


class InputValidator:
    """Input validation utilities"""
    
    # Instagram username pattern (1-30 chars, letters, numbers, periods, underscores)
    USERNAME_PATTERN = re.compile(r'^[a-z0-9._]{1,30}$', re.IGNORECASE)
    
    # Maximum lengths
    MAX_QUERY_LENGTH = 500
    MAX_MESSAGE_LENGTH = 2000
    MAX_FILENAME_LENGTH = 255
    MAX_JSON_DEPTH = 10
    MAX_JSON_SIZE = 10 * 1024 * 1024  # 10MB
    
    # Allowed file extensions
    ALLOWED_EXTENSIONS = {'json', 'html'}
    
    # Reserved slugs that shouldn't be treated as usernames
    RESERVED_SLUGS = {
        'accounts', 'about', 'explore', 'developer', 'developers', 'legal', 'directory',
        'subscriptions', 'privacy', 'terms', 'blog', 'press', 'api', 'p', 'stories',
        'reels', 'reel', 'tv', 'igtv', 'challenge', 'session', 'ads', 'help', 'meta',
        'web', 'oauth', 'graphql', 'notifications', 'accountscenter', 'download',
        'locations', 'emails', 'n', 'policies'
    }
    
    @staticmethod
    def validate_username(username: str) -> bool:
        """Validate Instagram username format"""
        if not username or not isinstance(username, str):
            return False
        username = username.strip().lower()
        if username in InputValidator.RESERVED_SLUGS:
            return False
        return bool(InputValidator.USERNAME_PATTERN.match(username))
    
    @staticmethod
    def sanitize_string(value: Any, max_length: int = None) -> str:
        """
        Sanitize string input by removing dangerous characters
        
        Args:
            value: Input value to sanitize
            max_length: Maximum allowed length
        """
        if value is None:
            return ""
        
        if not isinstance(value, str):
            value = str(value)
        
        # Remove null bytes and control characters (except newlines and tabs)
        sanitized = re.sub(r'[\x00-\x08\x0b-\x0c\x0e-\x1f]', '', value)
        
        # Limit length
        if max_length:
            sanitized = sanitized[:max_length]
        
        return sanitized.strip()
    
    @staticmethod
    def validate_json_payload(data: Any, max_size: int = None) -> Dict:
        """
        Validate JSON payload structure and size
        
        Args:
            data: JSON data (dict or list)
            max_size: Maximum size in bytes (approximate)
        """
        if data is None:
            raise ValidationError("JSON payload is required")
        
        # Check size (approximate)
        if max_size:
            json_str = json.dumps(data)
            if len(json_str.encode('utf-8')) > max_size:
                raise ValidationError(f"Payload too large. Maximum size: {max_size} bytes")
        
        # Check depth
        def check_depth(obj, depth=0):
            if depth > InputValidator.MAX_JSON_DEPTH:
                raise ValidationError("JSON structure too deeply nested")
            if isinstance(obj, dict):
                for v in obj.values():
                    check_depth(v, depth + 1)
            elif isinstance(obj, list):
                for item in obj:
                    check_depth(item, depth + 1)
        
        check_depth(data)
        
        return data
    
    @staticmethod
    def validate_query_string(query: str) -> str:
        """Validate and sanitize query string"""
        if not query or not isinstance(query, str):
            raise ValidationError("Query string is required")
        
        sanitized = InputValidator.sanitize_string(query, InputValidator.MAX_QUERY_LENGTH)
        
        if len(sanitized) == 0:
            raise ValidationError("Query string cannot be empty")
        
        return sanitized
    
    @staticmethod
    def validate_message(message: str) -> str:
        """Validate and sanitize chat message"""
        if not message or not isinstance(message, str):
            raise ValidationError("Message is required")
        
        sanitized = InputValidator.sanitize_string(message, InputValidator.MAX_MESSAGE_LENGTH)
        
        if len(sanitized.strip()) == 0:
            raise ValidationError("Message cannot be empty")
        
        return sanitized.strip()
    
    @staticmethod
    def validate_file(file: FileStorage, max_size: int = None) -> Tuple[str, bytes]:
        """
        Validate uploaded file
        
        Returns:
            (filename, file_content_bytes)
        """
        if not file or not file.filename:
            raise ValidationError("File is required")
        
        # Validate filename
        filename = InputValidator.sanitize_string(file.filename, InputValidator.MAX_FILENAME_LENGTH)
        
        # Check extension
        if '.' not in filename:
            raise ValidationError("File must have an extension")
        
        ext = filename.rsplit('.', 1)[1].lower()
        if ext not in InputValidator.ALLOWED_EXTENSIONS:
            raise ValidationError(f"File type not allowed. Allowed types: {', '.join(InputValidator.ALLOWED_EXTENSIONS)}")
        
        # Read file content
        file.seek(0, 2)  # Seek to end
        size = file.tell()
        file.seek(0)  # Reset to beginning
        
        if size == 0:
            raise ValidationError("File is empty")
        
        if max_size and size > max_size:
            raise ValidationError(f"File too large. Maximum size: {max_size / (1024*1024):.1f}MB")
        
        content = file.read()
        
        # Basic content validation
        if ext == 'json':
            try:
                json.loads(content.decode('utf-8'))
            except (UnicodeDecodeError, json.JSONDecodeError) as e:
                raise ValidationError(f"Invalid JSON file: {str(e)}")
        
        return filename, content
    
    @staticmethod
    def validate_accounts_list(accounts: List[Dict], max_count: int = 100) -> List[Dict]:
        """
        Validate list of account objects
        
        Args:
            accounts: List of account dictionaries
            max_count: Maximum number of accounts allowed
        """
        if not isinstance(accounts, list):
            raise ValidationError("Accounts must be a list")
        
        if len(accounts) == 0:
            raise ValidationError("At least one account is required")
        
        if len(accounts) > max_count:
            raise ValidationError(f"Too many accounts. Maximum: {max_count}")
        
        validated_accounts = []
        for i, account in enumerate(accounts):
            if not isinstance(account, dict):
                raise ValidationError(f"Account at index {i} must be a dictionary")
            
            # Validate username
            username = account.get('username', '')
            if not InputValidator.validate_username(username):
                raise ValidationError(f"Invalid username at index {i}: {username}")
            
            # Sanitize other fields
            validated_account = {
                'username': username.lower().strip(),
                'fullName': InputValidator.sanitize_string(account.get('fullName', ''), 200) or None,
                'bio': InputValidator.sanitize_string(account.get('bio', ''), 500) or None,
                'followersCount': InputValidator._validate_int(account.get('followersCount'), 0, 10**9),
                'followingCount': InputValidator._validate_int(account.get('followingCount'), 0, 10**9),
                'nonFollower': bool(account.get('nonFollower', False))
            }
            validated_accounts.append(validated_account)
        
        return validated_accounts
    
    @staticmethod
    def _validate_int(value: Any, min_val: int = None, max_val: int = None) -> Optional[int]:
        """Validate integer value"""
        if value is None:
            return None
        
        try:
            int_val = int(value)
            if min_val is not None and int_val < min_val:
                return min_val
            if max_val is not None and int_val > max_val:
                return max_val
            return int_val
        except (ValueError, TypeError):
            return None
    
    @staticmethod
    def validate_query_param(value: Any, allowed_values: List[str] = None, max_length: int = 100) -> str:
        """
        Validate and sanitize query parameter
        
        Args:
            value: Query parameter value
            allowed_values: List of allowed values (if None, any value is allowed)
            max_length: Maximum length of the parameter
        """
        if value is None:
            return ""
        
        sanitized = InputValidator.sanitize_string(value, max_length)
        
        if allowed_values and sanitized not in allowed_values:
            # Return first allowed value as default
            return allowed_values[0] if allowed_values else ""
        
        return sanitized
    
    @staticmethod
    def sanitize_sql_input(value: Any) -> str:
        """
        Sanitize input for SQL queries (defensive measure)
        
        WARNING: This is a basic sanitizer and should NOT be relied upon as the primary
        defense against SQL injection. Always use parameterized queries when working with
        databases. This method is provided as a secondary defense layer only.
        
        Example of safe database access:
            # ✅ GOOD - Use parameterized queries
            cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
            
            # ❌ BAD - String concatenation (vulnerable to SQL injection)
            cursor.execute(f"SELECT * FROM users WHERE username = '{username}'")
        
        This is a basic sanitizer - always use parameterized queries in production!
        """
        if value is None:
            return ""
        
        value = str(value)
        
        # Remove SQL injection patterns (defensive, but parameterized queries are better)
        dangerous_patterns = [
            r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)",
            r"(--|#|/\*|\*/)",
            r"(\bor\b|\band\b)\s+\d+\s*=\s*\d+",
            r"('|(\\')|(;)|(\|)|(&))",
        ]
        
        sanitized = value
        for pattern in dangerous_patterns:
            sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE)
        
        return sanitized.strip()


# Global validator instance
validator = InputValidator()

