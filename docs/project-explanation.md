# GameStore Project Explanation

## 1. Project Overview

This repository is a university database management systems project for a video game store. The project demonstrates a typical three-layer web application:

1. A PostgreSQL database stores users, games, purchases, libraries, carts, reviews, friends, and other store data.
2. A TypeScript Express backend exposes REST API endpoints and runs SQL queries against PostgreSQL.
3. A React TypeScript frontend provides the browser interface for browsing games, authentication, carts, libraries, and friends.

The project is useful for COMP 306 because most features are backed by relational database concepts: primary keys, foreign keys, many-to-many tables, check constraints, unique constraints, joins, aggregate queries, and parameterized SQL.

## 2. Repository Structure

The repository root contains these main parts:

- `backend/`: Express API written in TypeScript.
- `frontend/`: React + Vite client written in TypeScript.
- `database/`: SQL schema, sample data, and test queries.
- `docs/`: project documentation (setup, architecture, testing, auth design).
- `docker-compose.yml`: starts a PostgreSQL database container.

The backend and frontend are separate Node projects. Each has its own `package.json`, `package-lock.json`, TypeScript configuration, and dependencies.

## 3. Database Design

The database schema is defined in `database/schema.sql`. It creates a PostgreSQL database model for a digital game store.

### Main Tables

- `Users`: stores account information such as username, email, bcrypt password hash, bio, profile image URL, and role.
- `DeveloperProfiles`: gives developer users a studio name.
- `Games`: stores game metadata such as name, description, price, developer, release date, and cover image URL.
- `Genres`: stores genre names.
- `GameGenres`: many-to-many bridge table connecting games and genres.
- `Wishlists`: many-to-many table for games users want.
- `Purchases`: purchase header records with user, total price, date, and payment method.
- `PurchaseItems`: games inside each purchase, including price at purchase time.
- `Carts`: one shopping cart per user.
- `CartItems`: games currently in a cart.
- `Library`: games owned by a user, including purchase date and hours played.
- `Reviews`: one review per user per game.
- `Favorites`: games marked as favorites by users.
- `Gifts`: gift records between users.
- `Friends`: friend requests and accepted friend relationships.

### Important Relationships

- One `Users` row can have one `DeveloperProfiles` row if the user is a developer.
- One developer can publish many `Games`.
- One game can have many genres, and one genre can belong to many games through `GameGenres`.
- One user can have many purchases, reviews, wishlist entries, favorites, gifts, library entries, and friend relationships.
- One user has at most one cart because `Carts.user_id` is unique.
- Each `CartItems` row connects one cart to one game.
- Each `PurchaseItems` row connects one purchase to one game.

### Constraints and DBMS Concepts

The schema uses many database constraints instead of relying only on application code:

- Primary keys uniquely identify rows, such as `Users.user_id` and `Games.game_id`.
- Composite primary keys prevent duplicate relationships, such as duplicate cart items or duplicate library entries.
- Foreign keys preserve referential integrity between tables.
- `ON DELETE CASCADE` removes dependent rows when the parent is deleted, such as deleting a user's cart when the user is deleted.
- `ON DELETE SET NULL` keeps games when a developer profile is deleted by setting `developer_user_id` to null.
- `ON DELETE RESTRICT` prevents deleting games that are referenced by purchases, carts, libraries, or gifts.
- Unique constraints prevent duplicate usernames, duplicate emails, and duplicate user-game reviews.
- Check constraints restrict values such as user role, payment method, gift status, friend status, rating range, non-negative prices, and non-negative hours played.
- Default values fill fields such as `profile_image_url`, `role`, `purchase_date`, `added_at`, and `created_at`.

### Sample Data

`database/sample_data.sql` inserts a repeatable realistic demo dataset: 20 users, 4 developer profiles, 32 games, 15 genres, 64 game-genre links, 20 purchases, 41 purchase items, 46 library rows, 29 reviews, 45 wishlist rows, 34 favorite rows, 12 gifts, 10 carts, 20 cart items, and 24 friend relationships.

Important note: `docker-compose.yml` automatically runs `database/schema.sql` when the database container is first created, but it does not automatically load `sample_data.sql`. You should load the sample data manually if you want the frontend store and login tests to have meaningful data.

### Test Queries

`database/test_queries.sql` contains SQL statements for inspecting the database manually. These queries select users, games, genres, developers, game genres, wishlists, purchases, library contents, reviews, favorites, gifts, bios, and wishlist joins.

## 4. Backend Architecture

The backend lives in `backend/` and uses:

- Express 5 for HTTP routing.
- `pg` for PostgreSQL access.
- `dotenv` for environment variables.
- `bcrypt` for password hashing.
- `jsonwebtoken` for JWT authentication.
- `tsx` for running TypeScript directly in development.

The backend follows this flow:

`Route -> Controller -> Service -> PostgreSQL`

Routes define URLs and middleware. Controllers validate request data and send responses. Services contain business logic and SQL queries. The database pool manages PostgreSQL connections.

### Backend Entry Points

- `backend/src/index.ts` starts the Express server on the configured port.
- `backend/src/app.ts` creates the Express app, enables CORS, parses JSON/form bodies, mounts routes under `/api`, and registers the error handler.
- `backend/src/config/index.ts` loads environment variables and exports the API port, database settings, and JWT secret.
- `backend/src/db/pool.ts` creates a shared `pg.Pool` for database queries.

### Middleware

- `authMiddleware` reads the `Authorization: Bearer <token>` header, verifies the JWT, and attaches decoded user data to `req.user`.
- `errorHandler` catches thrown errors, logs the stack trace, and returns JSON in the format `{ error: { message } }`.

## 5. Backend API

All backend routes are mounted under `/api`.

### Health and Demo

- `GET /api`: returns `{ status: "ok", timestamp }`.
- `GET /api/hello`: returns `{ message: "Hello, World!" }`.

### Authentication

- `POST /api/auth/register`: creates a new user.
- `POST /api/auth/login`: verifies credentials and returns a JWT.
- `GET /api/auth/me`: protected endpoint that returns the current user.

Registration checks for existing username or email, hashes the password with bcrypt, inserts the user, and returns a safe user object without `password_hash`. Login selects the user by email, compares the plaintext password with the stored bcrypt hash, signs a JWT for 7 days, and returns `{ user, token }`.

### Games and Genres

- `GET /api/games`: lists games.
- `GET /api/games/:id`: returns one game by ID.
- `GET /api/genres`: lists genres alphabetically.

The games query supports:

- `search`: case-insensitive search by game name.
- `genre`: exact genre name filter.
- `minPrice` and `maxPrice`: numeric price filters.
- `sort`: supported values include price ascending/descending, rating ascending/descending, release date ascending/descending, and name descending. The default behavior is name ascending.

The SQL joins `Games`, `DeveloperProfiles`, `GameGenres`, `Genres`, `Reviews`, and `Wishlists`. It returns each game with genres, average rating, review count, wishlist count, developer/studio information, and price.

### Library

- `GET /api/library`: protected endpoint that returns the current user's owned games.

The library query joins the current user's `Library` rows to games and returns game summaries plus `purchase_date` and `hours_played`.

### Cart

- `GET /api/cart`: protected endpoint that returns cart items.
- `POST /api/cart/items`: protected endpoint that adds a game to the cart.
- `DELETE /api/cart/items/:gameId`: protected endpoint that removes one item.
- `DELETE /api/cart`: protected endpoint that clears the cart.

The cart service creates a cart automatically if the user does not already have one. It prevents adding a game the user already owns and prevents duplicate cart items.

There is currently no backend checkout endpoint that turns cart items into purchases and library entries.

### User Profile

- `PUT /api/users/me`: protected endpoint that updates the current user's username, bio, and profile image URL.

The backend has this endpoint, but the current frontend does not appear to expose a profile editing form.

### Friends

- `GET /api/friends`: protected endpoint that lists accepted friends.
- `GET /api/friends/pending`: protected endpoint that lists pending incoming friend requests.
- `POST /api/friends/requests`: protected endpoint that sends a friend request.
- `POST /api/friends/requests/accept/:senderId`: protected endpoint that accepts a pending request.

The database stores one row for the relationship. A pending row has `user_id` as the sender and `friend_id` as the receiver. Accepting a request updates the status to `ACCEPTED`.

## 6. Frontend Architecture

The frontend lives in `frontend/` and uses:

- React 19.
- Vite.
- React Router.
- TypeScript.
- HeroUI components.
- Tailwind CSS v4.

### Main Entry Points

- `frontend/src/main.tsx` mounts the React app.
- `frontend/src/App.tsx` defines routes and wraps the app in `AuthProvider` and `CartProvider`.
- `frontend/src/index.css` contains the global styling for auth pages, navbar, dashboard, store, cards, cart, library, and detail pages.

### API Client Layer

`frontend/src/api/client.ts` defines `apiFetch`. It builds API URLs from `VITE_API_URL`, adds `Content-Type: application/json`, reads `token` from `localStorage`, attaches it as `Authorization: Bearer <token>`, parses JSON, and throws an `Error` when the backend returns a non-OK response.

Other frontend API files wrap specific backend endpoints:

- `api/auth.ts`: register, login, get current user.
- `api/games.ts`: get games, genres, game detail, and library.
- `api/cart.ts`: get cart, add item, remove item, clear cart.
- `api/friends.ts`: get friends, get pending requests, send request, accept request.

### Authentication State

`AuthProvider` stores the logged-in user in React state and stores the JWT in browser `localStorage`.

On app load:

1. It checks for a saved token.
2. If a token exists, it calls `GET /api/auth/me`.
3. If the token is valid, it restores the user.
4. If the token is invalid or expired, it removes the token and logs the user out.

`ProtectedRoute` redirects unauthenticated users to `/login`. `PublicRoute` redirects already-authenticated users away from login/register pages back to `/`.

### Cart State

`CartProvider` fetches the current cart, stores items in React state, computes item count, exposes `addToCart`, `removeFromCart`, `clearCart`, and `isInCart`, and resets itself when authentication state changes.

## 7. Frontend Pages and Components

### Pages

- `LoginPage`: login form with email and password validation. On success, navigates to the store.
- `RegisterPage`: registration form with username, email, password, and confirm password. On success, navigates to login.
- `StorePage`: public game browsing page with search, genre filter, sort dropdown, loading states, and empty states.
- `GameDetailPage`: public game detail page with genres, rating, release date, developer, description, and add-to-cart behavior.
- `CartPage`: authenticated cart display with remove, clear cart, subtotal, estimated tax, and total.
- `LibraryPage`: protected library page showing owned games, played hours, purchase dates, and client-side library search.
- `DashboardPage`: protected user dashboard showing account info, role, user ID, friends panel, and sign out button.
- `HomePage`: a landing page component exists, but it is not currently mounted in `App.tsx`.

### Components

- `AppLayout`: renders the navbar and nested routed page content.
- `Navbar`: shows store navigation, library/friends links for authenticated users, cart count, avatar menu, and sign in link.
- `ProtectedRoute`: prevents access to authenticated pages when logged out.
- `AuthLayout`: shared layout for login and registration.
- `BrandLogo`: CSS-based logo.
- `GameCard`: reusable store/library card with rating, genres, price, add-to-cart, and play display.
- `FriendsPanel`: dashboard widget that lists friends and incoming friend requests.

## 8. Current Features

The currently implemented user-facing features are:

- User registration.
- User login/logout.
- Persistent login through JWT in local storage.
- Public game browsing.
- Search games by name.
- Filter games by genre.
- Sort games.
- View game details.
- Add games to cart while authenticated.
- Prevent adding games already in cart.
- Prevent adding games already owned.
- View cart.
- Remove individual cart items.
- Clear cart.
- View a price summary with estimated tax.
- View owned game library.
- Search within the library.
- View dashboard user information.
- View friends and pending friend requests.
- Accept incoming friend requests.

The currently implemented backend-only or database-only features are:

- User profile update endpoint.
- Wishlist schema and sample rows.
- Purchase and purchase item schema/sample rows.
- Reviews schema/sample rows.
- Favorites schema/sample rows.
- Gifts schema/sample rows.
- Sending friend requests via API.

## 9. Current Limitations and Caveats

- There are no automated tests. The backend `npm test` script intentionally exits with an error, and the frontend has no test script.
- `sample_data.sql` is not automatically loaded by Docker Compose.
- Checkout, wishlist, review, favorites, gifts, profile editing, admin, and developer screens are implemented, but the flows should still be manually tested with the seeded data before presentation.
- Gift handling is functional for sending, accepting, rejecting, and cancelling, but it does not yet model a real payment for gifted games.
- Friends can be created and accepted, but friend removal, request rejection, and block/unblock controls could be expanded.
- The backend default JWT secret is hardcoded as a fallback. For local development this works, but in a real deployment `JWT_SECRET` should always be set in `.env`.
- Some source comments have typos and informal wording, but they do not change runtime behavior.

## 10. How the Full App Works End to End

A typical login-and-cart flow works like this:

1. The user opens the React frontend.
2. The frontend calls backend routes through `apiFetch`.
3. The user logs in with email and password.
4. The backend loads the user by email from PostgreSQL.
5. The backend compares the submitted password with the stored bcrypt hash.
6. The backend signs a JWT and returns it to the frontend.
7. The frontend saves the JWT in `localStorage`.
8. Future API requests include `Authorization: Bearer <token>`.
9. Protected backend routes verify the token and read `req.user.user_id`.
10. Store pages fetch game data using SQL joins and aggregates.
11. Adding a game to the cart inserts into `Carts` and `CartItems`.
12. The cart page reads cart rows back from PostgreSQL and calculates frontend totals.
13. The library page reads owned games from the `Library` table.

This separation is the main architecture idea of the project: React handles UI state and navigation, Express handles HTTP/API logic, services handle business rules, and PostgreSQL enforces the relational model.
