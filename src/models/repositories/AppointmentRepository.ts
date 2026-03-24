import type {
  AppointmentEntity,
  CreateAppointmentEntity,
  DoctorBusySlotEntity,
  UpdateAppointmentEntity,
} from "../../common/entities/AppointmentEntity";
import { env } from "../../common/config/env";
import type { IAppointmentRepository } from "../irepositories/IAppointmentRepository";
import { createApiClient, getApiErrorMessage } from "./http";

export class AppointmentRepository implements IAppointmentRepository {
  private readonly client = createApiClient();

  async getAll() {
    try {
      const { data } = await this.client.get<AppointmentEntity[]>(env.appointmentPath);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "No fue posible consultar las citas."));
    }
  }

  async getByPatientId(patientId: string) {
    try {
      const { data } = await this.client.get<AppointmentEntity[]>(`${env.appointmentPath}/patient/${patientId}`);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "No fue posible consultar las citas del paciente."));
    }
  }

  async getByDoctorId(doctorId: string) {
    try {
      const { data } = await this.client.get<DoctorBusySlotEntity[]>(`${env.appointmentPath}/doctor/${doctorId}`);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "No fue posible consultar las citas activas del doctor."));
    }
  }

  async create(request: CreateAppointmentEntity) {
    try {
      const { data } = await this.client.post<AppointmentEntity>(env.appointmentPath, request);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "No fue posible agendar la cita."));
    }
  }

  async update(id: string, request: UpdateAppointmentEntity) {
    try {
      const { data } = await this.client.put<AppointmentEntity>(`${env.appointmentPath}/${id}`, request);
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "No fue posible actualizar la cita."));
    }
  }
}
