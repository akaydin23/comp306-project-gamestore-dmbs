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

export interface AdminTopGame {
  game_id: number
  name: string
  purchase_count: number
  revenue: number
}

export interface AdminStats {
  user_count: number
  game_count: number
  purchase_count: number
  review_count: number
  library_count: number
  wishlist_count: number
  total_revenue: number
  top_games: AdminTopGame[]
}

export interface AdminUser {
  user_id: number
  username: string
  email: string
  role: User['role']
  library_count: number
  review_count: number
  wishlist_count: number
  total_spent: number
}

export interface AdminPurchaseItem {
  game_id: number
  name: string
  price_at_purchase: number
}

export interface AdminPurchase {
  purchase_id: number
  user_id: number
  username: string
  total_price: number
  purchase_date: string
  payment_method: string
  item_count: number
  items: AdminPurchaseItem[]
}

export interface AdminGameInput {
  name: string
  description: string | null
  price: number
  developer_user_id: number | null
  release_date: string | null
  cover_image_url: string | null
  genre_ids: number[]
}
