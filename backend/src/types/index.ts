export interface User {
  user_id: number;
  username: string;
  email: string;
  password_hash: string;
  bio: string | null;
  role: 'USER' | 'ADMIN' | 'DEVELOPER';
}

export type SafeUser = Omit<User, 'password_hash'>;

export interface JwtPayload {
  user_id: number;
  username: string;
  role: string;
}
