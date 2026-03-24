import { makeAutoObservable, runInAction } from "mobx";
import type { AppointmentEntity, UpdateAppointmentEntity } from "../common/entities/AppointmentEntity";
import type { DoctorEntity } from "../common/entities/DoctorEntity";
import type { DoctorScheduleEntity } from "../common/entities/DoctorScheduleEntity";
import type { PatientEntity } from "../common/entities/PatientEntity";
import type { SpecialtyEntity } from "../common/entities/SpecialtyEntity";
import { sessionStore } from "../common/session/SessionStore";
import type { IAppointmentRepository } from "../models/irepositories/IAppointmentRepository";
import type { IDoctorRepository } from "../models/irepositories/IDoctorRepository";
import type { IDoctorScheduleRepository } from "../models/irepositories/IDoctorScheduleRepository";
import type { IPatientRepository } from "../models/irepositories/IPatientRepository";
import type { ISpecialtyRepository } from "../models/irepositories/ISpecialtyRepository";

const toDateOnly = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addMinutes = (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60000);

const toDateTimeLocalValue = (value: Date) => {
  const offset = value.getTimezoneOffset();
  const localDate = new Date(value.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
};

export const dayOptions = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
];

const normalizeStatus = (status: string) => status.trim().toLowerCase();

const buildAppointmentUpdate = (
  appointment: AppointmentEntity,
  changes: Partial<UpdateAppointmentEntity>
): UpdateAppointmentEntity => ({
  doctorId: appointment.doctorId,
  patientId: appointment.patientId,
  startDateTime: appointment.startDateTime,
  endDateTime: appointment.endDateTime,
  durationMinutes: appointment.durationMinutes,
  reason: appointment.reason ?? "",
  status: appointment.status,
  cancellationReason: appointment.cancellationReason ?? "",
  isActive: appointment.isActive,
  ...changes,
});

export class AppointmentsViewModel {
  loading = false;
  errorMessage = "";
  successMessage = "";

  doctors: DoctorEntity[] = [];
  patients: PatientEntity[] = [];
  specialties: SpecialtyEntity[] = [];
  appointments: AppointmentEntity[] = [];
  schedules: DoctorScheduleEntity[] = [];

  specialtyForm = { name: "", appointmentDurationMinutes: "30" };
  scheduleForm = { dayOfWeek: "1", startTime: "08:00", endTime: "17:00" };
  bookingForm = {
    doctorId: "",
    selectedSlot: "",
    reason: "",
  };
  calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  private readonly doctorRepository: IDoctorRepository;
  private readonly patientRepository: IPatientRepository;
  private readonly specialtyRepository: ISpecialtyRepository;
  private readonly appointmentRepository: IAppointmentRepository;
  private readonly doctorScheduleRepository: IDoctorScheduleRepository;

  constructor(
    doctorRepository: IDoctorRepository,
    patientRepository: IPatientRepository,
    specialtyRepository: ISpecialtyRepository,
    appointmentRepository: IAppointmentRepository,
    doctorScheduleRepository: IDoctorScheduleRepository
  ) {
    this.doctorRepository = doctorRepository;
    this.patientRepository = patientRepository;
    this.specialtyRepository = specialtyRepository;
    this.appointmentRepository = appointmentRepository;
    this.doctorScheduleRepository = doctorScheduleRepository;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  clearMessages() {
    this.errorMessage = "";
    this.successMessage = "";
  }

  setSpecialtyForm<K extends keyof AppointmentsViewModel["specialtyForm"]>(
    key: K,
    value: AppointmentsViewModel["specialtyForm"][K]
  ) {
    this.specialtyForm[key] = value;
  }

  setScheduleForm<K extends keyof AppointmentsViewModel["scheduleForm"]>(
    key: K,
    value: AppointmentsViewModel["scheduleForm"][K]
  ) {
    this.scheduleForm[key] = value;
  }

  setBookingDoctor(doctorId: string) {
    this.bookingForm.doctorId = doctorId;
    this.bookingForm.selectedSlot = "";
  }

  setBookingSlot(slot: string) {
    this.bookingForm.selectedSlot = slot;
  }

  setBookingReason(reason: string) {
    this.bookingForm.reason = reason;
  }

  setCalendarMonth(date: Date) {
    this.calendarMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  }

  goToPreviousMonth() {
    this.setCalendarMonth(new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() - 1, 1));
  }

  goToNextMonth() {
    this.setCalendarMonth(new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() + 1, 1));
  }

  get currentRole() {
    return sessionStore.normalizedRole || "PATIENT";
  }

  get currentDoctor() {
    return this.doctors.find((doctor) => doctor.userId === sessionStore.userId) ?? null;
  }

  get currentPatient() {
    return this.patients.find((patient) => patient.userId === sessionStore.userId) ?? null;
  }

  get visibleDoctors() {
    return this.doctors.filter((doctor) => doctor.isActive);
  }

  get visibleSpecialties() {
    return this.specialties.filter((specialty) => specialty.isActive);
  }

  get filteredAppointments() {
    if (this.currentRole === "ADMIN") {
      return this.appointments;
    }

    if (this.currentRole === "DOCTOR" && this.currentDoctor) {
      return this.appointments.filter((appointment) => appointment.doctorId === this.currentDoctor?.id);
    }

    if (this.currentRole === "PATIENT" && this.currentPatient) {
      return this.appointments.filter((appointment) => appointment.patientId === this.currentPatient?.id);
    }

    return [];
  }

  get filteredSchedules() {
    if (this.currentRole === "DOCTOR" && this.currentDoctor) {
      return this.schedules.filter((schedule) => schedule.doctorId === this.currentDoctor?.id);
    }

    return this.schedules;
  }

  get appointmentSummary() {
    return {
      active: this.filteredAppointments.filter((item) => ["scheduled", "active", "confirmed"].includes(normalizeStatus(item.status))).length,
      cancelled: this.filteredAppointments.filter((item) => ["cancelled", "canceled"].includes(normalizeStatus(item.status))).length,
      completed: this.filteredAppointments.filter((item) => ["completed", "done"].includes(normalizeStatus(item.status))).length,
    };
  }

  get selectedDoctor() {
    return this.visibleDoctors.find((doctor) => doctor.id === this.bookingForm.doctorId) ?? null;
  }

  get selectedDoctorSpecialty() {
    return this.visibleSpecialties.find((specialty) => specialty.id === this.selectedDoctor?.specialtyId) ?? null;
  }

  get selectedDoctorSchedules() {
    return this.schedules
      .filter((schedule) => schedule.doctorId === this.bookingForm.doctorId && schedule.isActive)
      .sort((left, right) => left.dayOfWeek - right.dayOfWeek || left.startTime.localeCompare(right.startTime));
  }

  get currentPatientCancelledAppointments() {
    if (!this.currentPatient) {
      return 0;
    }

    return this.appointments.filter(
      (appointment) =>
        appointment.patientId === this.currentPatient?.id &&
        ["cancelled", "canceled"].includes(normalizeStatus(appointment.status))
    ).length;
  }

  get shouldShowCancellationAlert() {
    return this.currentPatientCancelledAppointments > 3;
  }
  
  
  get calendarAppointments() {
    return [...this.filteredAppointments].sort(
      (left, right) => new Date(left.startDateTime).getTime() - new Date(right.startDateTime).getTime()
    );
  }

  get appointmentDatesMap() {
    return this.calendarAppointments.reduce<Record<string, AppointmentEntity[]>>((accumulator, appointment) => {
      const key = toDateOnly(new Date(appointment.startDateTime));
      accumulator[key] = [...(accumulator[key] ?? []), appointment];
      return accumulator;
    }, {});
  }

  async loadDashboardData() {
    if (!sessionStore.isLoggedIn) {
      runInAction(() => {
        this.doctors = [];
        this.patients = [];
        this.specialties = [];
        this.appointments = [];
        this.schedules = [];
        this.clearMessages();
      });
      return;
    }

    this.loading = true;
    this.errorMessage = "";

    try {
      const [doctorData, patientData, specialtyData, scheduleData] = await Promise.all([
        this.doctorRepository.getAll(),
        this.patientRepository.getAll(),
        this.specialtyRepository.getAll(),
        this.doctorScheduleRepository.getAll(),
      ]);

      const currentPatient = patientData.find((patient) => patient.userId === sessionStore.userId) ?? null;

      const appointmentData =
        this.currentRole === "ADMIN"
          ? await this.appointmentRepository.getAll()
          : this.currentRole === "PATIENT" && currentPatient
              ? await this.appointmentRepository.getByPatientId(currentPatient.id)
              : await this.appointmentRepository.getAll();

      runInAction(() => {
        this.doctors = doctorData;
        this.patients = patientData;
        this.specialties = specialtyData;
        this.appointments = appointmentData;
        this.schedules = scheduleData;
      });
    } catch (error) {
      runInAction(() => {
        this.errorMessage = error instanceof Error ? error.message : "No se pudo cargar el panel.";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async refreshAll(successMessage?: string) {
    await this.loadDashboardData();
    if (successMessage) {
      runInAction(() => {
        this.successMessage = successMessage;
      });
    }
  }

  async createSpecialty() {
    try {
      if (!this.specialtyForm.name.trim()) {
        this.errorMessage = "Debes escribir el nombre de la especialidad.";
        return false;
      }

      const duration = Number(this.specialtyForm.appointmentDurationMinutes);
      if (Number.isNaN(duration) || duration < 5 || duration > 240) {
        this.errorMessage = "La duración de la cita debe estar entre 5 y 240 minutos.";
        return false;
      }

      await this.specialtyRepository.create({
        name: this.specialtyForm.name.trim(),
        appointmentDurationMinutes: duration,
      });

      runInAction(() => {
        this.specialtyForm = { name: "", appointmentDurationMinutes: "30" };
      });
      await this.refreshAll("Especialidad registrada correctamente.");
      return true;
    } catch (error) {
      runInAction(() => {
        this.errorMessage = error instanceof Error ? error.message : "No se pudo registrar la especialidad.";
      });
      return false;
    }
  }

  async createSchedule() {
    try {
      if (!this.currentDoctor) {
        this.errorMessage = "Primero debes completar el perfil del doctor.";
        return false;
      }

      if (this.scheduleForm.startTime >= this.scheduleForm.endTime) {
        this.errorMessage = "La hora de fin debe ser posterior a la hora de inicio.";
        return false;
      }

      await this.doctorScheduleRepository.create({
        doctorId: this.currentDoctor.id,
        dayOfWeek: Number(this.scheduleForm.dayOfWeek),
        startTime: `${this.scheduleForm.startTime}:00`,
        endTime: `${this.scheduleForm.endTime}:00`,
      });

      await this.refreshAll("Horario laboral guardado correctamente.");
      return true;
    } catch (error) {
      runInAction(() => {
        this.errorMessage = error instanceof Error ? error.message : "No se pudo guardar el horario laboral.";
      });
      return false;
    }
  }

  async createAppointment() {
    try {
      if (!this.currentPatient) {
        this.errorMessage = "Primero debes completar el perfil del paciente.";
        return false;
      }

      if (!this.bookingForm.doctorId) {
        this.errorMessage = "Selecciona un doctor para agendar la cita.";
        return false;
      }

      if (!this.bookingForm.selectedSlot) {
        this.errorMessage = "Selecciona la fecha y hora para agendar la cita.";
        return false;
      }

      const selectedDateTime = new Date(this.bookingForm.selectedSlot);
      if (Number.isNaN(selectedDateTime.getTime())) {
        this.errorMessage = "La fecha y hora seleccionada no es válida.";
        return false;
      }

      if (selectedDateTime < new Date()) {
        this.errorMessage = "No se pueden agendar citas en fechas u horas anteriores.";
        return false;
      }

      const selectedSlotStart = selectedDateTime.toISOString();
      const selectedSlotEnd = addMinutes(
        selectedDateTime,
        this.selectedDoctorSpecialty?.appointmentDurationMinutes ?? 30
      ).toISOString();

      await this.appointmentRepository.create({
        doctorId: this.bookingForm.doctorId,
        patientId: this.currentPatient.id,
        startDateTime: selectedSlotStart,
        endDateTime: selectedSlotEnd,
        durationMinutes: this.selectedDoctorSpecialty?.appointmentDurationMinutes ?? 30,
        reason: this.bookingForm.reason.trim() || undefined,
        status: "Scheduled",
        cancellationReason: undefined,
      });

      runInAction(() => {
        this.bookingForm = {
          doctorId: "",
          selectedSlot: "",
          reason: "",
        };
      });
      await this.refreshAll("Cita agendada correctamente.");
      return true;
    } catch (error) {
      runInAction(() => {
        this.errorMessage = error instanceof Error ? error.message : "No se pudo agendar la cita.";
      });
      return false;
    }
  }

  async cancelAppointment(appointment: AppointmentEntity, cancellationReason?: string) {
    try {
      await this.appointmentRepository.update(
        appointment.id,
        buildAppointmentUpdate(appointment, {
          status: "Cancelled",
          cancellationReason: cancellationReason?.trim() || "Cancelada desde el portal web.",
        })
      );
      await this.refreshAll("La cita fue cancelada correctamente.");
      return true;
    } catch (error) {
      runInAction(() => {
        this.errorMessage = error instanceof Error ? error.message : "No se pudo cancelar la cita.";
      });
      return false;
    }
  }

  async completeAppointment(appointment: AppointmentEntity) {
    try {
      await this.appointmentRepository.update(
        appointment.id,
        buildAppointmentUpdate(appointment, {
          status: "Completed",
        })
      );
      await this.refreshAll("La cita fue marcada como completada.");
      return true;
    } catch (error) {
      runInAction(() => {
        this.errorMessage = error instanceof Error ? error.message : "No se pudo actualizar la cita.";
      });
      return false;
    }
  }

  getSuggestedDateTime() {
    return toDateTimeLocalValue(new Date(Date.now() + 3600000));
  }
}

export const getStatusColor = (status: string): "success" | "warning" | "error" | "default" => {
  const normalized = normalizeStatus(status);

  if (["scheduled", "active", "confirmed"].includes(normalized)) {
    return "success";
  }

  if (["cancelled", "canceled"].includes(normalized)) {
    return "error";
  }

  if (["completed", "done"].includes(normalized)) {
    return "warning";
  }

  return "default";
};

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("es-DO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const createMonthMatrix = (month: Date) => {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const calendarStart = new Date(firstDay);
  calendarStart.setDate(firstDay.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    return date;
  });
};

export const isSameMonth = (left: Date, month: Date) =>
  left.getFullYear() === month.getFullYear() && left.getMonth() === month.getMonth();

export const toDateKey = toDateOnly;
