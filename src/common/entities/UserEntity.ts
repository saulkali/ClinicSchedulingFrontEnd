export type CreateUserEntity = {
  email: string;
  password: string;
  roleId: string;
};

export type UserEntity = {
  id: string;
  email: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string;
};
