import type {
  AppointmentAvailableDoctorDto,
  AppointmentEntity,
  CreateAppointmentEntity,
  UpdateAppointmentEntity,
} from "../../common/entities/AppointmentEntity";

export interface IAppointmentRepository {
  getAll(): Promise<AppointmentEntity[]>;
  getByPatientId(patientId: string): Promise<AppointmentEntity[]>;
  getDoctorAvailability(doctorId: string, date: string): Promise<AppointmentAvailableDoctorDto>;
  create(request: CreateAppointmentEntity): Promise<AppointmentEntity>;
  update(id: string, request: UpdateAppointmentEntity): Promise<AppointmentEntity>;
}
