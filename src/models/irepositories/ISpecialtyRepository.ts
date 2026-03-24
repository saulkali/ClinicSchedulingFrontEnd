import type {
  CreateSpecialtyEntity,
  SpecialtyEntity,
  UpdateSpecialtyEntity,
} from "../../common/entities/SpecialtyEntity";

export interface ISpecialtyRepository {
  getAll(): Promise<SpecialtyEntity[]>;
  create(request: CreateSpecialtyEntity): Promise<SpecialtyEntity>;
  update(id: string, request: UpdateSpecialtyEntity): Promise<SpecialtyEntity>;
}
