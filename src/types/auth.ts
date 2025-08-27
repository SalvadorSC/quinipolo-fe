// Shared auth-related types

export interface GoogleUserMetadata {
  full_name?: string;
  name?: string;
  username?: string;
}

export interface GoogleUser {
  id: string;
  email?: string | null;
  user_metadata?: GoogleUserMetadata | null;
}
