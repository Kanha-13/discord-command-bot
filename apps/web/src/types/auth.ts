export interface AuthUser {
  id: string;
  discordId: string;
  username: string;
  avatarUrl?: string | null;
  role: "ADMIN";
}

export interface AuthResponse {
  data: AuthUser;
}