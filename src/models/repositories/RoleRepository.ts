import { env } from "../../common/config/env";
import type { RoleEntity } from "../../common/entities/RoleEntity";
import type { IRoleRepository } from "../irepositories/IRoleRepository";
import { createApiClient, getApiErrorMessage } from "./http";

export class RoleRepository implements IRoleRepository {
  private readonly client = createApiClient();

  async getAll(): Promise<RoleEntity[]> {
    try {
      const { data } = await this.client.get<RoleEntity[]>(env.rolePath);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "No fue posible consultar los roles disponibles."));
    }
  }
}
