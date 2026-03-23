import axios, { AxiosError } from "axios";
import { env } from "../../../../core/config/env";
import type {
  IAuthRepository,
  LoginRequest,
  LoginResponse,
} from "../irepositories/IAuthRepository";

export class AuthRepository implements IAuthRepository {
  private readonly client = axios.create({
    baseURL: env.apiBaseUrl,
    headers: {
      "Content-Type": "application/json",
    },
  });

  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const { data } = await this.client.post<LoginResponse>(env.authLoginPath, request);
      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const apiMessage =
          (error.response?.data as { message?: string } | undefined)?.message ??
          "No fue posible iniciar sesión con las credenciales proporcionadas.";

        throw new Error(apiMessage);
      }

      throw new Error("Ocurrió un error inesperado al iniciar sesión.");
    }
  }
}
