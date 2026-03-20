import hashlib
import logging
import os
import uuid
from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse

import psycopg2
from psycopg2.extras import Json, RealDictCursor


CREATE_ANALYTICS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    metadata JSONB DEFAULT '{}',
    session_id VARCHAR(64),
    ip_hash VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
"""

CREATE_ANALYTICS_INDEXES_SQL = """
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
"""

ALLOWED_EVENT_TYPES = {"analysis_run", "page_view", "ai_classification"}
SESSION_COOKIE_NAME = "unfollowr_sid"

_schema_initialized = False


def get_database_url() -> Optional[str]:
    return os.environ.get("DATABASE_URL")


def get_connection():
    database_url = get_database_url()
    if not database_url:
        raise RuntimeError("DATABASE_URL is not configured")
    return psycopg2.connect(database_url)


def ensure_schema() -> bool:
    global _schema_initialized

    if _schema_initialized:
        return True

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(CREATE_ANALYTICS_TABLE_SQL)
                cur.execute(CREATE_ANALYTICS_INDEXES_SQL)
        _schema_initialized = True
        return True
    except Exception as exc:
        logging.error("Analytics schema initialization failed: %s", exc)
        return False


def is_available() -> bool:
    return bool(get_database_url()) and ensure_schema()


def get_client_ip(request) -> str:
    forwarded_for = request.headers.get("X-Forwarded-For", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.headers.get("X-Real-IP") or request.remote_addr or "unknown"


def hash_ip(request) -> str:
    return hashlib.sha256(get_client_ip(request).encode("utf-8")).hexdigest()


def get_or_create_session_id(request) -> Tuple[str, bool]:
    existing = request.cookies.get(SESSION_COOKIE_NAME, "")
    if existing and len(existing) <= 64:
        return existing, False
    return uuid.uuid4().hex, True


def sanitize_event_type(event_type: Any) -> Optional[str]:
    if not isinstance(event_type, str):
        return None
    event_type = event_type.strip()
    if event_type not in ALLOWED_EVENT_TYPES:
        return None
    return event_type


def sanitize_metadata(metadata: Any) -> Dict[str, Any]:
    if not isinstance(metadata, dict):
        return {}
    return metadata


def insert_event(request, event_type: str, metadata: Optional[Dict[str, Any]] = None) -> Tuple[bool, str, bool]:
    if not ensure_schema():
        return False, "", False

    session_id, is_new = get_or_create_session_id(request)
    payload = sanitize_metadata(metadata)

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO analytics_events (event_type, metadata, session_id, ip_hash)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (event_type, Json(payload), session_id, hash_ip(request)),
                )
        return True, session_id, is_new
    except Exception as exc:
        logging.error("Analytics insert failed: %s", exc)
        return False, session_id, is_new


def format_period_label(range_value: str) -> str:
    if range_value == "24h":
        return "past 24 hours"
    if range_value == "28d":
        return "past 28 days"
    return "past 7 days"


def parse_range(range_value: str) -> Dict[str, Any]:
    now = datetime.now(timezone.utc)

    if range_value == "24h":
        delta = timedelta(hours=24)
        bucket = "hour"
        step = timedelta(hours=1)
    elif range_value == "28d":
        delta = timedelta(days=28)
        bucket = "day"
        step = timedelta(days=1)
    else:
        range_value = "7d"
        delta = timedelta(days=7)
        bucket = "day"
        step = timedelta(days=1)

    current_start = now - delta
    previous_start = current_start - delta

    return {
        "range": range_value,
        "bucket": bucket,
        "step": step,
        "now": now,
        "current_start": current_start,
        "previous_start": previous_start,
        "current_end": now,
        "previous_end": current_start,
        "label": format_period_label(range_value),
    }


def _fetch_count(
    event_type: str,
    start: datetime,
    end: datetime,
    distinct_session: bool = False,
) -> int:
    if not ensure_schema():
        return 0

    select = "COUNT(DISTINCT session_id)" if distinct_session else "COUNT(*)"

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                SELECT {select}
                FROM analytics_events
                WHERE event_type = %s
                  AND created_at >= %s
                  AND created_at < %s
                """,
                (event_type, start, end),
            )
            return int(cur.fetchone()[0] or 0)


def get_kpis(range_value: str) -> Dict[str, Any]:
    period = parse_range(range_value)

    def metric(event_type: str, distinct_session: bool = False) -> Dict[str, Any]:
        return {
            "current": _fetch_count(event_type, period["current_start"], period["current_end"], distinct_session),
            "previous": _fetch_count(event_type, period["previous_start"], period["previous_end"], distinct_session),
            "period": period["label"],
        }

    return {
        "analyses": metric("analysis_run"),
        "page_views": metric("page_view"),
        "unique_users": metric("page_view", distinct_session=True),
        "ai_classifications": metric("ai_classification"),
    }


def _get_timeseries(event_type: str, start: datetime, end: datetime, bucket: str) -> Dict[datetime, int]:
    if not ensure_schema():
        return {}

    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                f"""
                SELECT date_trunc(%s, created_at) AS bucket_ts, COUNT(*) AS value
                FROM analytics_events
                WHERE event_type = %s
                  AND created_at >= %s
                  AND created_at < %s
                GROUP BY 1
                ORDER BY 1 ASC
                """,
                (bucket, event_type, start, end),
            )
            rows = cur.fetchall()

    return {row["bucket_ts"]: int(row["value"]) for row in rows}


def _build_series(
    counts: Dict[datetime, int],
    start: datetime,
    points: int,
    step: timedelta,
    bucket: str,
) -> List[Dict[str, Any]]:
    series: List[Dict[str, Any]] = []

    for index in range(points):
        dt = start + (step * index)
        bucket_dt = dt.replace(minute=0, second=0, microsecond=0) if bucket == "hour" else dt.replace(hour=0, minute=0, second=0, microsecond=0)
        label = bucket_dt.strftime("%H:%M") if bucket == "hour" else bucket_dt.strftime("%b %-d")
        if "%" in label:
            label = bucket_dt.strftime("%b %d").replace(" 0", " ")
        series.append(
            {
                "date": bucket_dt.isoformat(),
                "label": label,
                "value": int(counts.get(bucket_dt, 0)),
            }
        )

    return series


def get_trends(range_value: str) -> Dict[str, Any]:
    period = parse_range(range_value)
    if period["bucket"] == "hour":
        points = 24
    else:
        points = 28 if period["range"] == "28d" else 7

    current_analyses = _get_timeseries("analysis_run", period["current_start"], period["current_end"], period["bucket"])
    previous_analyses = _get_timeseries("analysis_run", period["previous_start"], period["previous_end"], period["bucket"])
    current_page_views = _get_timeseries("page_view", period["current_start"], period["current_end"], period["bucket"])
    previous_page_views = _get_timeseries("page_view", period["previous_start"], period["previous_end"], period["bucket"])

    return {
        "period": period["label"],
        "analyses": {
            "current": _build_series(current_analyses, period["current_start"], points, period["step"], period["bucket"]),
            "previous": _build_series(previous_analyses, period["previous_start"], points, period["step"], period["bucket"]),
        },
        "page_views": {
            "current": _build_series(current_page_views, period["current_start"], points, period["step"], period["bucket"]),
            "previous": _build_series(previous_page_views, period["previous_start"], points, period["step"], period["bucket"]),
        },
    }


def _fetch_analysis_rows(start: datetime, end: datetime) -> List[Dict[str, Any]]:
    if not ensure_schema():
        return []

    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT metadata, created_at, session_id
                FROM analytics_events
                WHERE event_type = 'analysis_run'
                  AND created_at >= %s
                  AND created_at < %s
                ORDER BY created_at DESC
                """,
                (start, end),
            )
            return list(cur.fetchall())


def _fetch_page_view_rows(start: datetime, end: datetime) -> List[Dict[str, Any]]:
    if not ensure_schema():
        return []

    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT metadata, created_at, session_id
                FROM analytics_events
                WHERE event_type = 'page_view'
                  AND created_at >= %s
                  AND created_at < %s
                ORDER BY created_at DESC
                """,
                (start, end),
            )
            return list(cur.fetchall())


def _extract_referrer_domain(referrer: str) -> str:
    if not referrer:
        return "direct"
    try:
        parsed = urlparse(referrer)
        return parsed.netloc or "direct"
    except Exception:
        return "direct"


def _format_duration(avg_seconds: float) -> str:
    seconds = max(int(round(avg_seconds)), 0)
    minutes, secs = divmod(seconds, 60)
    if minutes:
        return f"{minutes}m {secs:02d}s"
    return f"{secs}s"


def get_breakdowns(range_value: str) -> Dict[str, Any]:
    period = parse_range(range_value)
    analyses = _fetch_analysis_rows(period["current_start"], period["current_end"])
    page_views = _fetch_page_view_rows(period["current_start"], period["current_end"])

    format_counts = Counter()
    non_followers_total = 0
    fans_total = 0
    mutuals_total = 0
    accounts_total = 0

    for row in analyses:
        metadata = row.get("metadata") or {}
        export_format = str(metadata.get("export_format") or "Unknown").upper()
        format_counts[export_format] += 1
        non_followers_total += int(metadata.get("non_followers") or 0)
        fans_total += int(metadata.get("fans") or 0)
        mutuals_total += int(metadata.get("mutuals") or 0)
        accounts_total += int(metadata.get("accounts_count") or 0)

    total_formats = sum(format_counts.values()) or 1
    export_formats = [
        {"label": label, "value": round((count / total_formats) * 100)}
        for label, count in format_counts.most_common()
    ] or [
        {"label": "HTML", "value": 0},
        {"label": "JSON", "value": 0},
    ]

    relationship_total = non_followers_total + fans_total + mutuals_total or 1
    account_categories = [
        {"label": "Non-followers", "value": round((non_followers_total / relationship_total) * 100), "color": "#EF4444"},
        {"label": "Mutuals", "value": round((mutuals_total / relationship_total) * 100), "color": "#22C55E"},
        {"label": "Fans", "value": round((fans_total / relationship_total) * 100), "color": "#F59E0B"},
    ]

    source_counts = Counter()
    page_counts = Counter()
    sessions: Dict[str, Dict[str, Any]] = {}

    for row in page_views:
        metadata = row.get("metadata") or {}
        source_counts[_extract_referrer_domain(str(metadata.get("referrer") or ""))] += 1
        page_counts[str(metadata.get("path") or "/")] += 1

        session_id = row.get("session_id") or ""
        if not session_id:
            continue
        created_at = row.get("created_at")
        session_info = sessions.setdefault(
            session_id,
            {"count": 0, "first": created_at, "last": created_at},
        )
        session_info["count"] += 1
        if created_at and session_info["first"] and created_at < session_info["first"]:
            session_info["first"] = created_at
        if created_at and session_info["last"] and created_at > session_info["last"]:
            session_info["last"] = created_at

    traffic_sources = [{"label": label, "value": value} for label, value in source_counts.most_common(5)]
    top_pages = [{"path": path, "views": views} for path, views in page_counts.most_common(5)]

    session_values = list(sessions.values())
    session_count = len(session_values)
    pages_per_session = round(sum(item["count"] for item in session_values) / session_count, 1) if session_count else 0
    bounce_rate = round((sum(1 for item in session_values if item["count"] <= 1) / session_count) * 100, 1) if session_count else 0
    avg_duration_seconds = (
        sum(
            max((item["last"] - item["first"]).total_seconds(), 0)
            for item in session_values
            if item["first"] and item["last"]
        ) / session_count
        if session_count
        else 0
    )

    return {
        "export_formats": export_formats,
        "account_categories": account_categories,
        "traffic_sources": traffic_sources,
        "top_pages": top_pages,
        "engagement": {
            "avg_session_duration": _format_duration(avg_duration_seconds),
            "pages_per_session": pages_per_session,
            "bounce_rate": bounce_rate,
            "avg_accounts_processed": round(accounts_total / len(analyses)) if analyses else 0,
        },
    }


def get_recent(limit: int) -> List[Dict[str, Any]]:
    if not ensure_schema():
        return []

    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id, event_type, metadata, session_id, created_at
                FROM analytics_events
                WHERE event_type = 'analysis_run'
                ORDER BY created_at DESC
                LIMIT %s
                """,
                (max(min(limit, 100), 1),),
            )
            rows = cur.fetchall()

    recent: List[Dict[str, Any]] = []
    now = datetime.now(timezone.utc)
    for row in rows:
        created_at = row["created_at"]
        age = max(int((now - created_at).total_seconds()), 0)
        if age < 60:
            relative = f"{age}s ago"
        elif age < 3600:
            relative = f"{age // 60}m ago"
        elif age < 86400:
            relative = f"{age // 3600}h ago"
        else:
            relative = f"{age // 86400}d ago"

        recent.append(
            {
                "id": row["id"],
                "event_type": row["event_type"],
                "metadata": row["metadata"] or {},
                "session_id": row["session_id"],
                "created_at": created_at.isoformat(),
                "relative_time": relative,
            }
        )

    return recent
