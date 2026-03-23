import { env } from "../../common/config/env";
import type { IAuthRepository, LoginRequest, LoginResponse } from "../irepositories/IAuthRepository";
import { createApiClient, getApiErrorMessage } from "./http";

export class AuthRepository implements IAuthRepository {
  private readonly client = createApiClient();

  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const { data } = await this.client.post<LoginResponse>(env.authLoginPath, request);
      return data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, "No fue posible iniciar sesión con las credenciales proporcionadas.")
      );
    }
  }
}
