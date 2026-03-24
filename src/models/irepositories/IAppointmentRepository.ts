import type {
  AppointmentEntity,
  CreateAppointmentEntity,
  UpdateAppointmentEntity,
} from "../../common/entities/AppointmentEntity";

export interface IAppointmentRepository {
  getAll(): Promise<AppointmentEntity[]>;
  create(request: CreateAppointmentEntity): Promise<AppointmentEntity>;
  update(id: string, request: UpdateAppointmentEntity): Promise<AppointmentEntity>;
}
