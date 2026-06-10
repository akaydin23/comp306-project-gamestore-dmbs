import pool from '../db/pool.js';
import { GameSummary, CartItem } from '../types/index.js';

async function ensureCart(userId: number): Promise<number> {
  await pool.query(
    'INSERT INTO Carts (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
    [userId],
  );

  const result = await pool.query<{ cart_id: number }>(
    'SELECT cart_id FROM Carts WHERE user_id = $1',
    [userId],
  );

  return result.rows[0].cart_id;
}

export async function getCart(userId: number): Promise<CartItem[]> {
  const cartResult = await pool.query<{ cart_id: number }>(
    'SELECT cart_id FROM Carts WHERE user_id = $1',
    [userId],
  );

  if (cartResult.rows.length === 0) return [];

  const cartId = cartResult.rows[0].cart_id;

  const result = await pool.query<GameSummary & { added_at: string }>(
    `SELECT
        g.game_id,
        g.name,
        g.description,
        g.price::FLOAT AS price,
        g.developer_user_id,
        dp.studio_name,
        g.release_date,
        g.cover_image_url,
        array_agg(DISTINCT ge.genre_name) FILTER (WHERE ge.genre_name IS NOT NULL) AS genres,
        ROUND(AVG(r.rating))::FLOAT AS average_rating,
        COUNT(DISTINCT r.review_id)::INTEGER AS review_count,
        COUNT(DISTINCT w.user_id)::INTEGER AS wishlist_count,
        ci.added_at
      FROM CartItems ci
      JOIN Games g ON g.game_id = ci.game_id
      LEFT JOIN DeveloperProfiles dp ON dp.user_id = g.developer_user_id
      LEFT JOIN GameGenres gg ON gg.game_id = g.game_id
      LEFT JOIN Genres ge ON ge.genre_id = gg.genre_id
      LEFT JOIN Reviews r ON r.game_id = g.game_id
      LEFT JOIN Wishlists w ON w.game_id = g.game_id
      WHERE ci.cart_id = $1
      GROUP BY g.game_id, dp.studio_name, ci.added_at
      ORDER BY ci.added_at DESC`,
    [cartId],
  );

  return result.rows.map((row) => {
    const { added_at, ...game } = row;
    return { game: game as GameSummary, added_at };
  });
}

export async function addToCart(userId: number, gameId: number): Promise<void> {
  const owned = await pool.query(
    'SELECT 1 FROM Library WHERE user_id = $1 AND game_id = $2',
    [userId, gameId],
  );
  if (owned.rows.length > 0) {
    const err = new Error('You already own this game') as Error & { status: number };
    err.status = 409;
    throw err;
  }

  const cartId = await ensureCart(userId);

  const existing = await pool.query(
    'SELECT 1 FROM CartItems WHERE cart_id = $1 AND game_id = $2',
    [cartId, gameId],
  );
  if (existing.rows.length > 0) {
    const err = new Error('Game is already in your cart') as Error & { status: number };
    err.status = 409;
    throw err;
  }

  await pool.query(
    'INSERT INTO CartItems (cart_id, game_id) VALUES ($1, $2)',
    [cartId, gameId],
  );
}

export async function removeFromCart(userId: number, gameId: number): Promise<void> {
  const cartResult = await pool.query<{ cart_id: number }>(
    'SELECT cart_id FROM Carts WHERE user_id = $1',
    [userId],
  );

  if (cartResult.rows.length === 0) return;

  await pool.query(
    'DELETE FROM CartItems WHERE cart_id = $1 AND game_id = $2',
    [cartResult.rows[0].cart_id, gameId],
  );
}

export async function clearCart(userId: number): Promise<void> {
  await pool.query(
    'DELETE FROM CartItems WHERE cart_id IN (SELECT cart_id FROM Carts WHERE user_id = $1)',
    [userId],
  );
}
