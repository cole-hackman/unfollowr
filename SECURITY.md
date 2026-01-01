# Security Documentation

This document outlines the security measures implemented in the Unfollowr project.

## API Key Security

### Environment Variables
All sensitive credentials are stored as environment variables and **never** hardcoded in production:

- `GEMINI_API_KEY` - Google Gemini API key for AI features
- `SESSION_SECRET` - Flask session secret key
- `ADMIN_PASSWORD_HASH` - Hashed admin password (use `werkzeug.security.generate_password_hash()`)
- `ADMIN_KEY` - Admin dashboard access key

### Security Measures
1. **No API keys in code**: All API keys are loaded from environment variables
2. **No API keys in logs**: API keys are never logged or included in error messages
3. **No API keys in responses**: API keys are never returned in API responses
4. **No API keys in client-side code**: Verified that no API keys are exposed in Next.js client code
5. **Error message sanitization**: Error handlers automatically remove API key references from error messages
6. **Development fallbacks**: Hardcoded values only exist in development mode with warnings

### Environment Variable Template
A `.env.example` file should be created (not committed to git) with the following structure:
```
GEMINI_API_KEY=your_gemini_api_key_here
SESSION_SECRET=your_session_secret_here
ADMIN_PASSWORD_HASH=your_admin_password_hash_here
ADMIN_KEY=your_admin_key_here
FLASK_ENV=development
```

**Note**: The `.env` file is already in `.gitignore` to prevent accidental commits.

### Production Checklist
- [ ] Set `GEMINI_API_KEY` environment variable
- [ ] Set `SESSION_SECRET` environment variable (use a strong random string)
- [ ] Set `ADMIN_PASSWORD_HASH` environment variable (generate with `werkzeug.security.generate_password_hash()`)
- [ ] Set `ADMIN_KEY` environment variable
- [ ] Ensure `FLASK_ENV` is NOT set to "development" in production
- [ ] Review all environment variables before deployment

## Rate Limiting

### Flask Endpoints
Rate limiting is implemented using an in-memory rate limiter on all endpoints:

**Public Routes:**
- `/` (GET): 60 requests per minute
- `/faq` (GET): 60 requests per minute
- `/privacy` (GET): 60 requests per minute

**API Endpoints:**
- `/compare` (POST): 5 requests per minute
- `/api/ai/translate-query` (POST): 20 requests per minute
- `/api/ai/classify-batch` (POST): 10 requests per minute
- `/api/ai/chat` (POST): 30 messages per minute

**Admin Routes:**
- `/admin` (GET): 20 requests per minute
- `/admin` (POST): 5 login attempts per 5 minutes
- `/admin/stats` (GET): 10 requests per minute
- `/admin/dashboard` (GET): 20 requests per minute
- `/admin/chart-data` (GET): 20 requests per minute
- `/admin/export-csv` (GET): 10 requests per minute
- `/admin/logout` (GET): 20 requests per minute

### Next.js API Routes
- `/api/health` (GET): 60 requests per minute
- `/api/metrics` (POST): 20 requests per minute

### Rate Limit Headers
All rate-limited endpoints return standard headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in window
- `Retry-After`: Seconds until retry (when limit exceeded)
- `X-RateLimit-Reset`: Unix timestamp when limit resets

### Production Considerations
For production, consider upgrading to Redis-based rate limiting for:
- Distributed rate limiting across multiple servers
- Persistent rate limit data
- Better performance at scale

## Input Validation

### File Uploads
- Maximum file size: 50MB
- Allowed extensions: `.json`, `.html`
- Content validation: JSON files are validated for structure
- Filename sanitization: Dangerous characters removed

### JSON Payloads
- Maximum payload sizes enforced per endpoint
- JSON depth limits: Maximum 10 levels deep
- Structure validation: Type checking for all fields
- Size limits:
  - `/api/ai/translate-query`: 10KB
  - `/api/ai/classify-batch`: 1MB
  - `/api/ai/chat`: 50KB
  - `/api/metrics` (Next.js): 10KB

### Query Parameters
- All query parameters are validated and sanitized
- Allowed values are enforced where applicable (e.g., date ranges)
- Maximum length limits enforced (default: 100 characters)
- Special characters and control characters removed

### String Inputs
- Query strings: Maximum 500 characters
- Chat messages: Maximum 2000 characters
- Username validation: Instagram username format enforced
- Sanitization: Control characters and null bytes removed

### Account Lists
- Maximum accounts per batch: 50
- Username validation for each account
- Field sanitization (fullName, bio, etc.)
- Integer validation for follower/following counts

### Admin Routes
- Query parameters validated (e.g., `range` parameter in `/admin/chart-data`)
- Admin key parameter sanitized in `/admin/stats`
- All inputs validated before processing

## SQL Injection Protection

### Current Status
The application currently uses JSON file storage and does not use SQL databases. However, SQL injection protection patterns are implemented for future-proofing.

### Protection Measures
1. **Input Sanitization**: All user inputs are sanitized before processing using `InputValidator.sanitize_string()`
2. **Parameterized Query Pattern**: If SQL is added in the future, use parameterized queries exclusively
3. **Input Validation**: Strict validation prevents malicious input patterns
4. **SQL Injection Pattern Detection**: The `sanitize_sql_input()` method provides defensive sanitization (though parameterized queries are preferred)
5. **No String Concatenation**: Never use string formatting or concatenation for SQL queries

### Future Database Usage Guidelines
If SQL databases are added in the future:

1. **Always use parameterized queries**:
   ```python
   # ✅ GOOD
   cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
   
   # ❌ BAD
   cursor.execute(f"SELECT * FROM users WHERE username = '{username}'")
   ```

2. **Use ORM when possible**:
   ```python
   # ✅ GOOD (using SQLAlchemy)
   User.query.filter_by(username=username).first()
   ```

3. **Validate and sanitize inputs**:
   - Use the `InputValidator` class for all inputs
   - Never trust user input

4. **Escape special characters**:
   - Use database-specific escaping functions
   - Never manually construct SQL strings

### Example Safe Database Pattern
```python
from lib.input_validator import validator

def get_user(username: str):
    # Validate input first
    if not validator.validate_username(username):
        raise ValueError("Invalid username")
    
    # Use parameterized query
    cursor.execute(
        "SELECT * FROM users WHERE username = %s",
        (username,)  # Tuple prevents injection
    )
    return cursor.fetchone()
```

## Security Best Practices

### Logging
- Never log sensitive data (passwords, API keys, tokens)
- Sanitize user input before logging
- Use log levels appropriately (DEBUG in dev, INFO/WARNING in prod)

### Error Handling
- Never expose internal errors to users
- Return generic error messages to clients
- Log detailed errors server-side only

### Session Security
- Use secure session cookies in production
- Set appropriate session timeouts
- Regenerate session IDs after login

### File Upload Security
- Validate file types and sizes
- Scan uploaded files for malicious content
- Store uploaded files outside web root when possible
- Use secure filenames (no user-controlled paths)

## Security Audit Checklist

Before deploying to production:

- [ ] All environment variables set (no defaults)
- [ ] `FLASK_ENV` not set to "development"
- [ ] Rate limiting configured appropriately
- [ ] Input validation enabled on all endpoints
- [ ] File upload limits enforced
- [ ] No API keys in code or logs
- [ ] Session security configured
- [ ] Error messages don't expose internals
- [ ] HTTPS enabled
- [ ] CORS configured appropriately
- [ ] Security headers set (HSTS, CSP, etc.)

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:
1. Do not create public GitHub issues
2. Contact the maintainers directly
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be fixed before disclosure

