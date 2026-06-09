import pool from '../db/pool.js';
import { Genre } from '../types/index.js';

export async function getGenres(): Promise<Genre[]> {
  const result = await pool.query<Genre>(
    'SELECT genre_id, genre_name FROM Genres ORDER BY genre_name ASC',
  );

  return result.rows;
}
