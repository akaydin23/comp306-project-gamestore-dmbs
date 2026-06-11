# GameStore

A video game store web application built for **COMP 306: Database Management Systems**. The project demonstrates a full-stack application backed by a relational PostgreSQL database, with a React frontend, an Express API, and SQL-driven business logic.

## Overview

GameStore lets users browse a digital game catalog, create accounts, manage a shopping cart, view an owned-game library, and interact with a friends system. The database schema models users, developers, games, genres, purchases, carts, libraries, reviews, wishlists, favorites, gifts, and social relationships.

The application is designed to showcase core DBMS concepts: primary and foreign keys, many-to-many relationships, check and unique constraints, joins, aggregates, parameterized queries, and referential integrity.

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Database | PostgreSQL 18, Docker Compose |
| Backend | Node.js, Express 5, TypeScript, `pg`, bcrypt, JWT |
| Frontend | React 19, Vite, TypeScript, React Router, HeroUI, Tailwind CSS v4 |

## Features

### Implemented

- User registration and login (JWT-based authentication)
- Game store browsing with search, genre filter, and sorting
- Game detail pages
- Shopping cart (add, remove, clear)
- Checkout and purchase flow
- Owned-game library with play-time stats
- Wishlist, favorites, reviews, and gifts
- User dashboard and friends panel (send/view/accept requests)
- Profile editing
- Admin dashboard for users, roles, games, genres, purchases, and reports
- Developer dashboard for managing developer-owned games
- Realistic demo seed data for meaningful SQL query outputs
- REST API with layered backend architecture

### In Progress / Database Only

These are modeled in the schema and have partial or basic behavior, but could be expanded further:

- Advanced gift purchase/payment handling
- Friend removal, request rejection, and block/unblock controls
- More detailed developer analytics

See [docs/project-explanation.md](./docs/project-explanation.md) for the full architecture breakdown and current limitations.

## Quick Start

**Prerequisites:** Git, Node.js 20+, Docker Desktop

```powershell
# 1. Start the database
docker compose up -d db

# 2. Load sample data (required for games and test accounts)
Get-Content .\database\sample_data.sql | docker compose exec -T db psql -U postgres -d game_store_db

# 3. Backend (terminal 1)
cd backend
Copy-Item .env.example .env
npm install
npm run dev

# 4. Frontend (terminal 2)
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open **http://localhost:5173** and log in with a seeded test account (see [docs/how-to-run.md](./docs/how-to-run.md)).

When you are done for the day, stop the dev servers with `Ctrl+C` and optionally run `docker compose stop` to stop the database container. Your data persists in the Docker volume between sessions.

## Documentation

| Document | Description |
|----------|-------------|
| [docs/how-to-run.md](./docs/how-to-run.md) | Full setup guide from a fresh clone, env configuration, troubleshooting |
| [docs/project-explanation.md](./docs/project-explanation.md) | Architecture, database design, API endpoints, frontend structure |
| [docs/project-tests.md](./docs/project-tests.md) | Manual testing checklist (browser, API, and SQL) |
| [docs/auth-implementation.md](./docs/auth-implementation.md) | Authentication system design and SQL breakdown |

## Project Structure

```
comp306-project-gamestore-dmbs/
├── backend/           # Express REST API (port 3000)
├── frontend/          # React + Vite client (port 5173)
├── database/          # schema.sql, sample_data.sql, test_queries.sql
├── docs/              # Project documentation
└── docker-compose.yml # PostgreSQL service (port 5432)
```

## API Overview

All routes are prefixed with `/api`.

| Area | Endpoints |
|------|-----------|
| Health | `GET /`, `GET /hello` |
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Games | `GET /games`, `GET /games/:id`, `GET /genres` |
| Cart | `GET /cart`, `POST /cart/items`, `DELETE /cart/items/:gameId`, `DELETE /cart` |
| Library | `GET /library` |
| Friends | `GET /friends`, `GET /friends/pending`, `POST /friends/requests`, `POST /friends/requests/accept/:senderId` |
| Profile | `PUT /users/me` |

Protected routes require `Authorization: Bearer <token>`.

## Development Scripts

**Backend** (`backend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with hot reload |
| `npm run typecheck` | TypeScript type check |
| `npm run build` | Compile to `dist/` |

**Frontend** (`frontend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |

## Environment Variables

**Backend** (`backend/.env` — copy from `.env.example`)

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=game_store_db
JWT_SECRET=change_this_secret
```

**Frontend** (`frontend/.env` — copy from `.env.example`)

```
VITE_API_URL=http://localhost:3000/api
```
