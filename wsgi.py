"""Production WSGI entrypoint.

Serves only the analytics blueprint -- POST /api/analytics/event and the four
/api/admin/* endpoints. That is the live product's entire server surface: the
Instagram export is parsed in the browser and never reaches this process.

app.py's 14 legacy routes (/, /compare, /faq, /admin/*, /api/ai/*) are
deliberately not served here. Nothing in the live product calls them, their
admin panel is already non-functional (SESSION_SECRET and ADMIN_PASSWORD_HASH
are unset, so app.py falls back to random per-boot values), and /api/ai/* is
already disabled (no GEMINI_API_KEY). See docs/azure-migration-plan.md section 0.

Fallback: set the App Service startup command back to `gunicorn app:app
--preload --workers 2 --timeout 120` to serve the full legacy app again.
app.py is untouched and still importable -- no redeploy required.
"""

import os

from flask import Flask

from analytics_api import analytics_api

_APPINSIGHTS = os.environ.get("APPLICATIONINSIGHTS_CONNECTION_STRING")

# Configure before the app is constructed. Note the startup command must NOT
# use `gunicorn --preload`: under --preload the app is imported in the master
# process before fork(), and the exporter's background threads do not survive
# the fork, so telemetry would be silently dropped. Without --preload each
# worker imports this module after forking, which is where the SDK expects to
# be initialised.
if _APPINSIGHTS:
    from azure.monitor.opentelemetry import configure_azure_monitor

    configure_azure_monitor()

app = Flask(__name__)
app.register_blueprint(analytics_api)

# Instrument THIS app instance explicitly.
#
# configure_azure_monitor() enables Flask auto-instrumentation by replacing the
# `flask.Flask` symbol with an instrumented subclass. But `from flask import
# Flask` above already bound the *original* class into this module, so the app
# created here is not the patched one and never gets a server span. The
# observable symptom is subtle rather than loud: telemetry still flows, but
# every psycopg2 span arrives as its own parentless root
# (operation_ParentId == operation_Id) with no parent request, and the
# `requests` table stays empty -- so failure rate and latency are invisible.
#
# instrument_app() is order-independent and idempotent, so it is correct
# regardless of how the imports above are arranged later.
if _APPINSIGHTS:
    from opentelemetry.instrumentation.flask import FlaskInstrumentor

    FlaskInstrumentor().instrument_app(app)
