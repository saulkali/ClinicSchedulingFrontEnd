import type {
  CreateDoctorScheduleEntity,
  DoctorScheduleEntity,
  UpdateDoctorScheduleEntity,
} from "../../common/entities/DoctorScheduleEntity";
import { env } from "../../common/config/env";
import type { IDoctorScheduleRepository } from "../irepositories/IDoctorScheduleRepository";
import { createApiClient, getApiErrorMessage } from "./http";

export class DoctorScheduleRepository implements IDoctorScheduleRepository {
  private readonly client = createApiClient();

  async getAll() {
    try {
      const { data } = await this.client.get<DoctorScheduleEntity[]>(env.doctorSchedulePath);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "No fue posible consultar los horarios del doctor."));
    }
  }

  async create(request: CreateDoctorScheduleEntity) {
    try {
      const { data } = await this.client.post<DoctorScheduleEntity>(env.doctorSchedulePath, request);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "No fue posible guardar el horario laboral."));
    }
  }

  async update(id: string, request: UpdateDoctorScheduleEntity) {
    try {
      const { data } = await this.client.put<DoctorScheduleEntity>(`${env.doctorSchedulePath}/${id}`, request);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "No fue posible actualizar el horario laboral."));
    }
  }
}
