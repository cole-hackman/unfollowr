"""
Admin Analytics Module for Unfollowr
Handles data collection, processing, and dashboard metrics
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
import hashlib


@dataclass
class AnalyticsEvent:
    """Single analytics event"""
    session_id: str
    event_type: str  # upload_start, ai_query, export_generated, session_start, etc.
    timestamp: datetime
    metadata: Dict = None
    
    def to_dict(self):
        return {
            'session_id': self.session_id,
            'event_type': self.event_type,
            'timestamp': self.timestamp.isoformat(),
            'metadata': self.metadata or {}
        }


@dataclass
class SessionSummary:
    """Summary of a user session"""
    session_id: str
    date: datetime
    actions: str
    duration: str
    status: str


class AdminAnalytics:
    """Analytics system for admin dashboard"""
    
    def __init__(self, data_file='analytics_events.json'):
        self.data_file = data_file
        self.events = self._load_events()
    
    def _load_events(self) -> List[AnalyticsEvent]:
        """Load analytics events from storage"""
        if not os.path.exists(self.data_file):
            return []
        
        try:
            with open(self.data_file, 'r') as f:
                data = json.load(f)
                events = []
                for item in data:
                    event = AnalyticsEvent(
                        session_id=item['session_id'],
                        event_type=item['event_type'],
                        timestamp=datetime.fromisoformat(item['timestamp']),
                        metadata=item.get('metadata', {})
                    )
                    events.append(event)
                return events
        except (json.JSONDecodeError, KeyError, ValueError):
            return []
    
    def _save_events(self):
        """Save events to storage"""
        data = [event.to_dict() for event in self.events]
        with open(self.data_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def log_event(self, session_id: str, event_type: str, metadata: Dict = None):
        """Log a new analytics event"""
        event = AnalyticsEvent(
            session_id=session_id,
            event_type=event_type,
            timestamp=datetime.now(),
            metadata=metadata or {}
        )
        self.events.append(event)
        self._save_events()
    
    def get_metrics(self) -> Dict:
        """Get overview metrics for dashboard"""
        now = datetime.now()
        week_ago = now - timedelta(days=7)
        
        # Get events from this week and last week for comparison
        this_week = [e for e in self.events if e.timestamp >= week_ago]
        last_week = [e for e in self.events if week_ago - timedelta(days=7) <= e.timestamp < week_ago]
        
        # Calculate metrics
        total_users = len(set(e.session_id for e in self.events))
        total_uploads = len([e for e in self.events if e.event_type == 'upload_completed'])
        ai_analyses = len([e for e in self.events if e.event_type == 'ai_classification'])
        total_exports = len([e for e in self.events if e.event_type == 'export_generated'])
        
        # Calculate changes
        this_week_users = len(set(e.session_id for e in this_week))
        last_week_users = len(set(e.session_id for e in last_week))
        users_change = self._calculate_change(this_week_users, last_week_users)
        
        this_week_uploads = len([e for e in this_week if e.event_type == 'upload_completed'])
        last_week_uploads = len([e for e in last_week if e.event_type == 'upload_completed'])
        uploads_change = self._calculate_change(this_week_uploads, last_week_uploads)
        
        this_week_ai = len([e for e in this_week if e.event_type == 'ai_classification'])
        last_week_ai = len([e for e in last_week if e.event_type == 'ai_classification'])
        ai_change = self._calculate_change(this_week_ai, last_week_ai)
        
        this_week_exports = len([e for e in this_week if e.event_type == 'export_generated'])
        last_week_exports = len([e for e in last_week if e.event_type == 'export_generated'])
        exports_change = self._calculate_change(this_week_exports, last_week_exports)
        
        # Active sessions (last 24 hours)
        day_ago = now - timedelta(days=1)
        active_sessions = len(set(e.session_id for e in self.events if e.timestamp >= day_ago))
        
        yesterday = day_ago - timedelta(days=1)
        yesterday_sessions = len(set(e.session_id for e in self.events if yesterday <= e.timestamp < day_ago))
        sessions_change = self._calculate_change(active_sessions, yesterday_sessions)
        
        return {
            'total_users': total_users,
            'total_uploads': total_uploads,
            'ai_analyses': ai_analyses,
            'total_exports': total_exports,
            'active_sessions': active_sessions,
            'users_change': users_change,
            'uploads_change': uploads_change,
            'ai_change': ai_change,
            'exports_change': exports_change,
            'sessions_change': sessions_change
        }
    
    def _calculate_change(self, current: int, previous: int) -> int:
        """Calculate percentage change"""
        if previous == 0:
            return 100 if current > 0 else 0
        return round(((current - previous) / previous) * 100)
    
    def get_chart_data(self, days: int = 7) -> Dict:
        """Get data for charts"""
        now = datetime.now()
        start_date = now - timedelta(days=days)
        
        # Generate date labels
        labels = []
        usage_data = []
        
        for i in range(days):
            date = start_date + timedelta(days=i)
            labels.append(date.strftime('%m/%d'))
            
            # Count uploads for this day
            day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            day_uploads = len([
                e for e in self.events 
                if e.event_type == 'upload_completed' and day_start <= e.timestamp < day_end
            ])
            usage_data.append(day_uploads)
        
        # AI feature usage data
        ai_queries = len([e for e in self.events if e.event_type == 'ai_query'])
        ai_classifications = len([e for e in self.events if e.event_type == 'ai_classification'])
        ai_suggestions = len([e for e in self.events if e.event_type == 'ai_suggestion'])
        ai_filters = len([e for e in self.events if e.event_type == 'ai_filter'])
        
        # User segments (AI vs Basic)
        ai_users = len(set(e.session_id for e in self.events if e.event_type.startswith('ai_')))
        total_users = len(set(e.session_id for e in self.events))
        basic_users = total_users - ai_users
        
        return {
            'usage_labels': labels,
            'usage_data': usage_data,
            'ai_data': [ai_queries, ai_classifications, ai_suggestions, ai_filters],
            'segment_data': [ai_users, basic_users]
        }
    
    def get_recent_sessions(self, limit: int = 20) -> List[SessionSummary]:
        """Get recent session summaries"""
        # Group events by session
        sessions = {}
        for event in self.events:
            if event.session_id not in sessions:
                sessions[event.session_id] = []
            sessions[event.session_id].append(event)
        
        # Create session summaries
        summaries = []
        for session_id, events in sessions.items():
            if not events:
                continue
                
            events.sort(key=lambda e: e.timestamp)
            start_time = events[0].timestamp
            end_time = events[-1].timestamp
            duration = end_time - start_time
            
            # Format duration
            if duration.total_seconds() < 60:
                duration_str = f"{int(duration.total_seconds())}s"
            elif duration.total_seconds() < 3600:
                duration_str = f"{int(duration.total_seconds() / 60)}m"
            else:
                duration_str = f"{int(duration.total_seconds() / 3600)}h"
            
            # Determine actions
            action_types = set(e.event_type for e in events)
            actions = ", ".join(sorted(action_types))
            
            # Determine status
            has_error = any('error' in e.event_type for e in events)
            status = 'error' if has_error else 'completed'
            
            summary = SessionSummary(
                session_id=session_id,
                date=start_time,
                actions=actions,
                duration=duration_str,
                status=status
            )
            summaries.append(summary)
        
        # Sort by date (newest first) and limit
        summaries.sort(key=lambda s: s.date, reverse=True)
        return summaries[:limit]
    
    def export_csv_data(self) -> str:
        """Export analytics data as CSV string"""
        import csv
        import io
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['Session ID', 'Event Type', 'Timestamp', 'Metadata'])
        
        # Write events
        for event in self.events:
            writer.writerow([
                event.session_id,
                event.event_type,
                event.timestamp.isoformat(),
                json.dumps(event.metadata) if event.metadata else ''
            ])
        
        return output.getvalue()
    
    def generate_session_id(self, request) -> str:
        """Generate a consistent session ID from request data"""
        # Use IP address and user agent to create a hash
        ip = request.environ.get('REMOTE_ADDR', 'unknown')
        user_agent = request.environ.get('HTTP_USER_AGENT', 'unknown')
        timestamp = datetime.now().strftime('%Y-%m-%d')  # Daily session reset
        
        session_data = f"{ip}:{user_agent}:{timestamp}"
        return hashlib.md5(session_data.encode()).hexdigest()


# Global analytics instance
analytics = AdminAnalytics()