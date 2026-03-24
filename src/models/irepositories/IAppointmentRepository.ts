import type {
  AppointmentEntity,
  CreateAppointmentEntity,
  DoctorBusySlotEntity,
  UpdateAppointmentEntity,
} from "../../common/entities/AppointmentEntity";

export interface IAppointmentRepository {
  getAll(): Promise<AppointmentEntity[]>;
  getByPatientId(patientId: string): Promise<AppointmentEntity[]>;
  getByDoctorId(doctorId: string): Promise<DoctorBusySlotEntity[]>;
  create(request: CreateAppointmentEntity): Promise<AppointmentEntity>;
  update(id: string, request: UpdateAppointmentEntity): Promise<AppointmentEntity>;
}
