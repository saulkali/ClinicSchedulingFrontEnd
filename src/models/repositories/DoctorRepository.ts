import type { CreateDoctorEntity, DoctorEntity, UpdateDoctorEntity } from "../../common/entities/DoctorEntity";
import { env } from "../../common/config/env";
import { createApiClient, getApiErrorMessage } from "./http";

export class DoctorRepository {
  private readonly client = createApiClient();

  async getAll() {
    try {
      const { data } = await this.client.get<DoctorEntity[]>(env.doctorPath);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "No fue posible consultar los doctores."));
    }
  }

  async create(request: CreateDoctorEntity) {
    try {
      const { data } = await this.client.post<DoctorEntity>(env.doctorPath, request);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "No fue posible completar el registro del doctor."));
    }
  }

  async update(id: string, request: UpdateDoctorEntity) {
    try {
      const { data } = await this.client.put<DoctorEntity>(`${env.doctorPath}/${id}`, request);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "No fue posible actualizar el doctor."));
    }
  }
}
