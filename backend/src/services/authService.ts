import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/pool.js';
import { jwtSecret } from '../config/index.js';
import { User, SafeUser, JwtPayload } from '../types/index.js';

const SALT_ROUNDS = 10;

function toSafeUser(user: User): SafeUser {
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

export async function registerUser(
  username: string,
  email: string,
  password: string,
): Promise<SafeUser> {
  const existing = await pool.query(
    'SELECT user_id FROM Users WHERE username = $1 OR email = $2',
    [username, email],
  );

  if (existing.rows.length > 0) {
    const err = new Error('Username or email already taken') as Error & { status: number };
    err.status = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await pool.query<User>(
    `INSERT INTO Users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING user_id, username, email, bio, profile_image_url, role`,
    [username, email, password_hash],
  );

  return toSafeUser(result.rows[0]);
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: SafeUser; token: string }> {
  const result = await pool.query<User>(
    'SELECT user_id, username, email, password_hash, bio, profile_image_url, role FROM Users WHERE email = $1',
    [email],
  );

  if (result.rows.length === 0) {
    const err = new Error('Invalid email or password') as Error & { status: number };
    err.status = 401;
    throw err;
  }

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    const err = new Error('Invalid email or password') as Error & { status: number };
    err.status = 401;
    throw err;
  }

  const payload: JwtPayload = {
    user_id: user.user_id,
    username: user.username,
    role: user.role,
  };

  const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });

  return { user: toSafeUser(user), token };
}

export async function getUserById(userId: number): Promise<SafeUser> {
  const result = await pool.query<User>(
    'SELECT user_id, username, email, bio, profile_image_url, role FROM Users WHERE user_id = $1',
    [userId],
  );

  if (result.rows.length === 0) {
    const err = new Error('User not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  return toSafeUser(result.rows[0]);
}
