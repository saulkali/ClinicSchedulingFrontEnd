import { makeAutoObservable } from "mobx";
import { AuthRepository } from "../model/repositories/AuthRepository";
import { sessionStore } from "../../../core/session/SessionStore";

export class LoginViewModel {
  email = "";
  password = "";
  isLoading = false;
  errorMessage = "";
  successMessage = "";

  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  setEmail(value: string) {
    this.email = value;
  }

  setPassword(value: string) {
    this.password = value;
  }

  clearMessages() {
    this.errorMessage = "";
    this.successMessage = "";
  }

  resetForm() {
    this.email = "";
    this.password = "";
    this.clearMessages();
  }

  get canSubmit() {
    return this.email.trim().length > 0 && this.password.trim().length > 0 && !this.isLoading;
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
}
