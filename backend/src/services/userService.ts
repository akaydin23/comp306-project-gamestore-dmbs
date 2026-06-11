import pool from '../db/pool.js';
import { User } from '../types/index.js';

export async function updateProfile(
  userId: number,
  username: string, 
  bio: string,
  profileImageUrl: string
) {
  const result = await pool.query<User>(
    `UPDATE Users
     SET username = $1,
         bio = $2,
         profile_image_url = $3
     WHERE user_id = $4
     RETURNING user_id, username, email, bio, profile_image_url, role`,
    [username, bio, profileImageUrl, userId]
  );

  return result.rows[0];
}

export interface UserSearchMatch {
  user_id: number;
  username: string;
  profile_image_url: string;
}

export async function searchUsersByUsername(currentUserId: number, query: string): Promise<UserSearchMatch[]> {
  const result = await pool.query<UserSearchMatch>(
    `SELECT user_id, username, profile_image_url 
     FROM users 
     WHERE username ILIKE $1 AND user_id <> $2
     LIMIT 10`,
    [`%${query}%`, currentUserId]
  );
  return result.rows;
}