import { apiFetch } from './client.js';

export interface UserSearchResult {
  user_id: number;
  username: string;
  profile_image_url: string;
}

export async function searchUsers(query: string) {
  return apiFetch(`/users/search?q=${encodeURIComponent(query)}`);
}