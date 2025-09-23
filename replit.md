# Unfollowr

## Overview

Unfollowr is a Flask-based web application that helps users discover which accounts don't follow them back across social media platforms. With the tagline "Find, Filter, and Unfollow with Ease," it provides the simplest way to analyze social connections by processing data export files and presenting results in an intuitive interface with direct profile links for instant action.

**Current Platform Support:**
- Instagram (fully implemented)
- Twitter & TikTok (coming soon)

## System Architecture

### Frontend Architecture
- **Template Engine**: Jinja2 (Flask's default templating engine)
- **UI Framework**: Bootstrap 5 with glassmorphism design system
- **Typography**: Space Grotesk (headings) + Inter (body) with optimized font loading
- **Icons**: Font Awesome 6.0.0
- **Styling**: Advanced CSS with glassmorphism, floating animations, and enhanced visual depth
- **Theme**: Light theme with radial gradient background and glass effects
- **Motion**: Scroll-triggered reveals, staggered animations, and reduced-motion support

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **File Handling**: Werkzeug utilities for secure file uploads
- **Session Management**: Flask's built-in session handling with secret key
- **Logging**: Python's built-in logging module for debugging
- **Proxy Support**: ProxyFix middleware for proper header handling in production

### Data Processing
- **File Formats**: JSON and HTML file parsing for Instagram export data
- **Auto-Detection**: Automatic format detection for uploaded files
- **Data Structures**: Python sets for efficient username comparison
- **File Validation**: Extension-based validation (JSON and HTML supported)
- **Size Limits**: 50MB maximum file upload size

## Key Components

### Core Application (`app.py`)
- **File Upload Handling**: Secure filename processing and validation for JSON and HTML files
- **Parsing Functions**: 
  - `parse_followers_json()`: Extracts usernames from followers JSON export
  - `parse_following_json()`: Extracts usernames from following JSON export
  - `parse_followers_html()`: Extracts usernames from followers HTML export
  - `parse_following_html()`: Extracts usernames from following HTML export
  - `parse_followers_file()`: Auto-detects format and parses followers file
  - `parse_following_file()`: Auto-detects format and parses following file
- **Format Detection**: Automatic detection between JSON and HTML file formats
- **Data Comparison Logic**: Set operations to identify non-reciprocal follows
- **Error Handling**: Comprehensive exception handling with user-friendly messages
- **Analytics System**: Privacy-first usage tracking with `log_usage_analytics()` and admin dashboard at `/admin/stats`

### Key Features
- **Instant Insights**: Upload data and see non-reciprocal follows in seconds
- **Clean, Intuitive UI**: Switch between card and compact views, batch-select users, jump by letter group
- **Privacy First**: Files processed in browser—nothing stored or shared
- **Cross-Platform Ready**: Instagram today, Twitter & TikTok support coming soon
- **Usage Analytics**: Privacy-first analytics system tracking usage without storing personal data

### Web Interface
- **Main Page (`templates/index.html`)**: Upload form with dual file input
- **Results Page (`templates/results.html`)**: Statistics display and searchable results
- **Styling (`static/style.css`)**: Enhanced UI with animations and responsive design

### Application Entry Point (`main.py`)
- Development server configuration
- Host and port binding for containerized environments

## Data Flow

1. **User Upload**: Users upload two JSON files (followers and following exports)
2. **File Validation**: Server validates file extensions and size limits
3. **JSON Parsing**: Extract usernames from Instagram's export format
4. **Set Operations**: Compare following vs followers to find non-followers
5. **Results Display**: Present statistics and searchable list of non-followers
6. **Error Handling**: Display user-friendly error messages for invalid data

## External Dependencies

### Python Packages
- **Flask**: Web framework and routing
- **Werkzeug**: WSGI utilities and security helpers

### Frontend Libraries (CDN)
- **Bootstrap 5**: UI framework with dark theme
- **Font Awesome 6**: Icon library
- **Bootstrap Agent Dark Theme**: Replit-specific dark theme

### Instagram Data Format
- **JSON Format**:
  - **Followers Export**: Array of objects with `string_list_data` containing usernames
  - **Following Export**: Object with `relationships_following` array structure
- **HTML Format**:
  - **Followers Export**: HTML document with Instagram profile links
  - **Following Export**: HTML document with Instagram profile links and user data

## Deployment Strategy

### Development Environment
- Flask development server on port 5000
- Debug mode enabled for development
- Host binding to 0.0.0.0 for container compatibility

### Production Considerations
- ProxyFix middleware configured for reverse proxy deployment
- Environment-based secret key management
- Session security with configurable secret key
- File upload size limits for security

### Security Measures
- Secure filename handling to prevent directory traversal
- File extension validation (JSON only)
- Upload size limits (50MB maximum)
- Session secret key from environment variables

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 08, 2025. Initial setup with JSON file support
- July 08, 2025. Added HTML file parsing support with BeautifulSoup
- July 08, 2025. Implemented auto-detection for JSON and HTML file formats
- July 08, 2025. Updated UI to support both JSON and HTML file uploads
- July 08, 2025. Enhanced modern glassmorphism design with gradient backgrounds
- July 08, 2025. Added letter-group headings for alphabetical navigation
- July 08, 2025. Implemented batch selection and bulk unfollow functionality
- July 08, 2025. Added compact table view toggle for power users
- July 08, 2025. Enhanced search and filtering capabilities
- July 08, 2025. Added privacy badges and onboarding tooltips
- July 08, 2025. Improved mobile responsiveness and accessibility
- July 09, 2025. Rebranded to Unfollowr with new tagline "Find, Filter, and Unfollow with Ease"
- July 09, 2025. Added feature showcase cards highlighting key benefits
- July 09, 2025. Updated all branding and messaging for cross-platform expansion
- July 09, 2025. Implemented privacy-first usage analytics system with admin dashboard
- July 09, 2025. Simplified interface by removing popups, sort options, and followed dates
- July 09, 2025. Fixed copy list and CSV export formatting issues
- July 27, 2025. Rebuilt analytics system with atomic JSON counter approach for reliable tracking
- August 28, 2025. Major UI overhaul with Cluely-inspired design system featuring glassmorphism effects
- August 28, 2025. Implemented Space Grotesk typography, enhanced animations, and floating decorative elements
- August 28, 2025. Added drag-and-drop file upload, enhanced form validation, and smooth scroll reveals
- August 28, 2025. Upgraded to advanced glass cards, icon chips, and sophisticated visual depth
- August 28, 2025. Integrated Google Gemini AI for account classification and intelligent segmentation
- August 28, 2025. Added AI-powered chatbot for natural language filtering and recommendations
- August 28, 2025. Enhanced results page with segment filters, AI suggestions, and interactive analysis
- August 28, 2025. Implemented Privacy Policy page with comprehensive sections and glassmorphism styling
- August 28, 2025. Refined homepage messaging to focus on user benefits rather than AI technology
- August 28, 2025. Updated copy from "AI-heavy" to outcome-focused language per user feedback
- August 28, 2025. Complete results page redesign with Cluely-inspired clean UI and fixed AI Assistant functionality
- August 28, 2025. Added smooth transitions, enhanced search/filter bar, and integrated AI drawer with working query translation
- August 28, 2025. Fixed 'non_followers_set' variable error and implemented enhanced metric cards with hover effects
- August 28, 2025. Homepage refinement: moved upload section near top for better conversion flow
- August 28, 2025. Updated hero CTAs to "Upload my export" with smooth scroll functionality
- August 28, 2025. Enhanced privacy messaging with "Your files stay private. Always." tagline
- August 28, 2025. Added FAQ about upload placement and improved overall user flow
- August 28, 2025. Comprehensive results page enhancement: Added alphabetical filter bar (A-Z), advanced filter panel with segment/score options, floating AI assistant chat, improved button hierarchy with blue privacy badge
- August 28, 2025. Implemented Cluely-level polish: Sticky alphabetical navigation, side-panel filters, floating AI chat launcher, enhanced animations, and comprehensive filter state management
- August 28, 2025. Implemented comprehensive PRD improvements: Enhanced hero CTAs ("Find out who's not following back"), upload drag-and-drop animations with pulsing cloud icon, smooth horizontal progress bar, social proof banner with "Trusted by 500+ users in beta"
- August 28, 2025. Added results page interactive features: empty states with friendly messaging, sticky batch actions bar, card micro-interactions with hover zoom effects, table row highlights with quick action reveals
- August 28, 2025. Mobile enhancements: floating upload CTA button for mobile users, responsive AI chat bubble, scrollable alphabetical filter bar, enhanced mobile batch actions
- August 28, 2025. Branding polish: logo pulse animation on page load, enhanced icon consistency, gradient depth effects on metric cards with radial blue accents, improved visual hierarchy throughout
- August 28, 2025. Complete AI implementation: Fully integrated Google Gemini API for account classification (Celebrity, Creator, Brand, Friend, Spam, Unknown), natural language query translation ("hide celebrities" → filter parameters), suggestion scoring system, working API endpoints (/api/ai/translate-query, /api/ai/classify-batch), and enhanced results display with segment chips and AI-powered insights
- August 28, 2025. Admin Dashboard Implementation: Complete analytics system with secure admin authentication, comprehensive usage metrics (total users, uploads, AI analyses, exports), interactive charts (Chart.js with usage trends, AI feature adoption, user segments), recent sessions table with exportable CSV data, real-time filtering, and privacy-first anonymous session tracking using MD5-hashed identifiers
- August 28, 2025. Results Page Visual & UX Refinement: Complete redesign following PRD specifications to align with homepage aesthetic. Implemented: unified typography with Space Grotesk headers and consistent color system, reduced whitespace and grouped sections, restyled alphabetical filter bar with soft pills and blue active states, search input matching homepage cards with inline filter/AI buttons, refined grid cards with shadows and hover effects, improved table with alternating rows and minimal borders, AI Assistant moved to header button (desktop) with mobile floating bubble, enhanced mobile responsiveness with sticky action bar and horizontal scrolling filters
- August 28, 2025. Competitor-Informed UI & Flow Redesign: Comprehensive overhaul inspired by UnfollowCheck (categorization) and Cluely (polish). Homepage improvements: changed hero from "Clean up your following" to "Find out who's not following back", direct "Upload my export" CTA, added trust comparison section "Why safer than competitors?", updated social proof to "Hundreds of exports analyzed daily" with Product Hunt/Indie Hackers badges. Results page transformation: categorized view with tabs (Unfollowers, Too Famous, Inner Circle, Fan Club), glass morphism metric cards with hover effects, advanced filter chips, clean account cards with segment chips, AI Assistant floating button, sticky mobile actions, empty states. Focus on privacy-first messaging vs competitors' paid trial walls.
- August 28, 2025. AI Agent Integration: Implemented complete AI chat interface per PRD specifications. Features: Google Gemini-powered conversational assistant, privacy notice on first use with dismissible warning, sliding chat window with suggested queries, natural language processing for account insights, automatic category switching and filtering based on AI responses, context-aware conversations using user's Instagram data, API endpoint /api/ai/chat with comprehensive error handling. Chat includes suggested queries like "Who are my Inner Circle members?" and "Show inactive accounts to unfollow" with real-time analysis of user data.
- August 28, 2025. Enhanced Categorization System Implementation: Complete guaranteed + heuristic categorization system per PRD specifications. Core features: robust ConnectionClassifier with username normalization, guaranteed base categories (Unfollowers, Fans, Mutuals) with accurate relationship logic, heuristic tagging system with 75+ brands, 60+ sports entities, 40+ celebrities, creator detection keywords. UI enhancements: redesigned category tabs with real counts, filter chips with live count display, gradient tag badges with icons, proper tab switching JavaScript. Technical: lib/classify_connections.py classification engine, data/ allowlists (brands.json, sports.json, celebrities.json), comprehensive error handling and logging, Jinja template syntax fixes for proper upload functionality.