# Backend (planned)

This folder is reserved for a future standalone backend service.

Current status:
- The app backend is implemented as Next.js Route Handlers inside `community-guardian/src/app/api/*`.

Planned migration path:
- Move API logic into this `backend/` service (Fastify/Express) only after the MVP is stable.
- Keep `community-guardian/` as the frontend, calling the backend over HTTP.

