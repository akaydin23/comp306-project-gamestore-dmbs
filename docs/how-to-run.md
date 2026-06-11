# How to Run GameStore

## 1. What You Are Running

GameStore has three parts:

- PostgreSQL database on port `5432`.
- Express backend API on port `3000`.
- React/Vite frontend, usually on port `5173`.

The normal local development flow is:

1. Start PostgreSQL with Docker Compose.
2. Install backend dependencies and run the backend.
3. Install frontend dependencies and run the frontend.
4. Open the frontend in your browser.

## 2. Prerequisites

Install these first:

- Git.
- Node.js and npm. Node 20 or newer is recommended.
- Docker Desktop, if you want the easiest PostgreSQL setup.
- Optional: PostgreSQL command-line tools if you prefer a local PostgreSQL installation instead of Docker.

Check versions:

```powershell
git --version
node --version
npm --version
docker --version
docker compose version
```

## 3. Fresh Clone Setup

Clone the repository:

```powershell
git clone git@github.com:akaydin23/comp306-project-gamestore-dmbs.git
cd comp306-project-gamestore-dmbs
```

If you already cloned it, just open a terminal in the repository root.

## 4. Configure Environment Files

Create backend `.env` from the example:

```powershell
cd backend
Copy-Item .env.example .env
cd ..
```

The default backend `.env` should look like this:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=game_store_db
JWT_SECRET=change_this_secret
```

Create frontend `.env` from the example:

```powershell
cd frontend
Copy-Item .env.example .env
cd ..
```

The default frontend `.env` should look like this:

```env
VITE_API_URL=http://localhost:3000/api
```

For local development, these defaults match `docker-compose.yml`.

## 5. Start the Database With Docker

From the repository root:

```powershell
docker compose up -d db
```

Check that the database container is running:

```powershell
docker compose ps
```

The database service uses:

- Image: `postgres:18-alpine`.
- Container name: `gamestore-db`.
- User: `postgres`.
- Password: `postgres`.
- Database: `game_store_db`.
- Host port: `5432`.

### Important Docker Initialization Detail

`docker-compose.yml` mounts `database/schema.sql` into Docker's initialization folder. PostgreSQL runs that file only the first time the database volume is created.

This means:

- On a fresh database volume, `schema.sql` is loaded automatically.
- `sample_data.sql` is not loaded automatically.
- If you change `schema.sql` later, Docker will not rerun it unless you remove the database volume.

To reset the database completely:

```powershell
docker compose down -v
docker compose up -d db
```

This deletes the local PostgreSQL data volume, so use it only when you want a clean database.

## 6. Load Sample Data

After the database is running, load the sample data from the repository root:

```powershell
Get-Content .\database\sample_data.sql | docker compose exec -T db psql -U postgres -d game_store_db
```

If you accidentally run this twice, duplicate key errors are expected because the sample rows use fixed unique emails, usernames, game IDs through serial order, and relationship keys.

Verify sample data:

```powershell
docker compose exec db psql -U postgres -d game_store_db -c "SELECT COUNT(*) FROM Users;"
docker compose exec db psql -U postgres -d game_store_db -c "SELECT COUNT(*) FROM Games;"
```

Expected result after loading sample data:

- `Users` count should be `6`.
- `Games` count should be `10`.

## 7. Install Backend Dependencies

From the repository root:

```powershell
cd backend
npm install
```

Run a type check:

```powershell
npm run typecheck
```

Start the backend:

```powershell
npm run dev
```

Expected output:

```text
Server running on port 3000
```

Keep this terminal open.

Backend scripts:

- `npm run dev`: starts the API with watch mode.
- `npm start`: starts the API without watch mode.
- `npm run build`: compiles TypeScript to `dist`.
- `npm run typecheck`: checks TypeScript without emitting files.
- `npm test`: currently not implemented and exits with an error.

## 8. Install Frontend Dependencies

Open a second terminal at the repository root:

```powershell
cd frontend
npm install
```

Start the frontend:

```powershell
npm run dev
```

Expected output includes a local Vite URL, usually:

```text
Local: http://localhost:5173/
```

Open that URL in your browser.

Frontend scripts:

- `npm run dev`: starts the Vite development server.
- `npm run build`: type-checks and builds the production frontend.
- `npm run lint`: runs ESLint.
- `npm run preview`: previews a production build.

## 9. Quick Start Checklist

Use this shortest path when everything is already installed:

```powershell
docker compose up -d db
Get-Content .\database\sample_data.sql | docker compose exec -T db psql -U postgres -d game_store_db
cd backend
npm install
npm run dev
```

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

Login with:

```text
Email: taha@test.com
Password: sigma67_lover
```

## 10. Verify the App Is Working

Backend health:

```powershell
curl.exe http://localhost:3000/api
curl.exe http://localhost:3000/api/hello
```

Games API:

```powershell
curl.exe http://localhost:3000/api/games
curl.exe http://localhost:3000/api/genres
```

Browser checks:

1. Open the frontend.
2. Confirm games appear on the store page.
3. Login with a seeded account.
4. Open `Library`.
5. Add a non-owned game to cart.
6. Open `Cart`.
7. Open `Friends`.

## 11. Running Without Docker

If you prefer local PostgreSQL:

1. Start your local PostgreSQL server.
2. Create the database:

```powershell
createdb -U postgres game_store_db
```

3. Load schema:

```powershell
psql -U postgres -d game_store_db -f .\database\schema.sql
```

4. Load sample data:

```powershell
psql -U postgres -d game_store_db -f .\database\sample_data.sql
```

5. Make sure `backend/.env` matches your local PostgreSQL username, password, host, port, and database name.

Then run backend and frontend as described above.

## 12. Common Problems and Fixes

### Backend Cannot Connect to Database

Symptoms:

- Backend starts but API requests fail.
- Terminal shows PostgreSQL connection errors.

Fixes:

- Confirm Docker is running.
- Run `docker compose ps`.
- Confirm `backend/.env` uses `DB_HOST=localhost`, `DB_PORT=5432`, `DB_USER=postgres`, `DB_PASSWORD=postgres`, and `DB_NAME=game_store_db`.
- Make sure no other PostgreSQL server is already using port `5432`.

### Store Page Is Empty

Possible causes:

- `sample_data.sql` was not loaded.
- Backend is not running.
- Frontend `VITE_API_URL` points to the wrong URL.

Fix:

```powershell
Get-Content .\database\sample_data.sql | docker compose exec -T db psql -U postgres -d game_store_db
```

Then refresh the browser.

### Duplicate Key Errors When Loading Sample Data

This usually means sample data was already loaded. It is not a problem if your data is already present.

If you want a fully clean database:

```powershell
docker compose down -v
docker compose up -d db
Get-Content .\database\sample_data.sql | docker compose exec -T db psql -U postgres -d game_store_db
```

### Frontend Cannot Reach Backend

Symptoms:

- Store shows an error.
- Login fails immediately.
- Browser devtools show failed requests.

Fixes:

- Confirm backend is running on port `3000`.
- Check `frontend/.env` has `VITE_API_URL=http://localhost:3000/api`.
- Restart the Vite dev server after changing `.env`.

### Login Does Not Work

Fixes:

- Make sure sample data is loaded.
- Use a seeded email/password exactly.
- Try `taha@test.com` with `sigma67_lover`.
- Check backend logs for errors.

### Docker Schema Did Not Update

Docker only runs initialization SQL on a new volume. Reset the volume:

```powershell
docker compose down -v
docker compose up -d db
Get-Content .\database\sample_data.sql | docker compose exec -T db psql -U postgres -d game_store_db
```

### Port Already in Use

If port `3000`, `5173`, or `5432` is already in use:

- Stop the other program using the port.
- Or change the relevant port in `.env`, Vite output, or `docker-compose.yml`.

If you change the backend API port, also update `frontend/.env`.

## 13. What to Run Before Submission

Backend:

```powershell
cd backend
npm run typecheck
```

Frontend:

```powershell
cd frontend
npm run lint
npm run build
```

Database:

```powershell
Get-Content .\database\test_queries.sql | docker compose exec -T db psql -U postgres -d game_store_db
```

Manual browser checks:

- Register.
- Login.
- Browse store.
- Search/filter/sort games.
- View game detail.
- Add to cart.
- Remove from cart.
- Clear cart.
- View library.
- View dashboard/friends.
- Logout.
