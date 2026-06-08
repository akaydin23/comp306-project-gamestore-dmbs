export interface User {
  user_id: number
  username: string
  email: string
  bio: string | null
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
