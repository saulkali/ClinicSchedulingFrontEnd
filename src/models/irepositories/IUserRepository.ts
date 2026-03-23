import type { CreateUserEntity, UserEntity } from "../../common/entities/UserEntity";

export interface IUserRepository {
  create(request: CreateUserEntity): Promise<UserEntity>;
}
