# Authentication System — Implementation Documentation

## 1. Overview

The authentication system handles user registration, login, session management, and protected route access. It is built on a three-layer architecture: **PostgreSQL → Express backend → React frontend**, with communication over a JSON REST API.

This document focuses on the database design and SQL operations powering the auth system, as well as the end-to-end workflows each request follows.

---

## 2. Database Schema — The `Users` Table

All authentication data resides in a single table. The schema uses PostgreSQL with `SERIAL` auto-incrementing primary keys and database-level constraints to enforce integrity at the storage layer.

### 2.1 Table Definition

```sql
CREATE TABLE Users (
    user_id       SERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    bio           TEXT,
    role          VARCHAR(20)  NOT NULL DEFAULT 'USER',

    CHECK (role IN ('USER', 'ADMIN', 'DEVELOPER'))
);
```

### 2.2 Column Purposes

| Column | Type | Constraint | Purpose |
|--------|------|------------|---------|
| `user_id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing unique identifier. Chosen over `INT AUTO_INCREMENT` because PostgreSQL uses `SERIAL` as syntactic sugar for `INTEGER` + a `SEQUENCE`. |
| `username` | `VARCHAR(50)` | `NOT NULL`, `UNIQUE` | Display name for the user. The `UNIQUE` constraint prevents duplicate usernames at the database level — even if the application logic has a bug, the DB will reject the duplicate row with a constraint violation. |
| `email` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Used for login. The `UNIQUE` constraint is critical here: it serves as the user's identity for sign-in, so duplicates would break the login flow entirely. |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Stores the bcrypt hash of the user's password — **never** the plaintext. bcrypt output is always 60 characters, but `VARCHAR(255)` is used as a safe default that accommodates potential hash algorithm changes. |
| `bio` | `TEXT` | nullable | Free-text profile biography. No `VARCHAR` limit because bio length is arbitrary user content. |
| `role` | `VARCHAR(20)` | `NOT NULL DEFAULT 'USER'` | Authorization tier. The `CHECK` constraint restricts values to `'USER'`, `'ADMIN'`, or `'DEVELOPER'` — the database rejects any `INSERT` or `UPDATE` that tries to set an invalid role. |

### 2.3 Constraints and Their DBMS Significance

| Constraint | Type | Why It Matters |
|-----------|------|----------------|
| `PRIMARY KEY (user_id)` | Uniqueness + indexing | Creates a clustered index on `user_id`. Every lookup by ID (used in `GET /api/auth/me`) is an O(log n) B-tree seek. |
| `UNIQUE (username)` | Uniqueness | Prevents duplicate usernames. The query `WHERE username = $1` in registration benefits from the implicit unique index — it avoids a full table scan. |
| `UNIQUE (email)` | Uniqueness | Same as above, but for the login identifier. The login query `WHERE email = $1` uses this index for fast lookup. |
| `CHECK (role IN (...))` | Domain integrity | Restricts the `role` column to a known set of values. This is an example of using the database to enforce business rules rather than relying solely on application code. |
| `NOT NULL` | Required fields | Guarantees that critical columns (`username`, `email`, `password_hash`) are never missing — prevents corrupted rows at the schema level. |

---

## 3. Backend Architecture

The backend follows a **layered architecture** separating concerns into four tiers:

```
Routes  →  Controllers  →  Services  →  Database (pg Pool)
```

| Layer | Directory | Responsibility |
|-------|-----------|---------------|
| **Routes** | `src/routes/auth.ts` | Defines HTTP method + path + middleware chain. No business logic. |
| **Controllers** | `src/controllers/authController.ts` | Parses request body, validates input shape, calls the service, formats the response. |
| **Services** | `src/services/authService.ts` | All business logic: hashing, SQL queries, JWT signing. This is where database operations happen. |
| **Database** | `src/db/pool.ts` | A `pg.Pool` singleton. Manages connection pooling to PostgreSQL — creates, reuses, and cleans up connections automatically. |

### 3.1 Database Connection

```typescript
// src/db/pool.ts
import { Pool } from 'pg';
import { db } from '../config/index.js';

const pool = new Pool({
  host: db.host,
  port: db.port,
  user: db.user,
  password: db.password,
  database: db.database,
});

export default pool;
```

The `pg.Pool` manages a pool of TCP connections to PostgreSQL. It handles connection lifecycle (open, idle timeout, error recovery) so that each request doesn't need to open a new connection. The pool is a **singleton** — imported once, shared across all services.

Configuration is read from environment variables via `src/config/index.ts`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=game_store_db
```

---

## 4. SQL Queries — Complete Breakdown

All queries use **parameterized placeholders** (`$1`, `$2`, `$3`). This is the primary defense against **SQL injection**: the `pg` driver sends the query string and parameter values separately to PostgreSQL, so user input is never concatenated into the SQL string.

### 4.1 Registration — Duplicate Check

```sql
SELECT user_id FROM Users WHERE username = $1 OR email = $2
```

**Purpose:** Before inserting a new user, check if the username or email already exists.

**Parameters:** `[username, email]`

**DBMS notes:**
- Uses the implicit unique indexes on `username` and `email` — PostgreSQL can satisfy this query with index-only scans on both columns.
- The `OR` condition means PostgreSQL may use a bitmap index scan combining both indexes.
- Actually inserting a duplicate would trigger a `UNIQUE` constraint violation (error code `23505`), but the application checks proactively to return a user-friendly `409 Conflict` rather than a raw database error.

### 4.2 Registration — Insert New User

```sql
INSERT INTO Users (username, email, password_hash)
VALUES ($1, $2, $3)
RETURNING user_id, username, email, bio, role
```

**Purpose:** Create the user record and immediately return the newly created row.

**Parameters:** `[username, email, password_hash]` — note `password_hash` is already the bcrypt hash, not the raw password.

**DBMS notes:**
- The `RETURNING` clause is a PostgreSQL extension that avoids a separate `SELECT` query. Instead of `INSERT` + `SELECT`, this is a single round-trip to the database.
- The returned columns intentionally exclude `password_hash` — even though the hash is not reversible, it should never leave the service layer. The TypeScript type `SafeUser` (which omits `password_hash`) enforces this at compile time, and the query column list enforces it at runtime.
- If a concurrent request inserts the same username between the duplicate check and this `INSERT`, the `UNIQUE` constraint will raise a `23505` error. The current implementation lets this propagate as a 500 error — a production system would catch it and return 409.

### 4.3 Login — Find User by Email

```sql
SELECT user_id, username, email, password_hash, bio, role
FROM Users
WHERE email = $1
```

**Purpose:** Retrieve the full user row (including the password hash) to verify credentials.

**Parameters:** `[email]`

**DBMS notes:**
- This is the only query that includes `password_hash` in the result set. The hash is needed for `bcrypt.compare()` but is never returned to the client — the `toSafeUser()` function strips it before serialization.
- Uses the `UNIQUE` index on `email` for an efficient equality lookup.
- If the email doesn't exist, the result set is empty and the service returns `401 Unauthorized`. The error message is intentionally vague (`"Invalid email or password"`) to avoid leaking whether an account exists.

### 4.4 Token Verification — Get Current User

```sql
SELECT user_id, username, email, bio, role
FROM Users
WHERE user_id = $1
```

**Purpose:** After the JWT middleware has verified the token and extracted `user_id`, the service fetches the latest user data from the database.

**Parameters:** `[user_id]` — extracted from the JWT payload, not from user input.

**DBMS notes:**
- Uses the `PRIMARY KEY` index — the fastest possible lookup in the table.
- Explicitly excludes `password_hash` because it's not needed for profile display.
- This query is executed on every request to a protected endpoint, so the primary key index is essential for performance.

---

## 5. Password Hashing with bcrypt

### Why bcrypt?

bcrypt is a purposely slow hashing algorithm designed for password storage. Unlike general-purpose hash functions (SHA-256, MD5), bcrypt is **computationally expensive** — it uses an adaptive cost factor (the "salt rounds") that can be increased as hardware gets faster.

### Configuration

```typescript
const SALT_ROUNDS = 10;
```

A cost factor of 10 means bcrypt performs 2^10 = 1,024 iterations of the underlying Blowfish cipher. This takes approximately 50-100ms on modern hardware — imperceptible to a user during login, but catastrophic for an attacker trying billions of guesses.

### Registration Flow

```
Plaintext password → bcrypt.hash(password, 10) → $2b$10$... (60-char hash)
```

The resulting hash includes:
- The algorithm identifier (`$2b$`)
- The cost factor (`10`)
- A 22-character salt
- The 31-character hash digest

This means the salt is **embedded in the hash itself** — no need for a separate `salt` column in the database.

### Login Flow

```
Plaintext password from login form
    ↓
bcrypt.compare(plaintext, stored_hash)
    ↓
Extracts salt from stored_hash, re-hashes plaintext with same salt, compares
    ↓
Returns true/false
```

The `bcrypt.compare()` function:
1. Reads the salt from the stored hash
2. Hashes the provided password with that salt and the same cost factor
3. Performs a constant-time comparison to prevent timing attacks

---

## 6. JWT (JSON Web Token) Authentication

### Token Structure

A JWT consists of three Base64-encoded parts separated by dots: `header.payload.signature`

**Payload stored in the token:**

```typescript
interface JwtPayload {
  user_id: number;   // References Users.user_id PRIMARY KEY
  username: string;  // For display purposes in UI
  role: string;      // For authorization checks (USER vs ADMIN)
}
```

The payload is deliberately small — it contains only what's needed to identify the user and check authorization without a database query. The `user_id` is the critical field: it's the foreign key into the `Users` table for any subsequent queries.

### Token Lifecycle

```
┌─────────────────────────────────────────────────┐
│  1. User logs in with email + password           │
│  2. Backend verifies credentials against DB      │
│  3. Backend signs JWT with secret + expiry (7d)  │
│  4. Token returned to frontend                   │
│  5. Frontend stores token in localStorage        │
│  6. Frontend attaches token to every request     │
│  7. Backend verifies token on protected routes   │
│  8. After 7 days, token expires — must re-login  │
└─────────────────────────────────────────────────┘
```

### Signing

```typescript
const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
```

The `jwtSecret` is an environment variable. The signature is an HMAC-SHA256 hash of the header + payload using this secret. Anyone can decode the payload (it's Base64, not encrypted), but only the server with the secret can create or verify a valid signature.

### Verification (Middleware)

```typescript
// src/middleware/auth.ts
const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
req.user = decoded;
```

`jwt.verify()` checks:
1. The signature matches (token wasn't tampered with)
2. The token hasn't expired (the `exp` claim is still in the future)

If either check fails, the middleware returns `401 Unauthorized` and the request never reaches the controller.

---

## 7. API Endpoints

### 7.1 `POST /api/auth/register`

**Request:**
```json
{
  "username": "player1",
  "email": "player1@example.com",
  "password": "secret123"
}
```

**Database Operations:**
1. `SELECT ... WHERE username = $1 OR email = $2` — duplicate check
2. `INSERT INTO Users ... RETURNING ...` — create user

**Response (201 Created):**
```json
{
  "user": {
    "user_id": 1,
    "username": "player1",
    "email": "player1@example.com",
    "bio": null,
    "role": "USER"
  }
}
```

Note: `password_hash` is **never** included in the response. The `toSafeUser()` function strips it.

### 7.2 `POST /api/auth/login`

**Request:**
```json
{
  "email": "player1@example.com",
  "password": "secret123"
}
```

**Database Operations:**
1. `SELECT ... FROM Users WHERE email = $1` — includes `password_hash` in result

**Response (200 OK):**
```json
{
  "user": {
    "user_id": 1,
    "username": "player1",
    "email": "player1@example.com",
    "bio": null,
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 7.3 `GET /api/auth/me` — Protected

**Headers:** `Authorization: Bearer <token>`

**Database Operations:**
1. JWT middleware extracts `user_id` from token (no DB query)
2. `SELECT ... FROM Users WHERE user_id = $1` — fetches current state

**Response (200 OK):**
```json
{
  "user": {
    "user_id": 1,
    "username": "player1",
    "email": "player1@example.com",
    "bio": null,
    "role": "USER"
  }
}
```

---

## 8. Frontend Auth Flow

### 8.1 Token Storage

The JWT is stored in `localStorage` under the key `"token"`. On every API request, the client reads this token and attaches it as an HTTP header:

```typescript
Authorization: Bearer <token>
```

### 8.2 Auto-Login on Page Load

When the frontend application mounts, `AuthProvider` checks for an existing token:

```
App mounts
  → AuthProvider runs useEffect
    → Reads token from localStorage
      → If no token: isLoading = false, user stays null (logged out)
      → If token exists: calls GET /api/auth/me
        → If 200: sets user state (logged in)
        → If 401: removes token from localStorage (expired/invalid)
        → finally: isLoading = false
```

This pattern means the user doesn't need to log in every time they refresh the page — the token persists across browser sessions until it expires.

### 8.3 Protected Routes

The `ProtectedRoute` component wraps pages that require authentication:

```
User navigates to /
  → ProtectedRoute checks AuthContext
    → If isLoading: shows spinner
    → If !isAuthenticated: redirects to /login
    → If isAuthenticated: renders the child component
```

Similarly, `PublicRoute` (for login/register pages) redirects authenticated users to `/` — preventing them from seeing the login form when they're already signed in.

---

## 9. End-to-End Workflows

### 9.1 Registration Workflow

```
┌──────────┐     POST /api/auth/register      ┌──────────────┐
│ Frontend │ ─── {username, email, password}──→│   Backend    │
│  (React) │                                   │  (Express)   │
└──────────┘                                   └──────┬───────┘
                                                      │
                                     ┌────────────────┘
                                     ▼
                           ┌─────────────────┐
                           │ Input validation │
                           │ (all 3 required) │
                           └────────┬────────┘
                                    │
                                    ▼
                           ┌──────────────────────────┐
                           │ SELECT user_id FROM Users│
                           │ WHERE username=$1        │
                           │    OR email=$2           │
                           └────────┬─────────────────┘
                                    │
                          ┌────────┴────────┐
                          │                 │
                    rows > 0             rows = 0
                          │                 │
                    409 Conflict            │
                                           ▼
                                  ┌──────────────────┐
                                  │ bcrypt.hash()    │
                                  │ 10 salt rounds   │
                                  └────────┬─────────┘
                                           │
                                           ▼
                                  ┌────────────────────────────┐
                                  │ INSERT INTO Users          │
                                  │ (username, email, hash)    │
                                  │ RETURNING user_id, ...     │
                                  └────────┬───────────────────┘
                                           │
                                           ▼
                              ┌──────────────────────┐
                              │ toSafeUser() strips  │
                              │ password_hash        │
                              └──────────┬───────────┘
                                         │
                              ┌──────────┴───────────┐
                              │ 201 { user }          │
                              └──────────────────────┘
```

### 9.2 Login Workflow

```
┌──────────┐     POST /api/auth/login          ┌──────────────┐
│ Frontend │ ─── {email, password}─────────────→│   Backend    │
│  (React) │                                   │  (Express)   │
└──────────┘                                   └──────┬───────┘
                                                      │
                                     ┌────────────────┘
                                     ▼
                           ┌──────────────────────────────┐
                           │ SELECT * FROM Users          │
                           │ WHERE email = $1             │
                           │ (includes password_hash!)    │
                           └────────┬─────────────────────┘
                                    │
                          ┌────────┴────────┐
                          │                 │
                    rows = 0            rows = 1
                          │                 │
                    401 Unauthorized         ▼
                                    ┌──────────────────────┐
                                    │ bcrypt.compare()     │
                                    │ (plaintext, hash)    │
                                    └────────┬─────────────┘
                                             │
                                    ┌────────┴────────┐
                                    │                 │
                               mismatch            match
                                    │                 │
                              401 Unauthorized       ▼
                                             ┌──────────────┐
                                             │ jwt.sign()   │
                                             │ payload:     │
                                             │  user_id     │
                                             │  username    │
                                             │  role        │
                                             │ expires: 7d  │
                                             └──────┬───────┘
                                                    │
                                         ┌──────────┴───────────┐
                                         │ 200 { user, token }   │
                                         └──────────────────────┘

┌──────────┐                                         ┌──────────┐
│ Frontend │ ← stores token in localStorage ────────→│ Browser  │
│  (React) │                                         │ Storage  │
└──────────┘                                         └──────────┘
```

### 9.3 Authenticated Request Flow (e.g., `GET /api/auth/me`)

```
┌──────────┐   GET /api/auth/me               ┌──────────────┐
│ Frontend │   Authorization: Bearer <token>   │   Backend    │
│  (React) │ ────────────────────────────────→│  (Express)   │
└──────────┘                                  └──────┬───────┘
                                                     │
                                           ┌─────────┘
                                           ▼
                                  ┌──────────────────┐
                                  │ authMiddleware    │
                                  │ Extracts token    │
                                  │ from header       │
                                  └────────┬─────────┘
                                           │
                                  ┌────────┴────────┐
                                  │ jwt.verify()    │
                                  │                 │
                                  ┌─────┐       ┌─────┐
                                  │Valid│       │Fail │
                                  └──┬──┘       └──┬──┘
                                     │              │
                                     │        401 "Invalid
                                     │        or expired"
                                     ▼
                            ┌──────────────────────┐
                            │ req.user = {         │
                            │   user_id: 1,        │
                            │   username: "...",   │
                            │   role: "USER"       │
                            │ }                    │
                            │ next()               │
                            └──────────┬───────────┘
                                       │
                                       ▼
                              ┌────────────────────────┐
                              │ getMe controller        │
                              │ calls authService       │
                              └────────────┬───────────┘
                                           │
                                           ▼
                                  ┌──────────────────────────┐
                                  │ SELECT user_id, username, │
                                  │ email, bio, role          │
                                  │ FROM Users                │
                                  │ WHERE user_id = $1        │
                                  └────────┬─────────────────┘
                                           │
                              ┌────────────┴────────────┐
                              │ 200 { user }             │
                              └─────────────────────────┘
```

---

## 10. Security Measures

### 10.1 SQL Injection Prevention

Every database query uses **parameterized statements** (`$1`, `$2`, `$3`). The `pg` library sends query text and parameter values as separate messages in the PostgreSQL wire protocol. User input is never interpolated into SQL strings. Example:

```typescript
// SAFE — parameterized
pool.query('SELECT * FROM Users WHERE email = $1', [email])

// UNSAFE — would be vulnerable if used (NOT in this codebase)
pool.query(`SELECT * FROM Users WHERE email = '${email}'`)
```

### 10.2 Password Handling

- Passwords are **never stored in plaintext**. The `password_hash` column contains the bcrypt output.
- The hash is **never returned to the client**. The `toSafeUser()` function destructures `password_hash` out of the user object, and the `RETURNING` clauses in `INSERT`/`SELECT` explicitly list the columns to return, excluding `password_hash` (except in the login query where it's needed for comparison).
- The login and registration error messages are **intentionally vague** — "Invalid email or password" rather than "Email not found" — to prevent user enumeration attacks.

### 10.3 Token Security

- JWT tokens expire after **7 days**, limiting the window of opportunity for a stolen token.
- The `jwtSecret` is stored in an environment variable, not in source code. The `.env.example` file shows the structure without revealing the actual secret.
- The token payload is **small** — it doesn't include the full user object, only `user_id`, `username`, and `role`. Sensitive data never enters the JWT.

### 10.4 Role-Based Authorization

The `role` column in the `Users` table is constrained by a `CHECK` clause. The JWT payload includes the role, which the middleware can use for authorization checks:

```typescript
// Future admin-only middleware (not yet implemented)
if (req.user?.role !== 'ADMIN') {
  return res.status(403).json({ error: { message: 'Forbidden' } });
}
```

The role is stored in the database (single source of truth), embedded in the JWT (for quick checks without a DB query), and validated by a `CHECK` constraint (database-level enforcement).

---

## 11. Key DBMS Concepts Demonstrated

| Concept | Where |
|---------|-------|
| **Primary Key** | `user_id SERIAL PRIMARY KEY` — unique row identifier with auto-increment |
| **Unique Constraint** | `username` and `email` — prevents duplicate accounts at the DB level |
| **Check Constraint** | `role IN ('USER', 'ADMIN', 'DEVELOPER')` — domain integrity enforcement |
| **Not Null Constraint** | `username`, `email`, `password_hash` — prevents corrupted/incomplete rows |
| **Default Value** | `role DEFAULT 'USER'` — sensible default for new registrations |
| **Parameterized Queries** | All SQL uses `$1, $2, $3` — SQL injection prevention |
| **RETURNING Clause** | `INSERT ... RETURNING` — avoids a separate SELECT, single round-trip |
| **Index Usage** | Unique indexes on `username` and `email` speed up login/register checks |
| **Connection Pooling** | `pg.Pool` manages connection lifecycle — reuse, not reconnect per request |
| **Data Isolation** | `password_hash` is never returned to the client — `toSafeUser()` strips it |
