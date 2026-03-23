export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  role: string;
  email: string;
  refreshToken?: string;
  expiresAt?: string;
};

export interface IAuthRepository {
  login(request: LoginRequest): Promise<LoginResponse>;
}
