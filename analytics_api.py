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


def _cors_origin() -> str:
    return request.headers.get("Origin", "*")


@analytics_api.after_request
def add_cors_headers(response):
    origin = _cors_origin()
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Vary"] = "Origin"
    return response


def _options_response():
    return ("", 204)


def _require_admin_secret():
    # TODO: Replace this query-param secret check with proper authenticated admin access.
    configured = os.environ.get("ADMIN_SECRET", "").strip()
    provided = request.args.get("secret", "").strip()
    if not configured or provided != configured:
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
    response = make_response(jsonify({"ok": ok}))
    if should_set_cookie and session_id:
        response.set_cookie(
            "unfollowr_sid",
            session_id,
            max_age=60 * 60 * 24 * 365,
            httponly=True,
            secure=False,
            samesite="Lax",
        )
    return response


@analytics_api.route("/api/admin/kpis", methods=["GET"])
@rate_limit(max_requests=60, window_seconds=60)
def admin_kpis():
    auth_error = _require_admin_secret()
    if auth_error:
        return auth_error
    return jsonify(get_kpis(_parse_range()))


@analytics_api.route("/api/admin/trends", methods=["GET"])
@rate_limit(max_requests=60, window_seconds=60)
def admin_trends():
    auth_error = _require_admin_secret()
    if auth_error:
        return auth_error
    return jsonify(get_trends(_parse_range(default="28d")))


@analytics_api.route("/api/admin/breakdowns", methods=["GET"])
@rate_limit(max_requests=60, window_seconds=60)
def admin_breakdowns():
    auth_error = _require_admin_secret()
    if auth_error:
        return auth_error
    return jsonify(get_breakdowns(_parse_range()))


@analytics_api.route("/api/admin/recent", methods=["GET"])
@rate_limit(max_requests=60, window_seconds=60)
def admin_recent():
    auth_error = _require_admin_secret()
    if auth_error:
        return auth_error

    try:
        limit = int(request.args.get("limit", "20"))
    except ValueError:
        limit = 20

    return jsonify({"items": get_recent(limit)})
