import { makeAutoObservable, runInAction } from "mobx";
import type { RoleEntity } from "../common/entities/RoleEntity";
import type { UserEntity } from "../common/entities/UserEntity";
import { sessionStore } from "../common/session/SessionStore";
import type { IAuthRepository } from "../models/irepositories/IAuthRepository";
import type { IRoleRepository } from "../models/irepositories/IRoleRepository";
import type { IUserRepository } from "../models/irepositories/IUserRepository";

const fallbackUsers: UserEntity[] = [
  {
    id: "user-demo-1",
    email: "paciente.demo@clinica.com",
    roleId: "role-patient",
    roleName: "Paciente",
    isActive: true,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
  {
    id: "user-demo-2",
    email: "doctor.demo@clinica.com",
    roleId: "role-doctor",
    roleName: "Doctor",
    isActive: true,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
];

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
];

export class UserViewModel {
  email = "";
  password = "";
  registerEmail = "";
  registerPassword = "";
  confirmPassword = "";
  selectedRoleId = "";

  users: UserEntity[] = [];
  roles: RoleEntity[] = [];

  isLoggingIn = false;
  isRegistering = false;
  isUsersLoading = false;
  isRolesLoading = false;

  loginErrorMessage = "";
  loginSuccessMessage = "";
  registerErrorMessage = "";
  registerSuccessMessage = "";
  usersErrorMessage = "";
  helperMessage = "";

  private readonly authRepository: IAuthRepository;
  private readonly userRepository: IUserRepository;
  private readonly roleRepository: IRoleRepository;

  constructor(
    authRepository: IAuthRepository,
    userRepository: IUserRepository,
    roleRepository: IRoleRepository
  ) {
    this.authRepository = authRepository;
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get canLogin() {
    return this.email.trim().length > 0 && this.password.trim().length > 0 && !this.isLoggingIn;
  }

  get canRegister() {
    return (
      this.registerEmail.trim().length > 0 &&
      this.registerPassword.trim().length >= 6 &&
      this.confirmPassword.trim().length > 0 &&
      this.selectedRoleId.trim().length > 0 &&
      !this.isRegistering
    );
  }

  setEmail(value: string) {
    this.email = value;
  }

  setPassword(value: string) {
    this.password = value;
  }

  setRegisterEmail(value: string) {
    this.registerEmail = value;
  }

  setRegisterPassword(value: string) {
    this.registerPassword = value;
  }

  setConfirmPassword(value: string) {
    this.confirmPassword = value;
  }

  setSelectedRoleId(value: string) {
    this.selectedRoleId = value;
  }

  async loadBootstrapData() {
    await Promise.all([this.loadRoles(), this.loadUsers()]);
  }

  async loadRoles() {
    this.isRolesLoading = true;

    try {
      const roles = await this.roleRepository.getAll();
      runInAction(() => {
        this.roles = roles.filter((role) => role.isActive);
        if (!this.selectedRoleId && this.roles.length > 0) {
          this.selectedRoleId = this.roles[0].id;
        }
      });
    } catch (error) {
      runInAction(() => {
        this.roles = fallbackRoles;
        this.helperMessage = error instanceof Error ? error.message : "No se pudieron cargar los roles reales.";
        if (!this.selectedRoleId && this.roles.length > 0) {
          this.selectedRoleId = this.roles[0].id;
        }
      });
    } finally {
      runInAction(() => {
        this.isRolesLoading = false;
      });
    }
  }

  async loadUsers() {
    this.isUsersLoading = true;
    this.usersErrorMessage = "";

    try {
      const users = await this.userRepository.getAll();
      runInAction(() => {
        this.users = users;
      });
    } catch (error) {
      runInAction(() => {
        this.users = fallbackUsers;
        this.usersErrorMessage = error instanceof Error ? error.message : "No se pudieron cargar los usuarios.";
      });
    } finally {
      runInAction(() => {
        this.isUsersLoading = false;
      });
    }
  }

  async login() {
    this.loginErrorMessage = "";
    this.loginSuccessMessage = "";

    if (!this.canLogin) {
      this.loginErrorMessage = "Debes capturar correo y contraseña.";
      return false;
    }

    this.isLoggingIn = true;

    try {
      const response = await this.authRepository.login({
        email: this.email.trim(),
        password: this.password,
      });

      runInAction(() => {
        sessionStore.setSession({
          token: response.token,
          role: response.role,
          email: response.email,
          refreshToken: response.refreshToken,
          expiresAt: response.expiresAt,
        });
        this.password = "";
        this.loginSuccessMessage = "Inicio de sesión exitoso.";
      });

      return true;
    } catch (error) {
      runInAction(() => {
        this.loginErrorMessage = error instanceof Error ? error.message : "No fue posible iniciar sesión.";
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoggingIn = false;
      });
    }
  }

  async register() {
    this.registerErrorMessage = "";
    this.registerSuccessMessage = "";

    if (!this.canRegister) {
      this.registerErrorMessage = "Completa todos los campos del registro.";
      return false;
    }

    if (this.registerPassword !== this.confirmPassword) {
      this.registerErrorMessage = "La confirmación de contraseña no coincide.";
      return false;
    }

    this.isRegistering = true;

    try {
      const createdUser = await this.userRepository.create({
        email: this.registerEmail.trim(),
        password: this.registerPassword,
        roleId: this.selectedRoleId,
      });

      runInAction(() => {
        this.users = [createdUser, ...this.users.filter((user) => user.id !== createdUser.id)];
        this.registerSuccessMessage = `Cuenta creada correctamente para ${createdUser.email}.`;
        this.email = createdUser.email;
        this.password = "";
        this.registerEmail = "";
        this.registerPassword = "";
        this.confirmPassword = "";
      });

      return true;
    } catch (error) {
      runInAction(() => {
        this.registerErrorMessage = error instanceof Error ? error.message : "No se pudo registrar el usuario.";
      });
      return false;
    } finally {
      runInAction(() => {
        this.isRegistering = false;
      });
    }
  }

  logout() {
    sessionStore.clearSession();
    this.loginSuccessMessage = "Sesión cerrada correctamente.";
  }
}
