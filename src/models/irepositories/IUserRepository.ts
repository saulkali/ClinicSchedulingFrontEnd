import type { CreateUserEntity, UserEntity } from "../../common/entities/UserEntity";

export interface IUserRepository {
  getAll(): Promise<UserEntity[]>;
  create(request: CreateUserEntity): Promise<UserEntity>;
}
