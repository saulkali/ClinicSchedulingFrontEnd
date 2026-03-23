import { makeAutoObservable, runInAction } from "mobx";
import type { AppointmentEntity } from "../common/entities/AppointmentEntity";
import type { DoctorEntity } from "../common/entities/DoctorEntity";
import type { DoctorScheduleEntity } from "../common/entities/DoctorScheduleEntity";
import { sessionStore } from "../common/session/SessionStore";
import { addMinutes, buildMonthGrid, combineDateAndTime, isPastDay, isSameDay, startOfDay } from "../common/utils/date";
import type { IAppointmentRepository } from "../models/irepositories/IAppointmentRepository";
import type { IDoctorScheduleRepository } from "../models/irepositories/IDoctorScheduleRepository";

const fallbackDoctors: DoctorEntity[] = [
  {
    id: "doctor-1",
    name: "Dra. Laura Méndez",
    specialty: "Cardiología",
    email: "laura.mendez@clinica.com",
    isActive: true,
  },
  {
    id: "doctor-2",
    name: "Dr. José Ramírez",
    specialty: "Traumatología",
    email: "jose.ramirez@clinica.com",
    isActive: true,
  },
  {
    id: "doctor-3",
    name: "Dra. Fernanda Ortiz",
    specialty: "Pediatría",
    email: "fernanda.ortiz@clinica.com",
    isActive: true,
  },
];

const fallbackSchedules: DoctorScheduleEntity[] = [
  { id: "sch-1", doctorId: "doctor-1", weekday: 1, startTime: "09:00", endTime: "16:00", slotMinutes: 30, isActive: true },
  { id: "sch-2", doctorId: "doctor-1", weekday: 3, startTime: "10:00", endTime: "17:00", slotMinutes: 30, isActive: true },
  { id: "sch-3", doctorId: "doctor-1", weekday: 5, startTime: "08:00", endTime: "13:00", slotMinutes: 30, isActive: true },
  { id: "sch-4", doctorId: "doctor-2", weekday: 2, startTime: "11:00", endTime: "18:00", slotMinutes: 60, isActive: true },
  { id: "sch-5", doctorId: "doctor-2", weekday: 4, startTime: "09:00", endTime: "15:00", slotMinutes: 60, isActive: true },
  { id: "sch-6", doctorId: "doctor-3", weekday: 1, startTime: "08:00", endTime: "14:00", slotMinutes: 30, isActive: true },
  { id: "sch-7", doctorId: "doctor-3", weekday: 2, startTime: "08:00", endTime: "14:00", slotMinutes: 30, isActive: true },
  { id: "sch-8", doctorId: "doctor-3", weekday: 4, startTime: "12:00", endTime: "18:00", slotMinutes: 30, isActive: true },
];

const now = new Date();
const fallbackAppointments: AppointmentEntity[] = [
  {
    id: "appt-1",
    doctorId: "doctor-1",
    doctorName: "Dra. Laura Méndez",
    patientName: "Paciente Demo",
    patientEmail: sessionStore.email || "paciente.demo@clinica.com",
    specialty: "Cardiología",
    startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0).toISOString(),
    endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 30).toISOString(),
    status: "Confirmada",
    notes: "Control de presión arterial",
  },
  {
    id: "appt-2",
    doctorId: "doctor-3",
    doctorName: "Dra. Fernanda Ortiz",
    patientName: "María López",
    patientEmail: "maria.lopez@correo.com",
    specialty: "Pediatría",
    startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 12, 0).toISOString(),
    endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 12, 30).toISOString(),
    status: "Programada",
    notes: "Revisión de rutina",
  },
];

export class AppointmentsViewModel {
  doctors: DoctorEntity[] = fallbackDoctors;
  schedules: DoctorScheduleEntity[] = [];
  appointments: AppointmentEntity[] = [];
  selectedDoctorId = fallbackDoctors[0]?.id ?? "";
  selectedDate = startOfDay(new Date());
  selectedTime = "";
  patientName = sessionStore.email ? sessionStore.email.split("@")[0] : "";
  patientEmail = sessionStore.email;
  notes = "";
  currentMonth = startOfDay(new Date());
  isLoading = false;
  isSaving = false;
  errorMessage = "";
  successMessage = "";
  helperMessage = "";

  private readonly appointmentRepository: IAppointmentRepository;
  private readonly doctorScheduleRepository: IDoctorScheduleRepository;

  constructor(
    appointmentRepository: IAppointmentRepository,
    doctorScheduleRepository: IDoctorScheduleRepository
  ) {
    this.appointmentRepository = appointmentRepository;
    this.doctorScheduleRepository = doctorScheduleRepository;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get selectedDoctor() {
    return this.doctors.find((doctor) => doctor.id === this.selectedDoctorId) ?? this.doctors[0];
  }

  get selectedDoctorSchedules() {
    return this.schedules.filter((schedule) => schedule.doctorId === this.selectedDoctorId && schedule.isActive);
  }

  get monthDays() {
    return buildMonthGrid(this.currentMonth);
  }

  get appointmentsForSelectedDate() {
    return this.appointments
      .filter((appointment) => isSameDay(new Date(appointment.startsAt), this.selectedDate))
      .sort((left, right) => left.startsAt.localeCompare(right.startsAt));
  }

  get availableTimes() {
    const schedule = this.selectedDoctorSchedules.find((item) => item.weekday === this.selectedDate.getDay());

    if (!schedule || isPastDay(this.selectedDate)) {
      return [];
    }

    const start = combineDateAndTime(this.selectedDate, schedule.startTime);
    const end = combineDateAndTime(this.selectedDate, schedule.endTime);
    const times: string[] = [];

    for (let cursor = start; cursor < end; cursor = addMinutes(cursor, schedule.slotMinutes)) {
      const label = cursor.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
      const alreadyTaken = this.appointments.some(
        (appointment) =>
          appointment.doctorId === this.selectedDoctorId &&
          new Date(appointment.startsAt).getTime() === cursor.getTime() &&
          appointment.status !== "Cancelada"
      );

      if (!alreadyTaken && cursor.getTime() >= Date.now()) {
        times.push(label);
      }
    }

    return times;
  }

  async loadData() {
    this.isLoading = true;
    this.errorMessage = "";
    this.helperMessage = "";

    try {
      const [appointments, schedules] = await Promise.all([
        this.appointmentRepository.getAll(),
        this.doctorScheduleRepository.getAll(),
      ]);

      runInAction(() => {
        this.appointments = appointments;
        this.schedules = schedules;
      });
    } catch (error) {
      runInAction(() => {
        this.appointments = fallbackAppointments;
        this.schedules = fallbackSchedules;
        this.errorMessage = error instanceof Error ? error.message : "No fue posible cargar las citas.";
        this.helperMessage = "Se muestran citas y horarios de demostración mientras se integra el backend completo.";
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
        this.ensureSelectedDateIsValid();
      });
    }
  }

  setSelectedDoctorId(value: string) {
    this.selectedDoctorId = value;
    this.selectedTime = "";
    this.ensureSelectedDateIsValid();
  }

  setSelectedDate(value: Date) {
    this.selectedDate = startOfDay(value);
    this.selectedTime = "";
  }

  setSelectedTime(value: string) {
    this.selectedTime = value;
  }

  setPatientName(value: string) {
    this.patientName = value;
  }

  setPatientEmail(value: string) {
    this.patientEmail = value;
  }

  setNotes(value: string) {
    this.notes = value;
  }

  previousMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
  }

  getDayAppointmentCount(day: Date) {
    return this.appointments.filter((appointment) => isSameDay(new Date(appointment.startsAt), day)).length;
  }

  isDoctorAvailableOn(day: Date) {
    if (isPastDay(day)) {
      return false;
    }

    return this.selectedDoctorSchedules.some((schedule) => schedule.weekday === day.getDay());
  }

  ensureSelectedDateIsValid() {
    if (!this.isDoctorAvailableOn(this.selectedDate)) {
      const nextAvailable = this.monthDays.find((day) => this.isDoctorAvailableOn(day));
      if (nextAvailable) {
        this.selectedDate = startOfDay(nextAvailable);
      }
    }
  }

  async createAppointment() {
    this.errorMessage = "";
    this.successMessage = "";

    if (!this.selectedDoctor) {
      this.errorMessage = "Selecciona un doctor para agendar.";
      return false;
    }

    if (!this.patientName.trim() || !this.patientEmail.trim()) {
      this.errorMessage = "Captura el nombre y correo del paciente.";
      return false;
    }

    if (!this.isDoctorAvailableOn(this.selectedDate)) {
      this.errorMessage = "Solo puedes agendar en días laborales del doctor seleccionado.";
      return false;
    }

    if (!this.selectedTime) {
      this.errorMessage = "Selecciona un horario disponible.";
      return false;
    }

    const start = combineDateAndTime(this.selectedDate, this.selectedTime);
    if (start.getTime() < Date.now()) {
      this.errorMessage = "No se pueden agendar citas en fechas u horas anteriores.";
      return false;
    }

    const schedule = this.selectedDoctorSchedules.find((item) => item.weekday === this.selectedDate.getDay());
    if (!schedule) {
      this.errorMessage = "El doctor no tiene horario asignado para ese día.";
      return false;
    }

    this.isSaving = true;

    try {
      const createdAppointment = await this.appointmentRepository.create({
        doctorId: this.selectedDoctor.id,
        patientName: this.patientName.trim(),
        patientEmail: this.patientEmail.trim(),
        startsAt: start.toISOString(),
        endsAt: addMinutes(start, schedule.slotMinutes).toISOString(),
        notes: this.notes.trim(),
        status: "Programada",
      });

      runInAction(() => {
        this.appointments = [createdAppointment, ...this.appointments];
        this.successMessage = "Cita agendada correctamente.";
        this.selectedTime = "";
        this.notes = "";
      });

      return true;
    } catch {
      const fallbackAppointment: AppointmentEntity = {
        id: `appt-${crypto.randomUUID()}`,
        doctorId: this.selectedDoctor.id,
        doctorName: this.selectedDoctor.name,
        patientName: this.patientName.trim(),
        patientEmail: this.patientEmail.trim(),
        specialty: this.selectedDoctor.specialty,
        startsAt: start.toISOString(),
        endsAt: addMinutes(start, schedule.slotMinutes).toISOString(),
        status: "Programada",
        notes: this.notes.trim(),
      };

      runInAction(() => {
        this.appointments = [fallbackAppointment, ...this.appointments];
        this.successMessage = "Cita agendada localmente usando el calendario de disponibilidad del doctor.";
        this.selectedTime = "";
        this.notes = "";
      });

      return true;
    } finally {
      runInAction(() => {
        this.isSaving = false;
      });
    }
  }
}
