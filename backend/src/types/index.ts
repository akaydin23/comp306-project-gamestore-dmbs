export interface User {
  user_id: number;
  username: string;
  email: string;
  password_hash: string;
  bio: string | null;
  profile_image_url: string;
  role: 'USER' | 'ADMIN' | 'DEVELOPER';
}

export type SafeUser = Omit<User, 'password_hash'>;

export interface JwtPayload {
  user_id: number;
  username: string;
  role: string;
}

export interface GameFilters {
  search?: string;
  genre?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export interface GameSummary {
  game_id: number;
  name: string;
  description: string | null;
  price: number;
  developer_user_id: number | null;
  studio_name: string | null;
  release_date: string | null;
  cover_image_url: string | null;
  genres: string[] | null;
  average_rating: number | null;
  review_count: number;
  wishlist_count: number;
}

export interface Genre {
  genre_id: number;
  genre_name: string;
}

export interface LibraryEntry {
  game: GameSummary;
  purchase_date: string | null;
  hours_played: number;
}

export interface CartItem {
  game: GameSummary;
  added_at: string;
}

export interface Review {
  review_id: number;
  user_id: number;
  username: string;
  game_id: number;
  rating: number;
  comment: string | null;
  review_date: string;
}
