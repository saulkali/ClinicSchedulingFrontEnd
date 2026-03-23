import type { AppointmentEntity, CreateAppointmentEntity } from "../../common/entities/AppointmentEntity";
import { env } from "../../common/config/env";
import type { IAppointmentRepository } from "../irepositories/IAppointmentRepository";
import { createApiClient, getApiErrorMessage } from "./http";

export class AppointmentRepository implements IAppointmentRepository {
  private readonly client = createApiClient();

  async getAll(): Promise<AppointmentEntity[]> {
    try {
      const { data } = await this.client.get<AppointmentEntity[]>(env.appointmentPath);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "No fue posible consultar las citas."));
    }
  }

  async create(request: CreateAppointmentEntity): Promise<AppointmentEntity> {
    try {
      const { data } = await this.client.post<AppointmentEntity>(env.appointmentPath, request);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "No fue posible guardar la cita."));
    }
  }
}
