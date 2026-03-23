import type { CreateDoctorEntity, DoctorEntity, UpdateDoctorEntity } from "../../common/entities/DoctorEntity";

export interface IDoctorRepository {
  getAll(): Promise<DoctorEntity[]>;
  create(request: CreateDoctorEntity): Promise<DoctorEntity>;
  update(id: string, request: UpdateDoctorEntity): Promise<DoctorEntity>;
}
