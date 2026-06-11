import pool from '../db/pool.js';

export interface FriendRelation {
  user_id: number;
  username: string;
  profile_image_url: string;
}

export async function sendFriendRequest(senderId: number, receiverId: number): Promise<void> {
  const existing = await pool.query(
    `SELECT 1 FROM Friends 
     WHERE (user_id = $1 AND friend_id = $2) 
        OR (user_id = $2 AND friend_id = $1)`,
    [senderId, receiverId],
  );

  if (existing.rows.length > 0) {
    const err = new Error('Friend relationship or request already exists') as Error & { status: number };
    err.status = 409;
    throw err;
  }

  await pool.query(
    'INSERT INTO Friends (user_id, friend_id, status) VALUES ($1, $2, \'PENDING\')',
    [senderId, receiverId],
  );
}

export async function acceptFriendRequest(receiverId: number, senderId: number): Promise<void> {
  const result = await pool.query(
    `UPDATE Friends 
     SET status = 'ACCEPTED' 
     WHERE user_id = $1 AND friend_id = $2 AND status = 'PENDING'`,
    [senderId, receiverId],
  );

  if (result.rowCount === 0) {
    const err = new Error('No pending friend request found from this user') as Error & { status: number };
    err.status = 404;
    throw err;
  }
}

export async function getFriends(userId: number): Promise<FriendRelation[]> {
  const result = await pool.query<FriendRelation>(
    `SELECT u.user_id, u.username, u.profile_image_url
     FROM Friends f
     JOIN Users u ON (f.user_id = u.user_id OR f.friend_id = u.user_id)
     WHERE (f.user_id = $1 OR f.friend_id = $1)
       AND f.status = 'ACCEPTED'
       AND u.user_id <> $1
     ORDER BY u.username ASC`,
    [userId],
  );
  return result.rows;
}

export async function getPendingRequests(userId: number): Promise<FriendRelation[]> {
  const result = await pool.query<FriendRelation>(
    `SELECT u.user_id, u.username, u.profile_image_url
     FROM Friends f
     JOIN Users u ON f.user_id = u.user_id
     WHERE f.friend_id = $1 AND f.status = 'PENDING'
     ORDER BY f.created_at DESC`,
    [userId],
  );
  return result.rows;
}