import axios, { AxiosError } from "axios";
import { env } from "../../common/config/env";
import type { RoleEntity } from "../../common/entities/RoleEntity";
import type { IRoleRepository } from "../irepositories/IRoleRepository";

export class RoleRepository implements IRoleRepository {
  private readonly client = axios.create({
    baseURL: env.apiBaseUrl,
    headers: {
      "Content-Type": "application/json",
    },
  });

  async getAll(): Promise<RoleEntity[]> {
    try {
      const { data } = await this.client.get<RoleEntity[]>(env.rolePath);
      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const apiMessage =
          (error.response?.data as { message?: string } | undefined)?.message ??
          "No fue posible consultar los roles disponibles.";

        throw new Error(apiMessage);
      }

      throw new Error("Ocurrió un error inesperado al consultar los roles.");
    }
  }
}
