import type { CreatePatientEntity, PatientEntity, UpdatePatientEntity } from "../../common/entities/PatientEntity";
import { env } from "../../common/config/env";
import type { IPatientRepository } from "../irepositories/IPatientRepository";
import { createApiClient, getApiErrorMessage } from "./http";

export class PatientRepository implements IPatientRepository {
  private readonly client = createApiClient();

  async getAll() {
    try {
      const { data } = await this.client.get<PatientEntity[]>(env.patientPath);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "No fue posible consultar los pacientes."));
    }
  }

  async create(request: CreatePatientEntity) {
    try {
      const { data } = await this.client.post<PatientEntity>(env.patientPath, request);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "No fue posible completar el registro del paciente."));
    }
  }

  async update(id: string, request: UpdatePatientEntity) {
    try {
      const { data } = await this.client.put<PatientEntity>(`${env.patientPath}/${id}`, request);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "No fue posible actualizar el paciente."));
    }
  }
}