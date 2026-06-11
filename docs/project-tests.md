# GameHub Manual Testing Guide

## 1. Purpose

The repository currently does not contain real automated unit/integration tests, so most verification is manual through:

- The React frontend in the browser.
- The Express API using curl, PowerShell, Postman, Insomnia, or Thunder Client.
- PostgreSQL queries using `database/test_queries.sql`.

For setup instructions, use [how-to-run.md](./how-to-run.md) first.

## 2. Before Testing

Make sure these are running:

- PostgreSQL database on port `5432`.
- Backend API on `http://localhost:3000/api`.
- Frontend on the Vite URL, usually `http://localhost:5173`.

Also make sure sample data is loaded. Without sample data, the store page may be empty and the seeded login accounts will not exist.

Useful health checks:

```powershell
curl.exe http://localhost:3000/api
curl.exe http://localhost:3000/api/hello
```

Expected results:

- `/api` returns JSON with `status: "ok"`.
- `/api/hello` returns `{ "message": "Hello, World!" }`.

## 3. Seeded Accounts

The sample data includes bcrypt hashes with plaintext passwords documented as SQL comments. You can use these accounts after loading `database/sample_data.sql`:

- `taha@test.com` / `sigma67_lover`
- `emren@test.com` / `womenfearme`
- `joel@test.com` / `frontendfull`
- `berk@test.com` / `helloguys`
- `ömer@test.com` / `ilvposgre`
- `ali@test.com` / `JaxLover`

## 4. Authentication Tests

### Register a New User

Browser steps:

1. Open the frontend.
2. Click `Sign In`.
3. Go to `Create one`.
4. Enter a unique username, a unique email, and a password with at least 6 characters.
5. Confirm the password.
6. Submit the form.

Expected result:

- You are redirected to `/login`.
- The user is inserted into the `Users` table.
- The password is stored as a bcrypt hash, not plaintext.

API equivalent:

```powershell
curl.exe -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d "{\"username\":\"testuser\",\"email\":\"testuser@example.com\",\"password\":\"secret123\"}"
```

### Register With Duplicate Username or Email

Steps:

1. Try to register with an email or username that already exists.
2. Use `taha@test.com` or another existing sample email.

Expected result:

- The backend returns a conflict error.
- The frontend shows an error message.
- No duplicate user is inserted because the database also has unique constraints.

### Login Successfully

Browser steps:

1. Open `/login`.
2. Enter `taha@test.com`.
3. Enter `sigma67_lover`.
4. Submit.

Expected result:

- You are redirected to the store.
- The navbar shows authenticated links such as `Library`, `Friends`, `Cart`, and the avatar.
- A JWT token is stored in browser `localStorage` under `token`.

API equivalent:

```powershell
curl.exe -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"taha@test.com\",\"password\":\"sigma67_lover\"}"
```

Expected API result:

- Response contains `user`.
- Response contains `token`.
- Response does not contain `password_hash`.

### Login With Wrong Password

Steps:

1. Open `/login`.
2. Use a valid email.
3. Enter the wrong password.

Expected result:

- Login fails.
- The error message says the email or password is invalid.
- No token is stored.

### Current User Endpoint

Steps:

1. Login through the API and copy the returned token.
2. Call `/api/auth/me` with the token.

```powershell
curl.exe http://localhost:3000/api/auth/me `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected result:

- The backend returns the current user.
- The response excludes `password_hash`.

### Protected Route Redirects

Browser steps:

1. Log out.
2. Visit `/library`.
3. Visit `/dashboard`.

Expected result:

- You are redirected to `/login`.

## 5. Store Browsing Tests

### Load Store

Steps:

1. Open the frontend.
2. Visit `/` or `/store`.

Expected result:

- The page title is `Browse Games`.
- Sample games are shown if sample data was loaded.
- Each card shows game name, genres, rating, review count, price, and an add-to-cart button.

### Search Games

Steps:

1. Type `Hollow` in the search field.
2. Wait briefly for the debounce.

Expected result:

- `Hollow Knight` appears.
- Non-matching games disappear.

API equivalent:

```powershell
curl.exe "http://localhost:3000/api/games?search=Hollow"
```

### Filter by Genre

Steps:

1. Open the genre dropdown.
2. Select `Action`, `RPG`, or another seeded genre.

Expected result:

- Only games connected to that genre are shown.

API equivalent:

```powershell
curl.exe "http://localhost:3000/api/games?genre=Action"
```

### Sort Games

Steps:

1. Use the sort dropdown.
2. Test `Newest`, `Highest Rated`, `Price: Low to High`, `Price: High to Low`, and `Name: A to Z`.

Expected result:

- The order changes according to the selected sort.

API equivalent:

```powershell
curl.exe "http://localhost:3000/api/games?sort=price_asc"
curl.exe "http://localhost:3000/api/games?sort=rating_desc"
```

### Price Filters Through API

The current UI does not expose min/max price inputs, but the backend supports them.

```powershell
curl.exe "http://localhost:3000/api/games?minPrice=10&maxPrice=30"
```

Expected result:

- Only games with prices between 10 and 30 are returned.

Also test invalid values:

```powershell
curl.exe "http://localhost:3000/api/games?minPrice=-1"
curl.exe "http://localhost:3000/api/games?minPrice=50&maxPrice=10"
```

Expected result:

- The backend returns a `400` error.

### Game Detail Page

Steps:

1. Click a game card.
2. Confirm the URL looks like `/store/1`.

Expected result:

- Detail page shows name, developer, release date, stars, review count, genres, description, and price.
- Invalid IDs, such as `/store/abc`, show an invalid game ID message.
- Missing IDs, such as `/store/99999`, show a not found message.

## 6. Cart Tests

### Add Game to Cart

Steps:

1. Login as a user.
2. Go to the store.
3. Click `Add to Cart` on a game the user does not already own.
4. Open the cart.

Expected result:

- The cart count in the navbar increases.
- The cart page lists the game.
- The cart summary shows subtotal, estimated tax, and total.

Good candidate for `taha@test.com`:

- Taha already owns several games in the sample library, so choose a game not in Taha's library, such as `Warzone Champions` if available.

### Add While Logged Out

Steps:

1. Log out.
2. Open the store.
3. Click `Add to Cart`.

Expected result:

- You are redirected to `/login`.
- No cart item is added.

### Duplicate Cart Item

Steps:

1. Login.
2. Add a game to the cart.
3. Try to add the same game again.

Expected result:

- In the UI, the button changes to `In Cart`.
- The backend also rejects duplicate insert attempts with a conflict error.

API equivalent:

```powershell
curl.exe -X POST http://localhost:3000/api/cart/items `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -d "{\"game_id\":8}"
```

Run it twice with the same token and same `game_id`. The second call should fail with a conflict.

### Add Owned Game

Steps:

1. Login as `taha@test.com`.
2. Try to add a game Taha already owns, such as game ID `1`.

Expected result:

- Backend rejects the request with `You already own this game`.
- In some UI flows, owned status is mainly handled on the detail page after loading the library.

API equivalent:

```powershell
curl.exe -X POST http://localhost:3000/api/cart/items `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -d "{\"game_id\":1}"
```

### Remove Cart Item

Steps:

1. Open `/cart`.
2. Click the remove button on an item.

Expected result:

- The item disappears.
- The navbar cart count decreases.
- Totals recalculate.

### Clear Cart

Steps:

1. Add one or more games to the cart.
2. Open `/cart`.
3. Click `Clear Cart`.

Expected result:

- Cart becomes empty.
- Empty cart message appears.

### Checkout Button

Steps:

1. Add items to the cart.
2. Open `/cart`.
3. Click `Proceed to Checkout`.

Expected result:

- Current limitation: nothing is sent to the backend. There is no checkout endpoint yet.
- No purchase or library row should be created by this button.

## 7. Library Tests

### View Library

Steps:

1. Login as `taha@test.com`.
2. Open `/library`.

Expected result:

- Taha's library entries appear.
- The header shows number of games and total hours played.
- Each game card shows played hours and purchase/add date.

API equivalent:

```powershell
curl.exe http://localhost:3000/api/library `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Search Library

Steps:

1. Open `/library`.
2. Search for a game in the user's library, such as `Hollow`.

Expected result:

- Matching library games remain visible.
- Non-matching library games are hidden.
- This search is performed client-side after the library has loaded.

### Library Requires Login

Steps:

1. Log out.
2. Visit `/library`.

Expected result:

- You are redirected to `/login`.

## 8. Dashboard and Friends Tests

### View Dashboard

Steps:

1. Login.
2. Open `/dashboard` or click `Friends` in the navbar.

Expected result:

- Dashboard displays username, email, role badge, and user ID.
- Friends panel displays accepted friends and pending invites.
- Sign out button logs the user out.

### Friend List API

```powershell
curl.exe http://localhost:3000/api/friends `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected result:

- Returns `{ "friends": [...] }`.
- With only the provided seed data, there may be no accepted friends unless you create some manually.

### Pending Requests API

```powershell
curl.exe http://localhost:3000/api/friends/pending `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected result:

- Returns incoming pending friend requests.

### Send Friend Request

The backend supports sending friend requests, but the current frontend does not show a form for it. Test this through the API.

```powershell
curl.exe -X POST http://localhost:3000/api/friends/requests `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer SENDER_TOKEN_HERE" `
  -d "{\"receiver_id\":4}"
```

Expected result:

- Backend returns `Friend request sent`.
- A row appears in `Friends` with status `PENDING`.

Edge cases:

- Sending a request to yourself should return `400`.
- Sending a duplicate or reverse duplicate request should return `409`.

### Accept Friend Request

Steps:

1. Login as the receiving user.
2. Open `/dashboard`.
3. If a pending request exists, click `Accept`.

Expected result:

- Request disappears from pending invites.
- Sender appears in the accepted friends list.

API equivalent:

```powershell
curl.exe -X POST http://localhost:3000/api/friends/requests/accept/1 `
  -H "Authorization: Bearer RECEIVER_TOKEN_HERE"
```

Replace `1` with the sender's user ID.

## 9. Profile Update API Test

The backend has a profile update endpoint, but the frontend does not expose it.

```powershell
curl.exe -X PUT http://localhost:3000/api/users/me `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -d "{\"username\":\"newname\",\"bio\":\"Updated bio\",\"profile_image_url\":\"new.jpg\"}"
```

Expected result:

- Backend returns the updated user.
- `Users.username`, `Users.bio`, and `Users.profile_image_url` change in PostgreSQL.

Caution:

- If you update a username to one that already exists, PostgreSQL's unique constraint should reject it.

## 10. Database Query Tests

After loading sample data, run the queries in `database/test_queries.sql` to verify relationships.

Using Docker:

```powershell
Get-Content .\database\test_queries.sql | docker compose exec -T db psql -U postgres -d game_store_db
```

Useful manual queries:

```sql
SELECT * FROM Users;
SELECT * FROM Games;
SELECT * FROM Friends;
SELECT * FROM Carts;
SELECT * FROM CartItems;
SELECT * FROM Library;
```

Relationship checks:

```sql
SELECT g.name, ge.genre_name
FROM GameGenres gg
JOIN Games g ON gg.game_id = g.game_id
JOIN Genres ge ON gg.genre_id = ge.genre_id
ORDER BY g.name;
```

```sql
SELECT u.username, g.name, l.hours_played
FROM Library l
JOIN Users u ON l.user_id = u.user_id
JOIN Games g ON l.game_id = g.game_id;
```

```sql
SELECT sender.username AS sender, recipient.username AS recipient, f.status
FROM Friends f
JOIN Users sender ON sender.user_id = f.user_id
JOIN Users recipient ON recipient.user_id = f.friend_id;
```

## 11. Build and Static Checks

There are no automated tests, but you can run type and lint checks.

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

Expected result:

- Ideally all commands pass.
- If build fails because of an unused or missing file, treat it as a project issue to fix before submission.

## 12. Remaining Manual Test Gaps

These flows are implemented, but should be manually tested before submission with the seeded dataset:

- Checkout and purchase creation.
- Wishlist, favorites, and review management.
- Gift sending, accepting, rejecting, and cancelling.
- Profile editing through the UI.
- Friend request sending and accepting.
- Admin-only user role/game/genre/report screens.
- Developer-only game management screens.

You can also test the underlying data directly with SQL because the seed includes meaningful rows for all major tables.
