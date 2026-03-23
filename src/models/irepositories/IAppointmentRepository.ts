import type { AppointmentEntity, CreateAppointmentEntity } from "../../common/entities/AppointmentEntity";

export interface IAppointmentRepository {
  getAll(): Promise<AppointmentEntity[]>;
  create(request: CreateAppointmentEntity): Promise<AppointmentEntity>;
}
