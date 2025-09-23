"""
Enhanced connection classification with guaranteed base categories and heuristic tagging
Implements PRD: Guaranteed + Heuristic Categories for Unfollowr
"""

import json
import os
import re
from typing import Dict, List, Set, Optional, Tuple
from dataclasses import dataclass
import logging


@dataclass
class ClassifiedAccount:
    username: str
    full_name: Optional[str]
    buckets: List[str]  # ['unfollowers', 'fans', 'mutuals']
    tags: List[str]     # ['brand', 'sports', 'celebrity', 'creator', 'other']
    reasons: List[str]  # Explanations for classifications


class ConnectionClassifier:
    """Enhanced classifier with guaranteed base categories and heuristic tagging"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.brand_keywords = {
            'official', 'store', 'inc', 'brand', 'shop', 'co', 'app', 'io', 'hq', 'labs',
            'company', 'corp', 'ltd', 'llc', 'group', 'team', 'studio', 'agency', 'network',
            'media', 'news', 'tech', 'digital', 'online', 'global', 'international'
        }
        
        self.sports_keywords = {
            'fc', 'cf', 'f1', 'ufc', 'nba', 'nfl', 'mlb', 'nhl', 'mls', 'fifa', 'uefa',
            'olympics', 'formula1', 'nascar', 'pga', 'masters', 'usopen', 'wimbledon',
            'sports', 'basketball', 'football', 'soccer', 'baseball', 'hockey', 'tennis'
        }
        
        self.celebrity_keywords = {
            'official', 'real', 'theofficial', 'tv', 'actor', 'actress', 'music', 'dj', 
            'artist', 'singer', 'rapper', 'musician', 'comedian', 'author', 'writer',
            'director', 'producer', 'model', 'influencer', 'youtuber', 'tiktoker'
        }
        
        self.creator_keywords = {
            'content', 'creator', 'influencer', 'blogger', 'youtuber', 'tiktoker', 'streamer',
            'photographer', 'designer', 'artist', 'filmmaker', 'podcaster', 'coach', 'trainer',
            'fitness', 'lifestyle', 'travel', 'food', 'fashion', 'beauty', 'gaming', 'tech'
        }
        
        # Load curated allowlists
        self.brands_allowlist = self._load_allowlist('data/brands.json')
        self.sports_allowlist = self._load_allowlist('data/sports.json')
        self.celebrities_allowlist = self._load_allowlist('data/celebrities.json')
    
    def _load_allowlist(self, filepath: str) -> Set[str]:
        """Load curated allowlist from JSON file"""
        try:
            if os.path.exists(filepath):
                with open(filepath, 'r') as f:
                    items = json.load(f)
                return set(item.lower().strip() for item in items if item.strip())
            else:
                self.logger.warning(f"Allowlist file not found: {filepath}")
                return set()
        except Exception as e:
            self.logger.error(f"Error loading allowlist {filepath}: {e}")
            return set()
    
    def classify_connections(self, followers: List[Dict], following: List[Dict]) -> List[ClassifiedAccount]:
        """
        Main classification method implementing guaranteed base categories + heuristic tagging
        
        Args:
            followers: List of accounts that follow the user (they -> you)
            following: List of accounts the user follows (you -> them)
            
        Returns:
            List of ClassifiedAccount objects with buckets and tags
        """
        self.logger.info(f"Starting classification with {len(followers)} followers and {len(following)} following")
        
        # Normalize usernames (remove @, lowercase, trim)
        def normalize_username(username):
            if not username:
                return ""
            return str(username).strip().replace('@', '').lower()
        
        # Convert to sets for fast lookup with normalized usernames
        followers_set = {normalize_username(acc.get('username')) for acc in followers if acc.get('username')}
        following_set = {normalize_username(acc.get('username')) for acc in following if acc.get('username')}
        
        # Remove empty usernames
        followers_set.discard('')
        following_set.discard('')
        
        # Create lookup dictionaries for full names
        followers_dict = {}
        for acc in followers:
            username = normalize_username(acc.get('username'))
            if username:
                followers_dict[username] = acc
                
        following_dict = {}
        for acc in following:
            username = normalize_username(acc.get('username'))
            if username:
                following_dict[username] = acc
        
        self.logger.info(f"Normalized: {len(followers_set)} followers, {len(following_set)} following")
        
        # Get all unique accounts with proper relationship tracking
        all_accounts = {}
        
        # Add followers (they -> you)
        for username_norm in followers_set:
            acc = followers_dict.get(username_norm, {})
            all_accounts[username_norm] = {
                'username': acc.get('username', username_norm),
                'full_name': acc.get('full_name') or acc.get('fullName'),
                'they_follow_you': True,
                'you_follow_them': username_norm in following_set
            }
        
        # Add following accounts not already tracked (you -> them)
        for username_norm in following_set:
            if username_norm not in all_accounts:
                acc = following_dict.get(username_norm, {})
                all_accounts[username_norm] = {
                    'username': acc.get('username', username_norm),
                    'full_name': acc.get('full_name') or acc.get('fullName'),
                    'they_follow_you': False,
                    'you_follow_them': True
                }
        
        classified_accounts = []
        
        for username_norm, account_data in all_accounts.items():
            # Determine base categories (guaranteed)
            buckets = []
            base_reasons = []
            
            they_follow_you = account_data['they_follow_you']
            you_follow_them = account_data['you_follow_them']
            
            # Core logic: determine relationship type
            if you_follow_them and not they_follow_you:
                buckets.append('unfollowers')
                base_reasons.append('You follow them, they don\'t follow back')
            elif they_follow_you and not you_follow_them:
                buckets.append('fans')
                base_reasons.append('They follow you, you don\'t follow back')
            elif they_follow_you and you_follow_them:
                buckets.append('mutuals')
                base_reasons.append('Mutual following relationship')
            else:
                # Edge case: neither follows the other (shouldn't happen with our data)
                buckets.append('unknown')
                base_reasons.append('No following relationship detected')
            
            # Apply heuristic tagging
            tags, heuristic_reasons = self._classify_heuristic_tags(
                account_data['username'], 
                account_data['full_name']
            )
            
            # Combine all reasons
            all_reasons = base_reasons + heuristic_reasons
            
            classified_accounts.append(ClassifiedAccount(
                username=account_data['username'],
                full_name=account_data['full_name'],
                buckets=buckets,
                tags=tags,
                reasons=all_reasons
            ))
        
        self.logger.info(f"Classified {len(classified_accounts)} accounts: "
                        f"Unfollowers: {sum(1 for acc in classified_accounts if 'unfollowers' in acc.buckets)}, "
                        f"Fans: {sum(1 for acc in classified_accounts if 'fans' in acc.buckets)}, "
                        f"Mutuals: {sum(1 for acc in classified_accounts if 'mutuals' in acc.buckets)}")
        
        return classified_accounts
    
    def _classify_heuristic_tags(self, username: str, full_name: Optional[str]) -> Tuple[List[str], List[str]]:
        """Apply heuristic tagging based on username and full name"""
        username_lower = username.lower()
        full_name_lower = (full_name or '').lower()
        text_content = f"{username_lower} {full_name_lower}".strip()
        
        tags = []
        reasons = []
        
        # Check allowlists first (highest priority)
        if username_lower in self.brands_allowlist:
            tags.append('brand')
            reasons.append(f"Found in brands allowlist")
        elif username_lower in self.sports_allowlist:
            tags.append('sports')
            reasons.append(f"Found in sports allowlist")
        elif username_lower in self.celebrities_allowlist:
            tags.append('celebrity')
            reasons.append(f"Found in celebrities allowlist")
        
        # If no allowlist match, apply keyword matching
        if not tags:
            # Brand detection
            brand_matches = [kw for kw in self.brand_keywords if kw in text_content]
            if brand_matches:
                tags.append('brand')
                reasons.append(f"Brand keywords: {', '.join(brand_matches[:3])}")
            
            # Sports detection
            sports_matches = [kw for kw in self.sports_keywords if kw in text_content]
            if sports_matches:
                tags.append('sports')
                reasons.append(f"Sports keywords: {', '.join(sports_matches[:3])}")
            
            # Celebrity detection
            celebrity_matches = [kw for kw in self.celebrity_keywords if kw in text_content]
            if celebrity_matches:
                tags.append('celebrity')
                reasons.append(f"Celebrity keywords: {', '.join(celebrity_matches[:3])}")
            
            # Creator detection
            creator_matches = [kw for kw in self.creator_keywords if kw in text_content]
            if creator_matches:
                tags.append('creator')
                reasons.append(f"Creator keywords: {', '.join(creator_matches[:3])}")
        
        # If no specific tags found, mark as 'other'
        if not tags:
            tags.append('other')
            reasons.append('No specific category detected')
        
        return tags, reasons
    
    def get_category_counts(self, classified_accounts: List[ClassifiedAccount]) -> Dict[str, int]:
        """Get counts for each category"""
        counts = {
            'unfollowers': 0,
            'fans': 0,
            'mutuals': 0,
            'brand': 0,
            'sports': 0,
            'celebrity': 0,
            'creator': 0,
            'other': 0,
            'unknown': 0
        }
        
        for account in classified_accounts:
            # Count base categories (buckets)
            for bucket in account.buckets:
                if bucket in counts:
                    counts[bucket] += 1
            
            # Count heuristic tags
            for tag in account.tags:
                if tag in counts:
                    counts[tag] += 1
        
        self.logger.info(f"Category counts computed: {counts}")
        return counts


# Global classifier instance
connection_classifier = ConnectionClassifier()