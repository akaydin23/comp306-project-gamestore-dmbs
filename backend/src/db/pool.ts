import { Pool } from 'pg';
import { db } from '../config/index.js';

const pool = new Pool({
  host: db.host,
  port: db.port,
  user: db.user,
  password: db.password,
  database: db.database,
});

export default pool;
