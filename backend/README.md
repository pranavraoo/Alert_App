# Community Guardian Backend

Standalone Express.js backend service for the Community Guardian security alert application.

## Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: Google Gemini and Ollama support with keyword-based fallback
- **Port**: 4000 (standard backend port)

## Features
- RESTful API endpoints for alerts, guardians, preferences, and AI categorization
- Database operations with Prisma
- CORS configuration for frontend integration
- AI-powered text categorization with fallback mechanisms

## API Endpoints
- `GET/POST /alerts` - Alert management
- `GET/PATCH/DELETE /alerts/:id` - Individual alert operations
- `POST /categorize` - AI text categorization
- `GET/POST /guardians` - Guardian management
- `GET/PATCH /preferences` - User preferences

## Development
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm start      # Start production server
```

## Migration Status ✅ COMPLETED
- Successfully migrated from Next.js Route Handlers to standalone Express backend
- Frontend (`community-guardian/`) now calls this backend via HTTP API
- Clean separation of concerns achieved

