import pool from '../db/pool.js';
import { LibraryEntry, GameSummary } from '../types/index.js';

export async function getUserLibrary(userId: number): Promise<LibraryEntry[]> {
  const result = await pool.query<GameSummary & { purchase_date: string | null; hours_played: number }>(
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
        l.purchase_date,
        l.hours_played::INTEGER AS hours_played
      FROM Library l
      JOIN Games g ON g.game_id = l.game_id
      LEFT JOIN DeveloperProfiles dp ON dp.user_id = g.developer_user_id
      LEFT JOIN GameGenres gg ON gg.game_id = g.game_id
      LEFT JOIN Genres ge ON ge.genre_id = gg.genre_id
      LEFT JOIN Reviews r ON r.game_id = g.game_id
      LEFT JOIN Wishlists w ON w.game_id = g.game_id
      WHERE l.user_id = $1
      GROUP BY g.game_id, dp.studio_name, l.purchase_date, l.hours_played
      ORDER BY l.purchase_date DESC, g.name ASC`,
    [userId],
  );

  return result.rows.map((row) => {
    const { purchase_date, hours_played, ...game } = row;
    return {
      game: game as GameSummary,
      purchase_date,
      hours_played,
    };
  });
}
