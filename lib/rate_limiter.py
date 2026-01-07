"""
Rate limiting utilities for Flask endpoints
Uses in-memory storage (can be upgraded to Redis for production)
"""

import time
from collections import defaultdict
from functools import wraps
from flask import request, jsonify
from typing import Dict, Tuple


class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self):
        # Store: {identifier: [(timestamp, count), ...]}
        self.requests: Dict[str, list] = defaultdict(list)
        self.cleanup_interval = 300  # Clean up old entries every 5 minutes
        self.last_cleanup = time.time()
    
    def _get_identifier(self, request) -> str:
        """Get unique identifier for rate limiting"""
        # Use IP address for identification
        ip = request.environ.get('REMOTE_ADDR', 'unknown')
        # In production, consider using X-Forwarded-For header handling
        forwarded_for = request.environ.get('HTTP_X_FORWARDED_FOR')
        if forwarded_for:
            # Take the first IP in the chain
            ip = forwarded_for.split(',')[0].strip()
        return ip
    
    def _cleanup_old_entries(self, window_seconds: int):
        """Remove entries older than the time window"""
        current_time = time.time()
        if current_time - self.last_cleanup < self.cleanup_interval:
            return
        
        cutoff_time = current_time - window_seconds
        for identifier in list(self.requests.keys()):
            self.requests[identifier] = [
                (ts, count) for ts, count in self.requests[identifier]
                if ts > cutoff_time
            ]
            if not self.requests[identifier]:
                del self.requests[identifier]
        
        self.last_cleanup = current_time
    
    def is_allowed(self, request, max_requests: int, window_seconds: int) -> Tuple[bool, Dict]:
        """
        Check if request is allowed under rate limit
        
        Returns:
            (is_allowed, info_dict)
        """
        identifier = self._get_identifier(request)
        current_time = time.time()
        
        # Cleanup old entries periodically
        self._cleanup_old_entries(window_seconds)
        
        # Get requests in the current window
        cutoff_time = current_time - window_seconds
        recent_requests = [
            (ts, count) for ts, count in self.requests[identifier]
            if ts > cutoff_time
        ]
        
        # Count total requests in window
        total_requests = sum(count for _, count in recent_requests)
        
        if total_requests >= max_requests:
            # Calculate retry after
            oldest_request = min(ts for ts, _ in recent_requests) if recent_requests else current_time
            retry_after = int(window_seconds - (current_time - oldest_request)) + 1
            
            return False, {
                'limit': max_requests,
                'window': window_seconds,
                'remaining': 0,
                'retry_after': retry_after
            }
        
        # Record this request
        self.requests[identifier].append((current_time, 1))
        
        return True, {
            'limit': max_requests,
            'window': window_seconds,
            'remaining': max_requests - total_requests - 1,
            'retry_after': None
        }


# Global rate limiter instance
rate_limiter = RateLimiter()


def rate_limit(max_requests: int = 10, window_seconds: int = 60):
    """
    Decorator for rate limiting Flask endpoints
    
    Args:
        max_requests: Maximum number of requests allowed
        window_seconds: Time window in seconds
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            is_allowed, info = rate_limiter.is_allowed(request, max_requests, window_seconds)
            
            if not is_allowed:
                response = jsonify({
                    'error': 'Rate limit exceeded',
                    'message': f'Too many requests. Please try again in {info["retry_after"]} seconds.',
                    'retry_after': info['retry_after']
                })
                response.status_code = 429
                response.headers['Retry-After'] = str(info['retry_after'])
                response.headers['X-RateLimit-Limit'] = str(info['limit'])
                response.headers['X-RateLimit-Remaining'] = str(info['remaining'])
                response.headers['X-RateLimit-Reset'] = str(int(time.time()) + info['retry_after'])
                return response
            
            # Add rate limit headers to successful responses
            response = f(*args, **kwargs)
            if hasattr(response, 'headers'):
                response.headers['X-RateLimit-Limit'] = str(info['limit'])
                response.headers['X-RateLimit-Remaining'] = str(info['remaining'])
            return response
        
        return decorated_function
    return decorator

