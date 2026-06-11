import pool from '../db/pool.js';
import { GameSummary } from '../types/index.js';
import { AdminGameInput, createGame, deleteGame, updateGame } from './adminService.js';

async function ensureDeveloperProfile(userId: number): Promise<void> {
  const result = await pool.query(
    'SELECT 1 FROM DeveloperProfiles WHERE user_id = $1',
    [userId],
  );

  if (result.rows.length === 0) {
    const err = new Error('Developer profile is missing') as Error & { status: number };
    err.status = 400;
    throw err;
  }
}

async function ensureOwnsGame(userId: number, gameId: number): Promise<void> {
  const result = await pool.query(
    'SELECT 1 FROM Games WHERE game_id = $1 AND developer_user_id = $2',
    [gameId, userId],
  );

  if (result.rows.length === 0) {
    const err = new Error('Developer game not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
}

export async function getDeveloperGames(userId: number): Promise<GameSummary[]> {
  await ensureDeveloperProfile(userId);

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
        COUNT(DISTINCT w.user_id)::INTEGER AS wishlist_count
      FROM Games g
      JOIN DeveloperProfiles dp ON dp.user_id = g.developer_user_id
      LEFT JOIN GameGenres gg ON gg.game_id = g.game_id
      LEFT JOIN Genres ge ON ge.genre_id = gg.genre_id
      LEFT JOIN Reviews r ON r.game_id = g.game_id
      LEFT JOIN Wishlists w ON w.game_id = g.game_id
      WHERE g.developer_user_id = $1
      GROUP BY g.game_id, dp.studio_name
      ORDER BY g.name ASC`,
    [userId],
  );

  return result.rows;
}

export async function createDeveloperGame(userId: number, input: AdminGameInput) {
  await ensureDeveloperProfile(userId);
  return createGame({ ...input, developer_user_id: userId });
}

export async function updateDeveloperGame(
  userId: number,
  gameId: number,
  input: AdminGameInput,
) {
  await ensureDeveloperProfile(userId);
  await ensureOwnsGame(userId, gameId);
  return updateGame(gameId, { ...input, developer_user_id: userId });
}

export async function deleteDeveloperGame(userId: number, gameId: number): Promise<void> {
  await ensureDeveloperProfile(userId);
  await ensureOwnsGame(userId, gameId);
  await deleteGame(gameId);
}
