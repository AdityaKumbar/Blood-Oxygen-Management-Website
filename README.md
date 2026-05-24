# Healthcare Emergency Management Monorepo

## Structure
- frontend: React + Vite + Tailwind + Redux Toolkit + React Router + Axios
- backend: Node.js + Express + MongoDB (Mongoose) + JWT + Socket.IO
- mobile: React Native + Expo

## Quick Start
1. Install deps per app (already installed during setup):
   - `cd frontend && npm install`
   - `cd backend && npm install`
   - `cd mobile && npm install`
2. Create env files:
   - `frontend/.env` from `frontend/.env.example`
   - `backend/.env` from `backend/.env.example`
3. Run apps:
   - Frontend: `npm run dev:frontend`
   - Backend: `npm run dev:backend`
   - Mobile: `npm run dev:mobile`

## Notes
- Uses ES modules in frontend and backend.
- Backend auth/JWT and sockets are scaffolded with clean modular architecture.
- Add real business logic under services/controllers as your domain expands.
