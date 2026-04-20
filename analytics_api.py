import hmac
import logging
import os
from typing import Any, Dict

from flask import Blueprint, jsonify, make_response, request

from lib.input_validator import ValidationError, validator
from lib.postgres_analytics import (
    get_breakdowns,
    get_kpis,
    get_recent,
    get_trends,
    insert_event,
    sanitize_event_type,
)
from lib.rate_limiter import rate_limit


analytics_api = Blueprint("analytics_api", __name__)

# SECURITY: Only allow known origins for CORS (prevents credential theft)
ALLOWED_ORIGINS = {
    "https://unfollowr.app",
    "https://www.unfollowr.app",
    "https://unfollowr.com",
    "https://www.unfollowr.com",
    "http://localhost:3001",  # dev only
    "http://localhost:5000",  # dev only
}


def _cors_origin() -> str:
    origin = request.headers.get("Origin", "")
    if origin in ALLOWED_ORIGINS:
        return origin
    return ""  # Don't reflect unknown origins


@analytics_api.after_request
def add_cors_headers(response):
    origin = _cors_origin()
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    response.headers["Vary"] = "Origin"
    return response


def _options_response():
    return ("", 204)


def _require_admin_secret():
    # SECURITY: Use Authorization header instead of query-param (prevents secret leakage in logs)
    configured = os.environ.get("ADMIN_SECRET", "").strip()
    if not configured:
        return jsonify({"error": "Forbidden - admin secret not configured"}), 403

    auth_header = request.headers.get("Authorization", "").strip()
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Forbidden"}), 403

    provided = auth_header[7:].strip()
    if not hmac.compare_digest(provided, configured):  # Constant-time comparison
        return jsonify({"error": "Forbidden"}), 403
    return None


def _parse_range(default: str = "7d") -> str:
    value = request.args.get("range", default)
    if value not in {"24h", "7d", "28d"}:
        return default
    return value


@analytics_api.route("/api/analytics/event", methods=["POST", "OPTIONS"])
@rate_limit(max_requests=120, window_seconds=60)
def analytics_event():
    if request.method == "OPTIONS":
        return _options_response()

    try:
        data = request.get_json(force=True) or {}
        validator.validate_json_payload(data, max_size=10240)
    except ValidationError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception:
        return jsonify({"error": "Invalid payload"}), 400

    event_type = sanitize_event_type(data.get("event_type"))
    if not event_type:
        return jsonify({"error": "Invalid event_type"}), 400

    metadata = data.get("metadata") if isinstance(data.get("metadata"), dict) else {}
    if event_type == "page_view":
        metadata["user_agent"] = request.headers.get("User-Agent", "")[:512]

    ok, session_id, should_set_cookie = insert_event(request, event_type, metadata)
    is_production = os.environ.get("FLASK_ENV") != "development"
    response = make_response(jsonify({"ok": ok}))
    if should_set_cookie and session_id:
        response.set_cookie(
            "unfollowr_sid",
            session_id,
            max_age=60 * 60 * 24 * 365,
            httponly=True,
            secure=is_production,  # HTTPS-only in production
            samesite="Lax",
        )
    return response


@analytics_api.route("/api/admin/kpis", methods=["GET", "OPTIONS"])
@rate_limit(max_requests=60, window_seconds=60)
def admin_kpis():
    if request.method == "OPTIONS":
        return _options_response()
    auth_error = _require_admin_secret()
    if auth_error:
        return auth_error
    return jsonify(get_kpis(_parse_range()))


@analytics_api.route("/api/admin/trends", methods=["GET", "OPTIONS"])
@rate_limit(max_requests=60, window_seconds=60)
def admin_trends():
    if request.method == "OPTIONS":
        return _options_response()
    auth_error = _require_admin_secret()
    if auth_error:
        return auth_error
    return jsonify(get_trends(_parse_range(default="28d")))


@analytics_api.route("/api/admin/breakdowns", methods=["GET", "OPTIONS"])
@rate_limit(max_requests=60, window_seconds=60)
def admin_breakdowns():
    if request.method == "OPTIONS":
        return _options_response()
    auth_error = _require_admin_secret()
    if auth_error:
        return auth_error
    return jsonify(get_breakdowns(_parse_range()))


@analytics_api.route("/api/admin/recent", methods=["GET", "OPTIONS"])
@rate_limit(max_requests=60, window_seconds=60)
def admin_recent():
    if request.method == "OPTIONS":
        return _options_response()
    auth_error = _require_admin_secret()
    if auth_error:
        return auth_error

    try:
        limit = int(request.args.get("limit", "20"))
    except ValueError:
        limit = 20

    return jsonify({"items": get_recent(limit)})
