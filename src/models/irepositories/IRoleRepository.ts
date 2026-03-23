import type { RoleEntity } from "../../common/entities/RoleEntity";

export interface IRoleRepository {
  getAll(): Promise<RoleEntity[]>;
}
