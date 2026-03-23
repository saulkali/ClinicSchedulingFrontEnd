import axios, { AxiosError } from "axios";
import { env } from "../../common/config/env";
import type { CreateUserEntity, UserEntity } from "../../common/entities/UserEntity";
import type { IUserRepository } from "../irepositories/IUserRepository";

export class UserRepository implements IUserRepository {
  private readonly client = axios.create({
    baseURL: env.apiBaseUrl,
    headers: {
      "Content-Type": "application/json",
    },
  });

  async create(request: CreateUserEntity): Promise<UserEntity> {
    try {
      const { data } = await this.client.post<UserEntity>(env.userPath, request);
      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const apiMessage =
          (error.response?.data as { message?: string } | undefined)?.message ??
          "No fue posible completar el registro del usuario.";

        throw new Error(apiMessage);
      }

      throw new Error("Ocurrió un error inesperado al registrar el usuario.");
    }
  }
}
