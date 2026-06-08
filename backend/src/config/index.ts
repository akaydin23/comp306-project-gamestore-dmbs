import dotenv from 'dotenv';

dotenv.config();

export const port: number = Number(process.env.PORT) || 3000;

export const db = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'game_store_db',
};

export const jwtSecret: string = process.env.JWT_SECRET || 'tLY2w7xtEY8beNPD77wmf2JtQFzMjuGgp9p6tf7KzOt';
