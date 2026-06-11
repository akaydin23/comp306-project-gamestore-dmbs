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

export const getAdvancedSearchGames = async (filters: {
  q?: string;
  studio?: string;        
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  startDate?: string;     
  endDate?: string;       
  excludeOwned?: boolean;
  wishlistOnly?: boolean;
  sort?: string;
  userId?: number;
}): Promise<any[]> => {
  const { q, studio, minPrice, maxPrice, minRating, startDate, endDate, excludeOwned, wishlistOnly, sort, userId } = filters;
  
  let queryValues: any[] = [];
  let whereClauses: string[] = [];

  
  if (q && q.trim() !== '') {
    queryValues.push(`%${q.trim()}%`);
    whereClauses.push(`g.name ILIKE $${queryValues.length}`);
  }

  
  if (studio && studio.trim() !== '') {
    queryValues.push(`%${studio.trim()}%`);
    whereClauses.push(`dp.studio_name ILIKE $${queryValues.length}`);
  }

  
  if (minPrice !== undefined) {
    queryValues.push(minPrice);
    whereClauses.push(`g.price >= $${queryValues.length}`);
  }
  if (maxPrice !== undefined) {
    queryValues.push(maxPrice);
    whereClauses.push(`g.price <= $${queryValues.length}`);
  }

  
  if (startDate) {
    queryValues.push(startDate);
    whereClauses.push(`g.release_date >= $${queryValues.length}::DATE`);
  }
  if (endDate) {
    queryValues.push(endDate);
    whereClauses.push(`g.release_date <= $${queryValues.length}::DATE`);
  }

  
  if (excludeOwned && userId) {
    queryValues.push(userId);
    whereClauses.push(`NOT EXISTS (
      SELECT 1 FROM Library l 
      WHERE l.game_id = g.game_id AND l.user_id = $${queryValues.length}
    )`);
  }

  if (wishlistOnly && userId) {
    queryValues.push(userId);
    whereClauses.push(`EXISTS (
      SELECT 1 FROM Wishlists w 
      WHERE w.game_id = g.game_id AND w.user_id = $${queryValues.length}
    )`);
  }

  let whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  
  let havingClauses: string[] = [];
  if (minRating && minRating > 0) {
    queryValues.push(minRating);
    havingClauses.push(`COALESCE(AVG(r.rating), 0) >= $${queryValues.length}`);
  }
  let havingSql = havingClauses.length > 0 ? `HAVING ${havingClauses.join(' AND ')}` : '';

  
  let orderBySql = 'ORDER BY g.name ASC'; // Standard alpha alphabetical default
  if (sort === 'release_desc') orderBySql = 'ORDER BY g.release_date DESC NULLS LAST';
  if (sort === 'release_asc') orderBySql = 'ORDER BY g.release_date ASC NULLS LAST';
  if (sort === 'price_asc') orderBySql = 'ORDER BY g.price ASC';
  if (sort === 'price_desc') orderBySql = 'ORDER BY g.price DESC';
  if (sort === 'rating_desc') orderBySql = 'ORDER BY average_rating DESC';

  
  const finalSqlQuery = `
    SELECT 
      g.game_id, 
      g.name, 
      g.description,
      g.price::FLOAT AS price, 
      g.release_date,
      g.cover_image_url,
      dp.studio_name,
      ROUND(COALESCE(AVG(r.rating), 0))::FLOAT as average_rating,
      COUNT(DISTINCT r.review_id)::INTEGER as review_count,
      ARRAY_AGG(DISTINCT gen.genre_name) FILTER (WHERE gen.genre_name IS NOT NULL) as genres
    FROM Games g
    LEFT JOIN DeveloperProfiles dp ON dp.user_id = g.developer_user_id
    LEFT JOIN Reviews r ON g.game_id = r.game_id
    LEFT JOIN GameGenres gg ON g.game_id = gg.game_id
    LEFT JOIN Genres gen ON gg.genre_id = gen.genre_id
    ${whereSql}
    GROUP BY g.game_id, dp.studio_name
    ${havingSql}
    ${orderBySql};
  `;

  const result = await pool.query(finalSqlQuery, queryValues);
  return result.rows;
};

