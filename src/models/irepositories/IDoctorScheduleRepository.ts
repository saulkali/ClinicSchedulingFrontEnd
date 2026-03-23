import type {
  CreateDoctorScheduleEntity,
  DoctorScheduleEntity,
  UpdateDoctorScheduleEntity,
} from "../../common/entities/DoctorScheduleEntity";

export interface IDoctorScheduleRepository {
  getAll(): Promise<DoctorScheduleEntity[]>;
  create(request: CreateDoctorScheduleEntity): Promise<DoctorScheduleEntity>;
  update(id: string, request: UpdateDoctorScheduleEntity): Promise<DoctorScheduleEntity>;
}
