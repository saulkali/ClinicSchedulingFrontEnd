import { env } from "../../common/config/env";
import type { CreateUserEntity, UserEntity } from "../../common/entities/UserEntity";
import type { IUserRepository } from "../irepositories/IUserRepository";
import { createApiClient, getApiErrorMessage } from "./http";

export class UserRepository implements IUserRepository {
  private readonly client = createApiClient();

  async create(request: CreateUserEntity): Promise<UserEntity> {
    try {
      const { data } = await this.client.post<UserEntity>(env.userPath, request);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "No fue posible completar el registro del usuario."));
    }
  }
}
