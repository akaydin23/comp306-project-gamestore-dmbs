import pool from '../db/pool.js';

export interface CheckoutResult {
  purchase_id: number;
  total_price: number;
  item_count: number;
}

export async function checkoutCart(userId: number): Promise<CheckoutResult> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const items = await client.query<{ game_id: number; price: string }>(
      `SELECT g.game_id, g.price
       FROM Carts c
       JOIN CartItems ci ON ci.cart_id = c.cart_id
       JOIN Games g ON g.game_id = ci.game_id
       LEFT JOIN Library l ON l.user_id = c.user_id AND l.game_id = g.game_id
       WHERE c.user_id = $1 AND l.game_id IS NULL
       ORDER BY ci.added_at ASC`,
      [userId],
    );

    if (items.rows.length === 0) {
      const err = new Error('Your cart is empty') as Error & { status: number };
      err.status = 400;
      throw err;
    }

    const total = items.rows.reduce((sum, item) => sum + Number(item.price), 0);

    const purchase = await client.query<{ purchase_id: number; total_price: string }>(
      `INSERT INTO Purchases (user_id, total_price, payment_method)
       VALUES ($1, $2, 'FAKE_PAYMENT')
       RETURNING purchase_id, total_price`,
      [userId, total],
    );

    const purchaseId = purchase.rows[0].purchase_id;

    for (const item of items.rows) {
      await client.query(
        `INSERT INTO PurchaseItems (purchase_id, game_id, price_at_purchase)
         VALUES ($1, $2, $3)`,
        [purchaseId, item.game_id, item.price],
      );

      await client.query(
        `INSERT INTO Library (user_id, game_id, purchase_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, game_id) DO NOTHING`,
        [userId, item.game_id, purchaseId],
      );
    }

    await client.query(
      'DELETE FROM CartItems WHERE cart_id IN (SELECT cart_id FROM Carts WHERE user_id = $1)',
      [userId],
    );

    await client.query('COMMIT');

    return {
      purchase_id: purchaseId,
      total_price: Number(purchase.rows[0].total_price),
      item_count: items.rows.length,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
