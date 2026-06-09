import pool from '../db/pool.js';
import { User } from '../types/index.js';

//Basically updates the profile of the user
//Only username, bio and profile image cause id is key att
export async function updateProfile(
  userId: number,
  username: string, 
  bio: string,
  profileImageUrl: string
) {
  //Here dollar signs are placeholders. $1 is username for example
  //A small query to update, user_id = $4 is for join condition
  const result = await pool.query<User>(
    `UPDATE Users
     SET username = $1,
         bio = $2,
         profile_image_url = $3
     WHERE user_id = $4
     RETURNING user_id, username, email, bio, profile_image_url, role`,
    [username, bio, profileImageUrl, userId]
  );

  //Returns array or rows since user_id is unique,
  //only one row is updated
  return result.rows[0];
}