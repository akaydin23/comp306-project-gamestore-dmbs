export interface User {
  user_id: number
  username: string
  email: string
  bio: string | null
  profile_image_url: string
  role: 'USER' | 'ADMIN' | 'DEVELOPER'
}

export interface AuthResponse {
  user: User
  token: string
}

export interface UserResponse {
  user: User
}

export interface ApiError {
  error: {
    message: string
  }
}

export interface Game {
  game_id: number
  name: string
  description: string | null
  price: number
  developer_user_id: number | null
  studio_name: string | null
  release_date: string | null
  cover_image_url: string | null
  genres: string[] | null
  average_rating: number | null
  review_count: number
  wishlist_count: number
}

export interface LibraryEntry {
  game: Game
  purchase_date: string | null
  hours_played: number
}

export interface Genre {
  genre_id: number
  genre_name: string
}

export interface Review {
  review_id: number
  user_id: number
  username: string
  game_id: number
  rating: number
  comment: string | null
  review_date: string
}

export interface CheckoutResult {
  purchase_id: number
  total_price: number
  item_count: number
}
