import pool from '../db/pool.js';
import { Review } from '../types/index.js';

export async function getGameReviews(gameId: number): Promise<Review[]> {
  const result = await pool.query<Review>(
    `SELECT
        r.review_id,
        r.user_id,
        u.username,
        r.game_id,
        r.rating,
        r.comment,
        r.review_date
      FROM Reviews r
      JOIN Users u ON u.user_id = r.user_id
      WHERE r.game_id = $1
      ORDER BY r.review_date DESC, r.review_id DESC`,
    [gameId],
  );

  return result.rows;
}

export async function upsertReview(
  userId: number,
  gameId: number,
  rating: number,
  comment: string | null,
): Promise<Review> {
  const ownsGame = await pool.query(
    'SELECT 1 FROM Library WHERE user_id = $1 AND game_id = $2',
    [userId, gameId],
  );

  if (ownsGame.rows.length === 0) {
    const err = new Error('You can only review games in your library') as Error & { status: number };
    err.status = 403;
    throw err;
  }

  const result = await pool.query<Review>(
    `INSERT INTO Reviews (user_id, game_id, rating, comment)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, game_id)
     DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, review_date = CURRENT_DATE
     RETURNING
       review_id,
       user_id,
       (SELECT username FROM Users WHERE user_id = $1) AS username,
       game_id,
       rating,
       comment,
       review_date`,
    [userId, gameId, rating, comment],
  );

  return result.rows[0];
}

export async function deleteReview(userId: number, gameId: number): Promise<void> {
  await pool.query(
    'DELETE FROM Reviews WHERE user_id = $1 AND game_id = $2',
    [userId, gameId],
  );
}
