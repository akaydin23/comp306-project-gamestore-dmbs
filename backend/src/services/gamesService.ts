import pool from '../db/pool.js';
import { GameFilters, GameSummary } from '../types/index.js';

function getSortClause(sort?: string): string {
  if (sort === 'price_asc') return 'g.price ASC, g.name ASC';
  if (sort === 'price_desc') return 'g.price DESC, g.name ASC';
  if (sort === 'rating_desc') return 'average_rating DESC, review_count DESC, g.name ASC';
  if (sort === 'rating_asc') return 'average_rating ASC, g.name ASC';
  if (sort === 'release_desc') return 'g.release_date DESC NULLS LAST, g.name ASC';
  if (sort === 'release_asc') return 'g.release_date ASC NULLS LAST, g.name ASC';
  if (sort === 'name_desc') return 'g.name DESC';
  return 'g.name ASC';
}

export async function getGames(filters: GameFilters): Promise<GameSummary[]> {
  const values: Array<string | number> = [];
  const where: string[] = [];

  if (filters.search && filters.search.trim() !== '') {
    values.push('%' + filters.search.trim() + '%');
    where.push('g.name ILIKE $' + values.length);
  }

  if (filters.genre && filters.genre.trim() !== '') {
    values.push(filters.genre.trim());
    where.push(`
      EXISTS (
        SELECT 1
        FROM GameGenres filter_gg
        JOIN Genres filter_ge ON filter_ge.genre_id = filter_gg.genre_id
        WHERE filter_gg.game_id = g.game_id
          AND filter_ge.genre_name = $${values.length}
      )`
    );
  }

  if (filters.minPrice !== undefined) {
    values.push(filters.minPrice);
    where.push('g.price >= $' + values.length);
  }

  if (filters.maxPrice !== undefined) {
    values.push(filters.maxPrice);
    where.push('g.price <= $' + values.length);
  }

  let whereSql = '';

  if (where.length > 0) {
    whereSql = 'WHERE ' + where.join(' AND ');
  }

  const result = await pool.query<GameSummary>(
    `SELECT
        g.game_id,
        g.name,
        g.description,
        g.price,
        g.developer_user_id,
        dp.studio_name,
        g.release_date,
        g.cover_image_url,
        array_agg(DISTINCT ge.genre_name) FILTER (WHERE ge.genre_name IS NOT NULL) AS genres,
        ROUND(AVG(r.rating)) AS average_rating,
        COUNT(DISTINCT r.review_id) AS review_count,
        COUNT(DISTINCT w.user_id) AS wishlist_count
      FROM Games g
      LEFT JOIN DeveloperProfiles dp ON dp.user_id = g.developer_user_id
      LEFT JOIN GameGenres gg ON gg.game_id = g.game_id
      LEFT JOIN Genres ge ON ge.genre_id = gg.genre_id
      LEFT JOIN Reviews r ON r.game_id = g.game_id
      LEFT JOIN Wishlists w ON w.game_id = g.game_id
      ${whereSql}
      GROUP BY g.game_id, dp.studio_name
      ORDER BY ${getSortClause(filters.sort)}`,
    values,
  );

  return result.rows;
}

export async function getGameById(gameId: number): Promise<GameSummary> {
  const result = await pool.query<GameSummary>(
    `SELECT
        g.game_id,
        g.name,
        g.description,
        g.price,
        g.developer_user_id,
        dp.studio_name,
        g.release_date,
        g.cover_image_url,
        array_agg(DISTINCT ge.genre_name) FILTER (WHERE ge.genre_name IS NOT NULL) AS genres,
        ROUND(AVG(r.rating)) AS average_rating,
        COUNT(DISTINCT r.review_id) AS review_count,
        COUNT(DISTINCT w.user_id) AS wishlist_count
      FROM Games g
      LEFT JOIN DeveloperProfiles dp ON dp.user_id = g.developer_user_id
      LEFT JOIN GameGenres gg ON gg.game_id = g.game_id
      LEFT JOIN Genres ge ON ge.genre_id = gg.genre_id
      LEFT JOIN Reviews r ON r.game_id = g.game_id
      LEFT JOIN Wishlists w ON w.game_id = g.game_id
      WHERE g.game_id = $1
      GROUP BY g.game_id, dp.studio_name`,
    [gameId],
  );

  if (result.rows.length === 0) {
    const err = new Error('Game not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  return result.rows[0];
}
