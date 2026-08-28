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

  register: (dto: RegisterDto): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>("/auth/register", dto, true);
  },

  verifyEmail: (token: string): Promise<AuthTokens> => {
    return apiClient.get<AuthTokens>(`/auth/verify-email?token=${encodeURIComponent(token)}`);
  },

  resendVerification: (email: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(
      "/auth/resend-verification",
      { email },
      true,
    );
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
