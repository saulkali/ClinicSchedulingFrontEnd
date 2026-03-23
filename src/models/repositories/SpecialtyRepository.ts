import type { CreateSpecialtyEntity, SpecialtyEntity, UpdateSpecialtyEntity } from "../../common/entities/SpecialtyEntity";
import { env } from "../../common/config/env";
import { createApiClient, getApiErrorMessage } from "./http";

export class SpecialtyRepository {
  private readonly client = createApiClient();

  async getAll() {
    try {
      const { data } = await this.client.get<SpecialtyEntity[]>(env.specialtyPath);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "No fue posible consultar las especialidades."));
    }
  }

  async create(request: CreateSpecialtyEntity) {
    try {
      const { data } = await this.client.post<SpecialtyEntity>(env.specialtyPath, request);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "No fue posible registrar la especialidad."));
    }
  }

  async update(id: string, request: UpdateSpecialtyEntity) {
    try {
      const { data } = await this.client.put<SpecialtyEntity>(`${env.specialtyPath}/${id}`, request);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "No fue posible actualizar la especialidad."));
    }
  }
}
