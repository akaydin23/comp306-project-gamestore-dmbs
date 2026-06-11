import pool from '../db/pool.js';
import { GameSummary } from '../types/index.js';

export async function getWishlist(userId: number): Promise<GameSummary[]> {
  const result = await pool.query<GameSummary>(
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
        COUNT(DISTINCT w_all.user_id)::INTEGER AS wishlist_count
      FROM Wishlists w
      JOIN Games g ON g.game_id = w.game_id
      LEFT JOIN DeveloperProfiles dp ON dp.user_id = g.developer_user_id
      LEFT JOIN GameGenres gg ON gg.game_id = g.game_id
      LEFT JOIN Genres ge ON ge.genre_id = gg.genre_id
      LEFT JOIN Reviews r ON r.game_id = g.game_id
      LEFT JOIN Wishlists w_all ON w_all.game_id = g.game_id
      WHERE w.user_id = $1
      GROUP BY g.game_id, dp.studio_name, w.added_at
      ORDER BY w.added_at DESC, g.name ASC`,
    [userId],
  );

  return result.rows;
}

export async function getWishlistIds(userId: number): Promise<number[]> {
  const result = await pool.query<{ game_id: number }>(
    'SELECT game_id FROM Wishlists WHERE user_id = $1 ORDER BY added_at DESC',
    [userId],
  );

  return result.rows.map((row) => row.game_id);
}

export async function addToWishlist(userId: number, gameId: number): Promise<void> {
  const game = await pool.query('SELECT 1 FROM Games WHERE game_id = $1', [gameId]);

  if (game.rows.length === 0) {
    const err = new Error('Game not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  await pool.query(
    `INSERT INTO Wishlists (user_id, game_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, game_id) DO NOTHING`,
    [userId, gameId],
  );
}

export async function removeFromWishlist(userId: number, gameId: number): Promise<void> {
  await pool.query(
    'DELETE FROM Wishlists WHERE user_id = $1 AND game_id = $2',
    [userId, gameId],
  );
}
