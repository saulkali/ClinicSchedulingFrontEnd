import { makeAutoObservable, runInAction } from "mobx";
import type { RoleEntity } from "../common/entities/RoleEntity";
import type { IRoleRepository } from "../models/irepositories/IRoleRepository";

export class RolesViewModel {
  roles: RoleEntity[] = [];
  isLoading = false;
  isLoaded = false;
  errorMessage = "";

  private readonly roleRepository: IRoleRepository;

  constructor(roleRepository: IRoleRepository) {
    this.roleRepository = roleRepository;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  clearMessages() {
    this.errorMessage = "";
  }

  get activeRoles() {
    return this.roles.filter((role) => role.isActive);
  }

  async loadRoles(force = false) {
    if ((this.isLoaded && !force) || this.isLoading) {
      return;
    }

    runInAction(() => {
      this.isLoading = true;
      this.errorMessage = "";
    });

    try {
      const roles = await this.roleRepository.getAll();
      runInAction(() => {
        this.roles = roles;
        this.isLoaded = true;
      });
    } catch (error) {
      runInAction(() => {
        this.errorMessage =
          error instanceof Error ? error.message : "No se pudieron cargar los roles disponibles.";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}
