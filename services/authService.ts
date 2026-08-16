import { apiClient } from "./apiClient";
import { UserProfile } from "@/types";

export interface LoginDto {
  email: string;
  password?: string;
}

export interface RegisterDto {
  email: string;
  password?: string;
  displayName: string;
  role?: string;
}

export interface AuthTokens {
  access_token: string;
}

export const authService = {
  login: (dto: LoginDto): Promise<AuthTokens> => {
    return apiClient.post<AuthTokens>("/auth/login", dto, true);
  },

  register: (dto: RegisterDto): Promise<AuthTokens> => {
    return apiClient.post<AuthTokens>("/auth/register", dto, true);
  },

  getMe: (): Promise<UserProfile> => {
    return apiClient.get<UserProfile>("/auth/me");
  },

  logout: (): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>("/auth/logout", {});
  },

  refreshToken: (): Promise<AuthTokens> => {
    return apiClient.post<AuthTokens>("/auth/refresh", {}, true);
  },
};
