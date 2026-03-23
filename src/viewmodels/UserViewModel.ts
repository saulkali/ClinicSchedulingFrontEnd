import { makeAutoObservable, runInAction } from "mobx";
import { sessionStore } from "../common/session/SessionStore";
import type { IAuthRepository } from "../models/irepositories/IAuthRepository";
import type { IDoctorRepository } from "../models/irepositories/IDoctorRepository";
import type { IPatientRepository } from "../models/irepositories/IPatientRepository";
import type { IUserRepository } from "../models/irepositories/IUserRepository";
import type { RolesViewModel } from "./RolesViewModel";

export class UserViewModel {
  email = "";
  password = "";
  isLoading = false;
  errorMessage = "";
  successMessage = "";

  registerEmail = "";
  registerPassword = "";
  confirmPassword = "";
  selectedRoleId = "";
  isRegistering = false;
  registerErrorMessage = "";
  registerSuccessMessage = "";

  patientForm = { name: "", birthDate: "", phone: "" };
  doctorForm = { name: "", phone: "", specialtyId: "" };
  profileErrorMessage = "";

  private readonly authRepository: IAuthRepository;
  private readonly userRepository: IUserRepository;
  private readonly patientRepository: IPatientRepository;
  private readonly doctorRepository: IDoctorRepository;
  private readonly rolesViewModel: RolesViewModel;

  constructor(
    authRepository: IAuthRepository,
    userRepository: IUserRepository,
    patientRepository: IPatientRepository,
    doctorRepository: IDoctorRepository,
    rolesViewModel: RolesViewModel
  ) {
    this.authRepository = authRepository;
    this.userRepository = userRepository;
    this.patientRepository = patientRepository;
    this.doctorRepository = doctorRepository;
    this.rolesViewModel = rolesViewModel;
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

  setPatientForm<K extends keyof UserViewModel["patientForm"]>(key: K, value: UserViewModel["patientForm"][K]) {
    this.patientForm[key] = value;
  }

  setDoctorForm<K extends keyof UserViewModel["doctorForm"]>(key: K, value: UserViewModel["doctorForm"][K]) {
    this.doctorForm[key] = value;
  }

  syncProfileForms(args: {
    currentRole: string;
    currentPatient?: { name: string; birthDate?: string | null; phone?: string | null } | null;
    currentDoctor?: { name: string; phone?: string | null; specialtyId: string } | null;
  }) {
    if (args.currentRole === "PATIENT" && args.currentPatient) {
      this.patientForm = {
        name: args.currentPatient.name,
        birthDate: args.currentPatient.birthDate?.slice(0, 10) ?? "",
        phone: args.currentPatient.phone ?? "",
      };
    }

    if (args.currentRole === "DOCTOR" && args.currentDoctor) {
      this.doctorForm = {
        name: args.currentDoctor.name,
        phone: args.currentDoctor.phone ?? "",
        specialtyId: args.currentDoctor.specialtyId,
      };
    }
  }

  clearMessages() {
    this.errorMessage = "";
    this.successMessage = "";
  }

  clearRegisterMessages() {
    this.registerErrorMessage = "";
    this.registerSuccessMessage = "";
  }

  clearProfileMessages() {
    this.profileErrorMessage = "";
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
    await this.rolesViewModel.loadRoles();

    if (!this.selectedRoleId && this.rolesViewModel.activeRoles.length === 1) {
      this.selectedRoleId = this.rolesViewModel.activeRoles[0].id;
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

      runInAction(() => {
        sessionStore.setSession({
          token: response.token,
          role: response.role,
          email: response.email,
          refreshToken: response.refreshToken,
          expiresAt: response.expiresAt,
        });
        this.successMessage = "Inicio de sesión exitoso.";
        this.password = "";
      });

      return true;
    } catch (error) {
      runInAction(() => {
        this.errorMessage =
          error instanceof Error ? error.message : "No se pudo iniciar sesión en este momento.";
      });
      return false;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
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
        this.rolesViewModel.roles.find((role) => role.id === createdUser.roleId)?.name ?? createdUser.roleName;

      runInAction(() => {
        this.email = createdUser.email;
        this.password = "";
        this.resetRegisterForm();
        this.registerSuccessMessage = `Cuenta creada correctamente como ${roleName}.`;
      });

      return true;
    } catch (error) {
      runInAction(() => {
        this.registerErrorMessage =
          error instanceof Error ? error.message : "No se pudo completar el registro en este momento.";
      });
      return false;
    } finally {
      runInAction(() => {
        this.isRegistering = false;
      });
    }
  }

  async createPatientProfile(userId: string) {
    this.clearProfileMessages();

    if (!this.patientForm.name.trim()) {
      this.profileErrorMessage = "El nombre del paciente es obligatorio.";
      return false;
    }

    try {
      await this.patientRepository.create({
        userId,
        name: this.patientForm.name.trim(),
        birthDate: this.patientForm.birthDate || undefined,
        phone: this.patientForm.phone.trim() || undefined,
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.profileErrorMessage =
          error instanceof Error ? error.message : "No se pudo completar el perfil del paciente.";
      });
      return false;
    }
  }

  async createDoctorProfile(userId: string) {
    this.clearProfileMessages();

    if (!this.doctorForm.name.trim() || !this.doctorForm.specialtyId) {
      this.profileErrorMessage = "Debes indicar el nombre y seleccionar una especialidad.";
      return false;
    }

    try {
      await this.doctorRepository.create({
        userId,
        specialtyId: this.doctorForm.specialtyId,
        name: this.doctorForm.name.trim(),
        phone: this.doctorForm.phone.trim() || undefined,
      });
      return true;
    } catch (error) {
      runInAction(() => {
        this.profileErrorMessage =
          error instanceof Error ? error.message : "No se pudo completar el perfil del doctor.";
      });
      return false;
    }
  }
}
