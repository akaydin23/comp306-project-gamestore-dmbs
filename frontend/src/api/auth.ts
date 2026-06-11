import { apiFetch } from './client'
import type { AuthResponse, UserResponse } from '../types'

export function register(
  username: string,
  email: string,
  password: string,
): Promise<{ user: AuthResponse['user'] }> {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  })
}

export function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function getMe(): Promise<UserResponse> {
  return apiFetch('/auth/me')
}

export function updateProfile(
  username: string,
  bio: string,
  profile_image_url: string,
): Promise<UserResponse> {
  return apiFetch('/users/me', {
    method: 'PUT',
    body: JSON.stringify({ username, bio, profile_image_url }),
  })
}
