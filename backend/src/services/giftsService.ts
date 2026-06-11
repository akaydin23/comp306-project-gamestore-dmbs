import pool from '../db/pool.js';

export interface GiftSummary {
  gift_id: number;
  sender_user_id: number;
  sender_username: string;
  recipient_user_id: number;
  recipient_username: string;
  game_id: number;
  game_name: string;
  cover_image_url: string | null;
  gift_date: string;
  gift_message: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
}

function giftSelectSql(whereSql: string) {
  return `
    SELECT
      gf.gift_id,
      gf.sender_user_id,
      sender.username AS sender_username,
      gf.recipient_user_id,
      recipient.username AS recipient_username,
      gf.game_id,
      g.name AS game_name,
      g.cover_image_url,
      gf.gift_date,
      gf.gift_message,
      gf.status
    FROM Gifts gf
    JOIN Users sender ON sender.user_id = gf.sender_user_id
    JOIN Users recipient ON recipient.user_id = gf.recipient_user_id
    JOIN Games g ON g.game_id = gf.game_id
    ${whereSql}
    ORDER BY gf.gift_date DESC, gf.gift_id DESC`;
}

export async function getReceivedGifts(userId: number): Promise<GiftSummary[]> {
  const result = await pool.query<GiftSummary>(
    giftSelectSql('WHERE gf.recipient_user_id = $1'),
    [userId],
  );

  return result.rows;
}

export async function getSentGifts(userId: number): Promise<GiftSummary[]> {
  const result = await pool.query<GiftSummary>(
    giftSelectSql('WHERE gf.sender_user_id = $1'),
    [userId],
  );

  return result.rows;
}

export async function sendGift(
  senderId: number,
  recipientUsername: string,
  gameId: number,
  message: string | null,
): Promise<GiftSummary> {
  const recipient = await pool.query<{ user_id: number }>(
    'SELECT user_id FROM Users WHERE LOWER(username) = LOWER($1)',
    [recipientUsername],
  );

  if (recipient.rows.length === 0) {
    const err = new Error('Recipient user not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const recipientId = recipient.rows[0].user_id;

  if (recipientId === senderId) {
    const err = new Error('You cannot send a gift to yourself') as Error & { status: number };
    err.status = 400;
    throw err;
  }

  const game = await pool.query('SELECT 1 FROM Games WHERE game_id = $1', [gameId]);

  if (game.rows.length === 0) {
    const err = new Error('Game not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const existingLibrary = await pool.query(
    'SELECT 1 FROM Library WHERE user_id = $1 AND game_id = $2',
    [recipientId, gameId],
  );

  if (existingLibrary.rows.length > 0) {
    const err = new Error('Recipient already owns this game') as Error & { status: number };
    err.status = 409;
    throw err;
  }

  const inserted = await pool.query<{ gift_id: number }>(
    `INSERT INTO Gifts (sender_user_id, recipient_user_id, game_id, gift_message, status)
     VALUES ($1, $2, $3, $4, 'PENDING')
     RETURNING gift_id`,
    [senderId, recipientId, gameId, message],
  );

  const result = await pool.query<GiftSummary>(
    giftSelectSql('WHERE gf.gift_id = $1'),
    [inserted.rows[0].gift_id],
  );

  return result.rows[0];
}

export async function acceptGift(userId: number, giftId: number): Promise<GiftSummary> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const gift = await client.query<{
      gift_id: number;
      recipient_user_id: number;
      game_id: number;
      status: GiftSummary['status'];
    }>(
      `SELECT gift_id, recipient_user_id, game_id, status
       FROM Gifts
       WHERE gift_id = $1 AND recipient_user_id = $2
       FOR UPDATE`,
      [giftId, userId],
    );

    if (gift.rows.length === 0) {
      const err = new Error('Gift not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    const currentGift = gift.rows[0];

    if (currentGift.status !== 'PENDING') {
      const err = new Error('Only pending gifts can be accepted') as Error & { status: number };
      err.status = 400;
      throw err;
    }

    await client.query(
      `INSERT INTO Library (user_id, game_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, game_id) DO NOTHING`,
      [userId, currentGift.game_id],
    );

    await client.query(
      "UPDATE Gifts SET status = 'ACCEPTED' WHERE gift_id = $1",
      [giftId],
    );

    await client.query('COMMIT');

    const summary = await pool.query<GiftSummary>(
      giftSelectSql('WHERE gf.gift_id = $1'),
      [giftId],
    );

    return summary.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function rejectGift(userId: number, giftId: number): Promise<void> {
  const result = await pool.query(
    `UPDATE Gifts
     SET status = 'REJECTED'
     WHERE gift_id = $1 AND recipient_user_id = $2 AND status = 'PENDING'`,
    [giftId, userId],
  );

  if (result.rowCount === 0) {
    const err = new Error('Pending gift not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
}

export async function cancelGift(userId: number, giftId: number): Promise<void> {
  const result = await pool.query(
    `UPDATE Gifts
     SET status = 'CANCELLED'
     WHERE gift_id = $1 AND sender_user_id = $2 AND status = 'PENDING'`,
    [giftId, userId],
  );

  if (result.rowCount === 0) {
    const err = new Error('Pending sent gift not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
}
