import { apiFetch } from './client.js';

export interface Friend {
  user_id: number;
  username: string;
  profile_image_url: string;
}

export function getFriends(): Promise<{ friends: Friend[] }> {
  return apiFetch('/friends');
}

export function getPendingRequests(): Promise<{ requests: Friend[] }> {
  return apiFetch('/friends/pending');
}

export function sendFriendRequest(receiverId: number): Promise<{ message: string }> {
  return apiFetch('/friends/requests', {
    method: 'POST',
    body: JSON.stringify({ receiver_id: receiverId }),
  });
}

export function acceptFriendRequest(senderId: number): Promise<{ message: string }> {
  return apiFetch(`/friends/requests/accept/${senderId}`, {
    method: 'POST',
  });
}