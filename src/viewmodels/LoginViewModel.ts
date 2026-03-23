import { makeAutoObservable, runInAction } from "mobx";
import type { RoleEntity } from "../common/entities/RoleEntity";
import type { AuthRepository } from "../models/repositories/AuthRepository";
import type { RoleRepository } from "../models/repositories/RoleRepository";
import type { UserRepository } from "../models/repositories/UserRepository";
import { sessionStore } from "../common/session/SessionStore";

export class LoginViewModel {
  email = "";
  password = "";
  isLoading = false;
  errorMessage = "";
  successMessage = "";

  registerEmail = "";
  registerPassword = "";
  confirmPassword = "";
  selectedRoleId = "";
  roles: RoleEntity[] = [];
  isRolesLoading = false;
  isRegistering = false;
  registerErrorMessage = "";
  registerSuccessMessage = "";
  rolesLoaded = false;

  private readonly authRepository: AuthRepository;
  private readonly roleRepository: RoleRepository;
  private readonly userRepository: UserRepository;

  constructor(
    authRepository: AuthRepository,
    roleRepository: RoleRepository,
    userRepository: UserRepository
  ) {
    this.authRepository = authRepository;
    this.roleRepository = roleRepository;
    this.userRepository = userRepository;
    makeAutoObservable(this, {}, { autoBind: true });
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

  clearMessages() {
    this.errorMessage = "";
    this.successMessage = "";
  }

  clearRegisterMessages() {
    this.registerErrorMessage = "";
    this.registerSuccessMessage = "";
  }

  resetForm() {
    this.email = "";
    this.password = "";
    this.clearMessages();
  }

  resetRegisterForm() {
    this.registerEmail = "";
    this.registerPassword = "";
    this.confirmPassword = "";
    this.selectedRoleId = "";
    this.clearRegisterMessages();
  }

  get canSubmit() {
    return this.email.trim().length > 0 && this.password.trim().length > 0 && !this.isLoading;
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

  async ensureRolesLoaded() {
    if (this.rolesLoaded || this.isRolesLoading) {
      return;
    }

    this.isRolesLoading = true;
    this.clearRegisterMessages();

    try {
      const roles = await this.roleRepository.getAll();
      const activeRoles = roles.filter((role) => role.isActive);

      runInAction(() => {
        this.roles = activeRoles;
        this.rolesLoaded = true;

        if (!this.selectedRoleId && activeRoles.length === 1) {
          this.selectedRoleId = activeRoles[0].id;
        }
      });
    } catch (error) {
      runInAction(() => {
        this.registerErrorMessage =
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los roles disponibles.";
      });
    } finally {
      runInAction(() => {
        this.isRolesLoading = false;
      });
    }
  }

  async login() {
    this.clearMessages();

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = "Debes capturar el correo electrónico y la contraseña.";
      return false;
    }

    this.isLoading = true;

    try {
      const response = await this.authRepository.login({
        email: this.email.trim(),
        password: this.password,
      });

      sessionStore.setSession({
        token: response.token,
        role: response.role,
        email: response.email,
        refreshToken: response.refreshToken,
        expiresAt: response.expiresAt,
      });

      this.successMessage = "Inicio de sesión exitoso.";
      this.password = "";

      return true;
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesión en este momento.";
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  async register() {
    this.clearRegisterMessages();

    if (!this.registerEmail.trim() || !this.registerPassword.trim() || !this.confirmPassword.trim()) {
      this.registerErrorMessage = "Completa el correo y la contraseña para continuar.";
      return false;
    }

    if (!this.selectedRoleId.trim()) {
      this.registerErrorMessage = "Selecciona el rol con el que deseas registrarte.";
      return false;
    }

    if (this.registerPassword.length < 6) {
      this.registerErrorMessage = "La contraseña debe tener al menos 6 caracteres.";
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

      const roleName =
        this.roles.find((role) => role.id === createdUser.roleId)?.name ?? createdUser.roleName;

      this.registerSuccessMessage = `Cuenta creada correctamente como ${roleName}.`;
      this.email = createdUser.email;
      this.password = "";
      this.resetRegisterForm();
      this.registerSuccessMessage = `Cuenta creada correctamente como ${roleName}.`;

      return true;
    } catch (error) {
      this.registerErrorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo completar el registro en este momento.";
      return false;
    } finally {
      this.isRegistering = false;
    }
  }
}
