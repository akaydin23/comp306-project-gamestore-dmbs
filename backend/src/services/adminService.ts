import pool from '../db/pool.js';

export interface AdminGameInput {
  name: string;
  description: string | null;
  price: number;
  developer_user_id: number | null;
  release_date: string | null;
  cover_image_url: string | null;
  genre_ids: number[];
}

export async function getStats() {
  const [users, games, purchases, reviews, revenue, library, wishlist] = await Promise.all([
    pool.query<{ count: string }>('SELECT COUNT(*) AS count FROM Users'),
    pool.query<{ count: string }>('SELECT COUNT(*) AS count FROM Games'),
    pool.query<{ count: string }>('SELECT COUNT(*) AS count FROM Purchases'),
    pool.query<{ count: string }>('SELECT COUNT(*) AS count FROM Reviews'),
    pool.query<{ total: string | null }>('SELECT COALESCE(SUM(total_price), 0) AS total FROM Purchases'),
    pool.query<{ count: string }>('SELECT COUNT(*) AS count FROM Library'),
    pool.query<{ count: string }>('SELECT COUNT(*) AS count FROM Wishlists'),
  ]);

  const topGames = await pool.query<{
    game_id: number;
    name: string;
    purchase_count: number;
    revenue: number;
  }>(
    `SELECT
        g.game_id,
        g.name,
        COUNT(pi.purchase_id)::INTEGER AS purchase_count,
        COALESCE(SUM(pi.price_at_purchase), 0)::FLOAT AS revenue
      FROM Games g
      LEFT JOIN PurchaseItems pi ON pi.game_id = g.game_id
      GROUP BY g.game_id
      ORDER BY purchase_count DESC, revenue DESC, g.name ASC
      LIMIT 5`,
  );

  return {
    user_count: Number(users.rows[0].count),
    game_count: Number(games.rows[0].count),
    purchase_count: Number(purchases.rows[0].count),
    review_count: Number(reviews.rows[0].count),
    library_count: Number(library.rows[0].count),
    wishlist_count: Number(wishlist.rows[0].count),
    total_revenue: Number(revenue.rows[0].total),
    top_games: topGames.rows,
  };
}

export async function getUsers() {
  const result = await pool.query(
    `SELECT
        u.user_id,
        u.username,
        u.email,
        u.bio,
        u.profile_image_url,
        u.role,
        (SELECT COUNT(*)::INTEGER FROM Library l WHERE l.user_id = u.user_id) AS library_count,
        (SELECT COUNT(*)::INTEGER FROM Reviews r WHERE r.user_id = u.user_id) AS review_count,
        (SELECT COUNT(*)::INTEGER FROM Wishlists w WHERE w.user_id = u.user_id) AS wishlist_count,
        (SELECT COALESCE(SUM(p.total_price), 0)::FLOAT FROM Purchases p WHERE p.user_id = u.user_id) AS total_spent
      FROM Users u
      ORDER BY u.user_id ASC`,
  );

  return result.rows;
}

export async function getPurchases() {
  const result = await pool.query(
    `SELECT
        p.purchase_id,
        p.user_id,
        u.username,
        p.total_price::FLOAT AS total_price,
        p.purchase_date,
        p.payment_method,
        COUNT(pi.game_id)::INTEGER AS item_count,
        COALESCE(
          json_agg(
            json_build_object(
              'game_id', g.game_id,
              'name', g.name,
              'price_at_purchase', pi.price_at_purchase::FLOAT
            )
          ) FILTER (WHERE g.game_id IS NOT NULL),
          '[]'::json
        ) AS items
      FROM Purchases p
      JOIN Users u ON u.user_id = p.user_id
      LEFT JOIN PurchaseItems pi ON pi.purchase_id = p.purchase_id
      LEFT JOIN Games g ON g.game_id = pi.game_id
      GROUP BY p.purchase_id, u.username
      ORDER BY p.purchase_date DESC, p.purchase_id DESC`,
  );

  return result.rows;
}

export async function createGame(input: AdminGameInput) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const game = await client.query(
      `INSERT INTO Games (name, description, price, developer_user_id, release_date, cover_image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING game_id, name, description, price::FLOAT AS price, developer_user_id, release_date, cover_image_url`,
      [
        input.name,
        input.description,
        input.price,
        input.developer_user_id,
        input.release_date,
        input.cover_image_url,
      ],
    );

    for (const genreId of input.genre_ids) {
      await client.query(
        `INSERT INTO GameGenres (game_id, genre_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [game.rows[0].game_id, genreId],
      );
    }

    await client.query('COMMIT');
    return game.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function updateGame(gameId: number, input: AdminGameInput) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const game = await client.query(
      `UPDATE Games
       SET name = $1,
           description = $2,
           price = $3,
           developer_user_id = $4,
           release_date = $5,
           cover_image_url = $6
       WHERE game_id = $7
       RETURNING game_id, name, description, price::FLOAT AS price, developer_user_id, release_date, cover_image_url`,
      [
        input.name,
        input.description,
        input.price,
        input.developer_user_id,
        input.release_date,
        input.cover_image_url,
        gameId,
      ],
    );

    if (game.rows.length === 0) {
      const err = new Error('Game not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    await client.query('DELETE FROM GameGenres WHERE game_id = $1', [gameId]);

    for (const genreId of input.genre_ids) {
      await client.query(
        `INSERT INTO GameGenres (game_id, genre_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [gameId, genreId],
      );
    }

    await client.query('COMMIT');
    return game.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteGame(gameId: number): Promise<void> {
  const result = await pool.query('DELETE FROM Games WHERE game_id = $1', [gameId]);

  if (result.rowCount === 0) {
    const err = new Error('Game not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
}

export async function createGenre(name: string) {
  const result = await pool.query(
    `INSERT INTO Genres (genre_name)
     VALUES ($1)
     RETURNING genre_id, genre_name`,
    [name],
  );

  return result.rows[0];
}

export async function updateGenre(genreId: number, name: string) {
  const result = await pool.query(
    `UPDATE Genres
     SET genre_name = $1
     WHERE genre_id = $2
     RETURNING genre_id, genre_name`,
    [name, genreId],
  );

  if (result.rows.length === 0) {
    const err = new Error('Genre not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  return result.rows[0];
}

export async function deleteGenre(genreId: number): Promise<void> {
  const result = await pool.query('DELETE FROM Genres WHERE genre_id = $1', [genreId]);

  if (result.rowCount === 0) {
    const err = new Error('Genre not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
}
