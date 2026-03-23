import { makeAutoObservable, runInAction } from "mobx";
import type { RoleEntity } from "../common/entities/RoleEntity";
import type { IRoleRepository } from "../models/irepositories/IRoleRepository";

const fallbackRoles: RoleEntity[] = [
  {
    id: "role-doctor",
    name: "Doctor",
    isActive: true,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
  {
    id: "role-patient",
    name: "Paciente",
    isActive: true,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
  {
    id: "role-admin",
    name: "Administrador",
    isActive: true,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
];

export class RolesViewModel {
  roles: RoleEntity[] = [];
  isLoading = false;
  errorMessage = "";
  helperMessage = "";

  private readonly roleRepository: IRoleRepository;

  constructor(roleRepository: IRoleRepository) {
    this.roleRepository = roleRepository;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get activeRoles() {
    return this.roles.filter((role) => role.isActive);
  }

  async loadRoles() {
    this.isLoading = true;
    this.errorMessage = "";
    this.helperMessage = "";

    try {
      const roles = await this.roleRepository.getAll();
      runInAction(() => {
        this.roles = roles;
      });
    } catch (error) {
      runInAction(() => {
        this.roles = fallbackRoles;
        this.errorMessage = error instanceof Error ? error.message : "No se pudieron cargar los roles.";
        this.helperMessage = "Se muestran roles de demostración para mantener separada la vista de roles.";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}
