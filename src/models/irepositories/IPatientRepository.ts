import type { CreatePatientEntity, PatientEntity, UpdatePatientEntity } from "../../common/entities/PatientEntity";

export interface IPatientRepository {
  getAll(): Promise<PatientEntity[]>;
  create(request: CreatePatientEntity): Promise<PatientEntity>;
  update(id: string, request: UpdatePatientEntity): Promise<PatientEntity>;
}
