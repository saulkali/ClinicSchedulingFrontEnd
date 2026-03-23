import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  CssBaseline,
  Divider,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  CalendarMonth as CalendarMonthIcon,
  EventAvailable as EventAvailableIcon,
  Group as GroupIcon,
  Groups as GroupsIcon,
  LocalHospital as LocalHospitalIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  ManageAccounts as ManageAccountsIcon,
  MedicalServices as MedicalServicesIcon,
  Menu as MenuIcon,
  NotificationsActive as NotificationsActiveIcon,
  Person as PersonIcon,
  PersonSearch as PersonSearchIcon,
  Schedule as ScheduleIcon,
  Today as TodayIcon,
} from "@mui/icons-material";
import { observer } from "mobx-react-lite";
import type { AppointmentEntity, UpdateAppointmentEntity } from "../common/entities/AppointmentEntity";
import type { DoctorEntity } from "../common/entities/DoctorEntity";
import type { DoctorScheduleEntity } from "../common/entities/DoctorScheduleEntity";
import type { PatientEntity } from "../common/entities/PatientEntity";
import type { SpecialtyEntity } from "../common/entities/SpecialtyEntity";
import { sessionStore } from "../common/session/SessionStore";
import { AppointmentRepository } from "../models/repositories/AppointmentRepository";
import { DoctorRepository } from "../models/repositories/DoctorRepository";
import { DoctorScheduleRepository } from "../models/repositories/DoctorScheduleRepository";
import { PatientRepository } from "../models/repositories/PatientRepository";
import { SpecialtyRepository } from "../models/repositories/SpecialtyRepository";
import { LoginView } from "./LoginView";

type SectionKey = "overview" | "patients" | "doctors" | "specialties" | "appointments" | "find-doctors" | "my-calendar" | "work-schedule";

type NavItem = {
  key: SectionKey;
  label: string;
  icon: ReactNode;
};

const drawerWidth = 300;
const dayOptions = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
];

const roleCopy: Record<string, { title: string; subtitle: string }> = {
  ADMIN: {
    title: "Panel administrativo",
    subtitle: "Supervisa pacientes, doctores, especialidades y operación clínica.",
  },
  PATIENT: {
    title: "Portal del paciente",
    subtitle: "Busca doctores, agenda citas y consulta tus estados de atención.",
  },
  DOCTOR: {
    title: "Portal del doctor",
    subtitle: "Organiza tu jornada, define tu horario laboral y gestiona tus citas.",
  },
};

const normalizeStatus = (status: string) => status.trim().toLowerCase();

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("es-DO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const getStatusColor = (status: string): "success" | "warning" | "error" | "default" => {
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

const toDateTimeLocalValue = (value: Date) => {
  const offset = value.getTimezoneOffset();
  const localDate = new Date(value.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
};

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

const getNavItemsByRole = (role: string): NavItem[] => {
  if (role === "ADMIN") {
    return [
      { key: "overview", label: "Resumen", icon: <AdminPanelSettingsIcon /> },
      { key: "patients", label: "Pacientes", icon: <GroupsIcon /> },
      { key: "doctors", label: "Doctores", icon: <MedicalServicesIcon /> },
      { key: "specialties", label: "Especialidades", icon: <ManageAccountsIcon /> },
      { key: "appointments", label: "Citas", icon: <CalendarMonthIcon /> },
    ];
  }

  if (role === "DOCTOR") {
    return [
      { key: "overview", label: "Resumen", icon: <MedicalServicesIcon /> },
      { key: "work-schedule", label: "Horario laboral", icon: <ScheduleIcon /> },
      { key: "appointments", label: "Citas", icon: <CalendarMonthIcon /> },
      { key: "my-calendar", label: "Calendario", icon: <TodayIcon /> },
    ];
  }

  return [
    { key: "overview", label: "Resumen", icon: <PersonIcon /> },
    { key: "find-doctors", label: "Buscar doctores", icon: <PersonSearchIcon /> },
    { key: "appointments", label: "Mis citas", icon: <CalendarMonthIcon /> },
    { key: "my-calendar", label: "Calendario", icon: <TodayIcon /> },
  ];
};

function AppointmentList({
  appointments,
  emptyText,
  onCancel,
  onComplete,
}: {
  appointments: AppointmentEntity[];
  emptyText: string;
  onCancel?: (appointment: AppointmentEntity) => void;
  onComplete?: (appointment: AppointmentEntity) => void;
}) {
  if (!appointments.length) {
    return <Alert severity="info">{emptyText}</Alert>;
  }

  return (
    <Stack spacing={2}>
      {appointments.map((appointment) => {
        const normalizedStatus = normalizeStatus(appointment.status);
        const canCancel = onCancel && !["cancelled", "canceled", "completed", "done"].includes(normalizedStatus);
        const canComplete = onComplete && ["scheduled", "active", "confirmed"].includes(normalizedStatus);

        return (
          <Card key={appointment.id} variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={800}>
                      {appointment.doctorName} · {appointment.patientName}
                    </Typography>
                    <Typography color="text.secondary">
                      {formatDateTime(appointment.startDateTime)} - {formatDateTime(appointment.endDateTime)}
                    </Typography>
                  </Box>

                  <Chip
                    label={appointment.status}
                    color={getStatusColor(appointment.status)}
                    sx={{ alignSelf: { xs: "flex-start", md: "center" } }}
                  />
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                  <Chip label={`Duración: ${appointment.durationMinutes} min`} variant="outlined" />
                  {appointment.reason ? <Chip label={`Motivo: ${appointment.reason}`} variant="outlined" /> : null}
                  {appointment.cancellationReason ? (
                    <Chip label={`Cancelación: ${appointment.cancellationReason}`} color="error" variant="outlined" />
                  ) : null}
                </Stack>

                {canCancel || canComplete ? (
                  <Stack direction="row" spacing={1.5}>
                    {canComplete ? (
                      <Button variant="contained" onClick={() => onComplete(appointment)}>
                        Marcar completada
                      </Button>
                    ) : null}
                    {canCancel ? (
                      <Button color="error" variant="outlined" onClick={() => onCancel(appointment)}>
                        Cancelar cita
                      </Button>
                    ) : null}
                  </Stack>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}

export const HomeView = observer(function HomeView() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [section, setSection] = useState<SectionKey>("overview");
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [pageMessage, setPageMessage] = useState("");
  const [doctors, setDoctors] = useState<DoctorEntity[]>([]);
  const [patients, setPatients] = useState<PatientEntity[]>([]);
  const [specialties, setSpecialties] = useState<SpecialtyEntity[]>([]);
  const [appointments, setAppointments] = useState<AppointmentEntity[]>([]);
  const [schedules, setSchedules] = useState<DoctorScheduleEntity[]>([]);
  const [patientForm, setPatientForm] = useState({ name: "", birthDate: "", phone: "" });
  const [doctorForm, setDoctorForm] = useState({ name: "", phone: "", specialtyId: "" });
  const [specialtyForm, setSpecialtyForm] = useState({ name: "", appointmentDurationMinutes: "30" });
  const [scheduleForm, setScheduleForm] = useState({ dayOfWeek: "1", startTime: "08:00", endTime: "17:00" });
  const [appointmentForm, setAppointmentForm] = useState({
    doctorId: "",
    startDateTime: toDateTimeLocalValue(new Date(Date.now() + 3600000)),
    reason: "",
  });

  const doctorRepository = useMemo(() => new DoctorRepository(), []);
  const patientRepository = useMemo(() => new PatientRepository(), []);
  const specialtyRepository = useMemo(() => new SpecialtyRepository(), []);
  const appointmentRepository = useMemo(() => new AppointmentRepository(), []);
  const doctorScheduleRepository = useMemo(() => new DoctorScheduleRepository(), []);

  const currentRole = sessionStore.normalizedRole || "PATIENT";
  const navItems = useMemo(() => getNavItemsByRole(currentRole), [currentRole]);
  const currentCopy = roleCopy[currentRole] ?? roleCopy.PATIENT;

  const currentDoctor = useMemo(
    () => doctors.find((doctor) => doctor.userId === sessionStore.userId) ?? null,
    [doctors]
  );
  const currentPatient = useMemo(
    () => patients.find((patient) => patient.userId === sessionStore.userId) ?? null,
    [patients]
  );

  const visibleDoctors = useMemo(() => doctors.filter((doctor) => doctor.isActive), [doctors]);
  const visibleSpecialties = useMemo(
    () => specialties.filter((specialty) => specialty.isActive),
    [specialties]
  );

  const filteredAppointments = useMemo(() => {
    if (currentRole === "ADMIN") {
      return appointments;
    }

    if (currentRole === "DOCTOR" && currentDoctor) {
      return appointments.filter((appointment) => appointment.doctorId === currentDoctor.id);
    }

    if (currentRole === "PATIENT" && currentPatient) {
      return appointments.filter((appointment) => appointment.patientId === currentPatient.id);
    }

    return [];
  }, [appointments, currentDoctor, currentPatient, currentRole]);

  const filteredSchedules = useMemo(() => {
    if (currentRole === "DOCTOR" && currentDoctor) {
      return schedules.filter((schedule) => schedule.doctorId === currentDoctor.id);
    }

    return schedules;
  }, [currentDoctor, currentRole, schedules]);

  const appointmentSummary = useMemo(
    () => ({
      active: filteredAppointments.filter((item) => ["scheduled", "active", "confirmed"].includes(normalizeStatus(item.status))).length,
      cancelled: filteredAppointments.filter((item) => ["cancelled", "canceled"].includes(normalizeStatus(item.status))).length,
      completed: filteredAppointments.filter((item) => ["completed", "done"].includes(normalizeStatus(item.status))).length,
    }),
    [filteredAppointments]
  );

  const needsProfileCompletion = Boolean(
    sessionStore.isLoggedIn &&
      ["PATIENT", "DOCTOR"].includes(currentRole) &&
      sessionStore.userId &&
      ((currentRole === "PATIENT" && !currentPatient) || (currentRole === "DOCTOR" && !currentDoctor))
  );

  const selectedDoctor = visibleDoctors.find((doctor) => doctor.id === appointmentForm.doctorId) ?? null;
  const selectedDoctorSpecialty = visibleSpecialties.find(
    (specialty) => specialty.id === selectedDoctor?.specialtyId
  );

  useEffect(() => {
    setSection(navItems[0]?.key ?? "overview");
  }, [navItems]);

  useEffect(() => {
    const doctorFromRole = currentRole === "DOCTOR" ? currentDoctor : null;

    setDoctorForm((previous) => ({
      ...previous,
      name: doctorFromRole?.name ?? previous.name,
      phone: doctorFromRole?.phone ?? previous.phone,
      specialtyId: doctorFromRole?.specialtyId ?? previous.specialtyId,
    }));
  }, [currentDoctor, currentRole]);

  useEffect(() => {
    const patientFromRole = currentRole === "PATIENT" ? currentPatient : null;

    setPatientForm((previous) => ({
      ...previous,
      name: patientFromRole?.name ?? previous.name,
      phone: patientFromRole?.phone ?? previous.phone,
      birthDate: patientFromRole?.birthDate?.slice(0, 10) ?? previous.birthDate,
    }));
  }, [currentPatient, currentRole]);

  useEffect(() => {
    const isLoggedIn = sessionStore.isLoggedIn;

    if (!isLoggedIn) {
      setDoctors([]);
      setPatients([]);
      setSpecialties([]);
      setAppointments([]);
      setSchedules([]);
      setPageError("");
      setPageMessage("");
      return;
    }

    const loadDashboardData = async () => {
      setLoading(true);
      setPageError("");

      try {
        const [doctorData, patientData, specialtyData, appointmentData, scheduleData] = await Promise.all([
          doctorRepository.getAll(),
          patientRepository.getAll(),
          specialtyRepository.getAll(),
          appointmentRepository.getAll(),
          doctorScheduleRepository.getAll(),
        ]);

        setDoctors(doctorData);
        setPatients(patientData);
        setSpecialties(specialtyData);
        setAppointments(appointmentData);
        setSchedules(scheduleData);
      } catch (error) {
        setPageError(error instanceof Error ? error.message : "No se pudo cargar el panel.");
      } finally {
        setLoading(false);
      }
    };

    void loadDashboardData();
  }, [appointmentRepository, doctorRepository, doctorScheduleRepository, patientRepository, specialtyRepository]);

  const refreshAll = async (successMessage?: string) => {
    if (!sessionStore.isLoggedIn) {
      return;
    }

    setLoading(true);
    setPageError("");

    try {
      const [doctorData, patientData, specialtyData, appointmentData, scheduleData] = await Promise.all([
        doctorRepository.getAll(),
        patientRepository.getAll(),
        specialtyRepository.getAll(),
        appointmentRepository.getAll(),
        doctorScheduleRepository.getAll(),
      ]);

      setDoctors(doctorData);
      setPatients(patientData);
      setSpecialties(specialtyData);
      setAppointments(appointmentData);
      setSchedules(scheduleData);

      if (successMessage) {
        setPageMessage(successMessage);
      }
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "No se pudo actualizar la información.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatientProfile = async () => {
    try {
      if (!sessionStore.userId) {
        setPageError("No se pudo identificar el usuario autenticado para completar el perfil del paciente.");
        return;
      }

      if (!patientForm.name.trim()) {
        setPageError("El nombre del paciente es obligatorio.");
        return;
      }

      setPageError("");
      await patientRepository.create({
        userId: sessionStore.userId,
        name: patientForm.name.trim(),
        birthDate: patientForm.birthDate || undefined,
        phone: patientForm.phone.trim() || undefined,
      });
      await refreshAll("Perfil de paciente completado correctamente.");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "No se pudo completar el perfil del paciente.");
    }
  };

  const handleCreateDoctorProfile = async () => {
    try {
      if (!sessionStore.userId) {
        setPageError("No se pudo identificar el usuario autenticado para completar el perfil del doctor.");
        return;
      }

      if (!doctorForm.name.trim() || !doctorForm.specialtyId) {
        setPageError("Debes indicar el nombre y seleccionar una especialidad.");
        return;
      }

      setPageError("");
      await doctorRepository.create({
        userId: sessionStore.userId,
        specialtyId: doctorForm.specialtyId,
        name: doctorForm.name.trim(),
        phone: doctorForm.phone.trim() || undefined,
      });
      await refreshAll("Perfil de doctor completado correctamente.");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "No se pudo completar el perfil del doctor.");
    }
  };

  const handleCreateSpecialty = async () => {
    try {
      if (!specialtyForm.name.trim()) {
        setPageError("Debes escribir el nombre de la especialidad.");
        return;
      }

      const duration = Number(specialtyForm.appointmentDurationMinutes);
      if (Number.isNaN(duration) || duration < 5 || duration > 240) {
        setPageError("La duración de la cita debe estar entre 5 y 240 minutos.");
        return;
      }

      await specialtyRepository.create({
        name: specialtyForm.name.trim(),
        appointmentDurationMinutes: duration,
      });

      setSpecialtyForm({ name: "", appointmentDurationMinutes: "30" });
      await refreshAll("Especialidad registrada correctamente.");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "No se pudo registrar la especialidad.");
    }
  };

  const handleCreateSchedule = async () => {
    try {
      if (!currentDoctor) {
        setPageError("Primero debes completar el perfil del doctor.");
        return;
      }

      await doctorScheduleRepository.create({
        doctorId: currentDoctor.id,
        dayOfWeek: Number(scheduleForm.dayOfWeek),
        startTime: `${scheduleForm.startTime}:00`,
        endTime: `${scheduleForm.endTime}:00`,
      });

      await refreshAll("Horario laboral guardado correctamente.");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "No se pudo guardar el horario laboral.");
    }
  };

  const handleCreateAppointment = async () => {
    try {
      if (!currentPatient) {
        setPageError("Primero debes completar el perfil del paciente.");
        return;
      }

      if (!appointmentForm.doctorId) {
        setPageError("Selecciona un doctor para agendar la cita.");
        return;
      }

      const startDate = new Date(appointmentForm.startDateTime);
      const duration = selectedDoctorSpecialty?.appointmentDurationMinutes ?? 30;
      const endDate = new Date(startDate.getTime() + duration * 60000);

      await appointmentRepository.create({
        doctorId: appointmentForm.doctorId,
        patientId: currentPatient.id,
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
        durationMinutes: duration,
        reason: appointmentForm.reason.trim() || undefined,
        status: "Scheduled",
        cancellationReason: undefined,
      });

      setAppointmentForm({
        doctorId: "",
        startDateTime: toDateTimeLocalValue(new Date(Date.now() + 3600000)),
        reason: "",
      });
      await refreshAll("Cita agendada correctamente.");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "No se pudo agendar la cita.");
    }
  };

  const handleCancelAppointment = async (appointment: AppointmentEntity) => {
    try {
      await appointmentRepository.update(
        appointment.id,
        buildAppointmentUpdate(appointment, {
          status: "Cancelled",
          cancellationReason: "Cancelada desde el portal web.",
        })
      );

      await refreshAll("La cita fue cancelada correctamente.");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "No se pudo cancelar la cita.");
    }
  };

  const handleCompleteAppointment = async (appointment: AppointmentEntity) => {
    try {
      await appointmentRepository.update(
        appointment.id,
        buildAppointmentUpdate(appointment, {
          status: "Completed",
        })
      );

      await refreshAll("La cita fue marcada como completada.");
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "No se pudo actualizar la cita.");
    }
  };

  const renderOverview = () => (
    <Grid container spacing={2.5}>
      {[
        { label: currentRole === "ADMIN" ? "Pacientes" : "Citas activas", value: currentRole === "ADMIN" ? patients.length : appointmentSummary.active, icon: <GroupsIcon /> },
        { label: currentRole === "ADMIN" ? "Doctores" : "Citas canceladas", value: currentRole === "ADMIN" ? doctors.length : appointmentSummary.cancelled, icon: <MedicalServicesIcon /> },
        { label: currentRole === "DOCTOR" ? "Bloques de horario" : currentRole === "PATIENT" ? "Citas completadas" : "Especialidades", value: currentRole === "DOCTOR" ? filteredSchedules.length : currentRole === "PATIENT" ? appointmentSummary.completed : specialties.length, icon: <TodayIcon /> },
      ].map((item) => (
        <Grid key={item.label} size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 4, height: "100%" }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary">{item.label}</Typography>
                  <Typography variant="h4" fontWeight={900} sx={{ mt: 1 }}>
                    {item.value}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>{item.icon}</Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}

      <Grid size={{ xs: 12, md: 8 }}>
        <Card sx={{ borderRadius: 4, height: "100%" }}>
          <CardContent>
            <Typography variant="h6" fontWeight={800} gutterBottom>
              Flujo principal del rol
            </Typography>
            <Stack spacing={1.5}>
              {currentRole === "ADMIN" ? (
                <>
                  <Alert severity="info">El administrador puede revisar pacientes, doctores, citas y crear especialidades cuando sean necesarias.</Alert>
                  <Typography color="text.secondary">Usa la navegación lateral para ir al dashboard de pacientes, doctores o especialidades.</Typography>
                </>
              ) : null}
              {currentRole === "PATIENT" ? (
                <>
                  <Alert severity="info">Busca doctores activos, revisa su especialidad y agenda una cita usando la duración configurada por especialidad.</Alert>
                  <Typography color="text.secondary">También podrás revisar tus citas activas, canceladas y completadas desde el calendario personal.</Typography>
                </>
              ) : null}
              {currentRole === "DOCTOR" ? (
                <>
                  <Alert severity="info">Organiza tu jornada definiendo el horario laboral por día y controla el estado de tus citas.</Alert>
                  <Typography color="text.secondary">Marca citas completadas y revisa tu calendario para ordenar el día de trabajo.</Typography>
                </>
              ) : null}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card sx={{ borderRadius: 4, height: "100%" }}>
          <CardContent>
            <Typography variant="h6" fontWeight={800} gutterBottom>
              Estados de citas
            </Typography>
            <Stack spacing={1.25}>
              <Chip label={`Activas: ${appointmentSummary.active}`} color="success" />
              <Chip label={`Canceladas: ${appointmentSummary.cancelled}`} color="error" />
              <Chip label={`Completadas: ${appointmentSummary.completed}`} color="warning" />
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderProfileCompletion = () => {
    if (!needsProfileCompletion) {
      return null;
    }

    return (
      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent>
          <Stack spacing={2.5}>
            <Alert severity="warning">
              Tu usuario tiene rol {currentRole}, pero todavía no existe el registro asociado. Completa este paso para continuar.
            </Alert>

            {currentRole === "PATIENT" ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Nombre completo"
                    value={patientForm.name}
                    onChange={(event) => setPatientForm((prev) => ({ ...prev, name: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha de nacimiento"
                    InputLabelProps={{ shrink: true }}
                    value={patientForm.birthDate}
                    onChange={(event) => setPatientForm((prev) => ({ ...prev, birthDate: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    value={patientForm.phone}
                    onChange={(event) => setPatientForm((prev) => ({ ...prev, phone: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button variant="contained" onClick={() => void handleCreatePatientProfile()}>
                    Finalizar registro de paciente
                  </Button>
                </Grid>
              </Grid>
            ) : null}

            {currentRole === "DOCTOR" ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Nombre profesional"
                    value={doctorForm.name}
                    onChange={(event) => setDoctorForm((prev) => ({ ...prev, name: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Especialidad</InputLabel>
                    <Select
                      label="Especialidad"
                      value={doctorForm.specialtyId}
                      onChange={(event) => setDoctorForm((prev) => ({ ...prev, specialtyId: event.target.value }))}
                    >
                      {visibleSpecialties.map((specialty) => (
                        <MenuItem key={specialty.id} value={specialty.id}>
                          {specialty.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    value={doctorForm.phone}
                    onChange={(event) => setDoctorForm((prev) => ({ ...prev, phone: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button variant="contained" onClick={() => void handleCreateDoctorProfile()}>
                    Finalizar registro de doctor
                  </Button>
                </Grid>
              </Grid>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  const renderPatientsSection = () => (
    <Stack spacing={2}>
      {patients.length ? (
        patients.map((patient) => (
          <Card key={patient.id} variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5}>
                <Box>
                  <Typography variant="h6" fontWeight={800}>{patient.name}</Typography>
                  <Typography color="text.secondary">{patient.userEmail}</Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={patient.isActive ? "Activo" : "Inactivo"} color={patient.isActive ? "success" : "default"} />
                  {patient.phone ? <Chip label={`Tel: ${patient.phone}`} variant="outlined" /> : null}
                  {patient.birthDate ? <Chip label={`Nacimiento: ${patient.birthDate.slice(0, 10)}`} variant="outlined" /> : null}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))
      ) : (
        <Alert severity="info">No hay pacientes registrados todavía.</Alert>
      )}
    </Stack>
  );

  const renderDoctorsSection = () => (
    <Stack spacing={2}>
      {visibleDoctors.length ? (
        visibleDoctors.map((doctor) => (
          <Card key={doctor.id} variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5}>
                <Box>
                  <Typography variant="h6" fontWeight={800}>{doctor.name}</Typography>
                  <Typography color="text.secondary">{doctor.userEmail}</Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={doctor.specialtyName} color="primary" />
                  {doctor.phone ? <Chip label={`Tel: ${doctor.phone}`} variant="outlined" /> : null}
                  <Chip label={doctor.isActive ? "Activo" : "Inactivo"} color={doctor.isActive ? "success" : "default"} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))
      ) : (
        <Alert severity="info">No hay doctores activos disponibles.</Alert>
      )}
    </Stack>
  );

  const renderSpecialtiesSection = () => (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Card sx={{ borderRadius: 4 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={800}>Registrar especialidad</Typography>
              <Alert severity="info">Solo el administrador debe crear nuevas especialidades cuando hagan falta.</Alert>
              <TextField
                fullWidth
                label="Nombre de la especialidad"
                value={specialtyForm.name}
                onChange={(event) => setSpecialtyForm((prev) => ({ ...prev, name: event.target.value }))}
              />
              <TextField
                fullWidth
                label="Duración de cita (minutos)"
                type="number"
                inputProps={{ min: 5, max: 240 }}
                value={specialtyForm.appointmentDurationMinutes}
                onChange={(event) => setSpecialtyForm((prev) => ({ ...prev, appointmentDurationMinutes: event.target.value }))}
              />
              <Button variant="contained" onClick={() => void handleCreateSpecialty()}>
                Guardar especialidad
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Stack spacing={2}>
          {specialties.length ? (
            specialties.map((specialty) => (
              <Card key={specialty.id} variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                    <Box>
                      <Typography variant="h6" fontWeight={800}>{specialty.name}</Typography>
                      <Typography color="text.secondary">Duración configurada: {specialty.appointmentDurationMinutes} minutos.</Typography>
                    </Box>
                    <Chip label={specialty.isActive ? "Activa" : "Inactiva"} color={specialty.isActive ? "success" : "default"} />
                  </Stack>
                </CardContent>
              </Card>
            ))
          ) : (
            <Alert severity="info">Todavía no existen especialidades registradas.</Alert>
          )}
        </Stack>
      </Grid>
    </Grid>
  );

  const renderFindDoctorsSection = () => (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Card sx={{ borderRadius: 4 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={800}>Agendar una cita</Typography>
              <Alert severity="info">El sistema usa la duración de la especialidad del doctor para calcular la hora de finalización.</Alert>
              <FormControl fullWidth>
                <InputLabel>Doctor</InputLabel>
                <Select
                  label="Doctor"
                  value={appointmentForm.doctorId}
                  onChange={(event) => setAppointmentForm((prev) => ({ ...prev, doctorId: event.target.value }))}
                >
                  {visibleDoctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {doctor.name} · {doctor.specialtyName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                type="datetime-local"
                label="Inicio de la cita"
                InputLabelProps={{ shrink: true }}
                value={appointmentForm.startDateTime}
                onChange={(event) => setAppointmentForm((prev) => ({ ...prev, startDateTime: event.target.value }))}
              />
              <TextField
                fullWidth
                label="Motivo"
                multiline
                minRows={3}
                value={appointmentForm.reason}
                onChange={(event) => setAppointmentForm((prev) => ({ ...prev, reason: event.target.value }))}
              />
              <TextField
                fullWidth
                label="Duración estimada"
                value={selectedDoctorSpecialty ? `${selectedDoctorSpecialty.appointmentDurationMinutes} minutos` : "Selecciona un doctor"}
                InputProps={{ readOnly: true }}
              />
              <Button variant="contained" onClick={() => void handleCreateAppointment()}>
                Confirmar cita
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 7 }}>
        <Stack spacing={2}>
          {visibleDoctors.length ? (
            visibleDoctors.map((doctor) => (
              <Card key={doctor.id} variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                      <Box>
                        <Typography variant="h6" fontWeight={800}>{doctor.name}</Typography>
                        <Typography color="text.secondary">{doctor.userEmail}</Typography>
                      </Box>
                      <Chip label={doctor.specialtyName} color="primary" />
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {doctor.phone ? <Chip label={`Tel: ${doctor.phone}`} variant="outlined" /> : null}
                      <Chip label={doctor.isActive ? "Disponible" : "No disponible"} color={doctor.isActive ? "success" : "default"} />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))
          ) : (
            <Alert severity="info">Aún no hay doctores disponibles para agendar.</Alert>
          )}
        </Stack>
      </Grid>
    </Grid>
  );

  const renderScheduleSection = () => (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Card sx={{ borderRadius: 4 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={800}>Configurar horario laboral</Typography>
              <Alert severity="info">Define el día de la semana y el rango horario disponible para atender citas.</Alert>
              <FormControl fullWidth>
                <InputLabel>Día laboral</InputLabel>
                <Select
                  label="Día laboral"
                  value={scheduleForm.dayOfWeek}
                  onChange={(event) => setScheduleForm((prev) => ({ ...prev, dayOfWeek: event.target.value }))}
                >
                  {dayOptions.map((day) => (
                    <MenuItem key={day.value} value={String(day.value)}>
                      {day.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                type="time"
                label="Hora de inicio"
                InputLabelProps={{ shrink: true }}
                value={scheduleForm.startTime}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, startTime: event.target.value }))}
              />
              <TextField
                fullWidth
                type="time"
                label="Hora de fin"
                InputLabelProps={{ shrink: true }}
                value={scheduleForm.endTime}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, endTime: event.target.value }))}
              />
              <Button variant="contained" onClick={() => void handleCreateSchedule()}>
                Guardar horario
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Stack spacing={2}>
          {filteredSchedules.length ? (
            filteredSchedules.map((schedule) => (
              <Card key={schedule.id} variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                    <Box>
                      <Typography variant="h6" fontWeight={800}>{schedule.doctorName}</Typography>
                      <Typography color="text.secondary">
                        {dayOptions.find((day) => day.value === schedule.dayOfWeek)?.label} · {schedule.startTime.slice(0, 5)} - {schedule.endTime.slice(0, 5)}
                      </Typography>
                    </Box>
                    <Chip label={schedule.isActive ? "Activo" : "Inactivo"} color={schedule.isActive ? "success" : "default"} />
                  </Stack>
                </CardContent>
              </Card>
            ))
          ) : (
            <Alert severity="info">Todavía no has registrado bloques de horario laboral.</Alert>
          )}
        </Stack>
      </Grid>
    </Grid>
  );

  const renderCalendarSection = () => {
    const sortedAppointments = [...filteredAppointments].sort(
      (left, right) => new Date(left.startDateTime).getTime() - new Date(right.startDateTime).getTime()
    );

    return (
      <Stack spacing={2}>
        <Alert severity="info">Consulta tus citas activas, canceladas y completadas desde un solo calendario operativo.</Alert>
        <AppointmentList
          appointments={sortedAppointments}
          emptyText="No hay citas para mostrar en el calendario." 
          onCancel={currentRole === "PATIENT" ? (appointment) => void handleCancelAppointment(appointment) : undefined}
          onComplete={currentRole === "DOCTOR" ? (appointment) => void handleCompleteAppointment(appointment) : undefined}
        />
      </Stack>
    );
  };

  const renderAppointmentsSection = () => (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip label={`Activas: ${appointmentSummary.active}`} color="success" />
        <Chip label={`Canceladas: ${appointmentSummary.cancelled}`} color="error" />
        <Chip label={`Completadas: ${appointmentSummary.completed}`} color="warning" />
      </Stack>
      <AppointmentList
        appointments={filteredAppointments}
        emptyText="No hay citas registradas para este rol todavía."
        onCancel={currentRole === "PATIENT" ? (appointment) => void handleCancelAppointment(appointment) : undefined}
        onComplete={currentRole === "DOCTOR" ? (appointment) => void handleCompleteAppointment(appointment) : undefined}
      />
    </Stack>
  );

  const renderSection = () => {
    if (!sessionStore.isLoggedIn) {
      return (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 5, background: "linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)", color: "white" }}>
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={2.5}>
                  <Typography variant="h3" fontWeight={900}>Sistema de citas por rol</Typography>
                  <Typography>
                    El sistema detecta si el usuario es ADMIN, PATIENT o DOCTOR y muestra su dashboard correspondiente para administrar la clínica, buscar doctores o planificar el horario laboral.
                  </Typography>
                  <Button variant="contained" color="secondary" startIcon={<LoginIcon />} onClick={() => setLoginOpen(true)} sx={{ alignSelf: "flex-start" }}>
                    Iniciar sesión para continuar
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2}>
              {[
                { title: "ADMIN", text: "Visualiza pacientes, doctores y especialidades desde un tablero operativo." },
                { title: "PATIENT", text: "Busca doctores, agenda citas y revisa estados de tus consultas." },
                { title: "DOCTOR", text: "Organiza tu día, crea horarios laborales y controla tus citas activas." },
              ].map((item) => (
                <Card key={item.title} sx={{ borderRadius: 4 }}>
                  <CardContent>
                    <Chip label={item.title} color="primary" sx={{ mb: 1.5 }} />
                    <Typography fontWeight={800}>{item.title}</Typography>
                    <Typography color="text.secondary">{item.text}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Grid>
        </Grid>
      );
    }

    if (needsProfileCompletion && section !== "overview") {
      return renderProfileCompletion();
    }

    switch (section) {
      case "patients":
        return renderPatientsSection();
      case "doctors":
        return renderDoctorsSection();
      case "specialties":
        return renderSpecialtiesSection();
      case "find-doctors":
        return renderFindDoctorsSection();
      case "work-schedule":
        return renderScheduleSection();
      case "appointments":
        return renderAppointmentsSection();
      case "my-calendar":
        return renderCalendarSection();
      case "overview":
      default:
        return (
          <>
            {renderProfileCompletion()}
            {renderOverview()}
          </>
        );
    }
  };

  const drawerContent = (
    <Box sx={{ height: "100%", bgcolor: "#0f172a", color: "white", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: "primary.main" }}>
            <LocalHospitalIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={900}>Clinic Scheduling</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>Portal inteligente por roles</Typography>
          </Box>
        </Stack>
      </Box>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
      <Box sx={{ p: 2 }}>
        <Card sx={{ borderRadius: 4, bgcolor: "rgba(255,255,255,0.08)", color: "white" }}>
          <CardContent>
            <Typography fontWeight={800}>{sessionStore.isLoggedIn ? sessionStore.email : "Invitado"}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
              {sessionStore.isLoggedIn ? `Rol detectado: ${currentRole}` : "Inicia sesión para cargar tu panel personalizado."}
            </Typography>
            {sessionStore.isLoggedIn ? (
              <Button fullWidth variant="outlined" color="inherit" startIcon={<LogoutIcon />} onClick={sessionStore.clearSession}>
                Cerrar sesión
              </Button>
            ) : (
              <Button fullWidth variant="contained" startIcon={<LoginIcon />} onClick={() => setLoginOpen(true)}>
                Iniciar sesión
              </Button>
            )}
          </CardContent>
        </Card>
      </Box>
      <List sx={{ px: 1.5 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.key}
            selected={section === item.key}
            onClick={() => {
              setSection(item.key);
              setMobileOpen(false);
            }}
            sx={{
              borderRadius: 3,
              mb: 1,
              color: "white",
              "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.16)" },
              "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ mt: "auto", p: 2 }}>
        <Stack spacing={1.25}>
          <Chip icon={<NotificationsActiveIcon />} label={`Activas: ${appointmentSummary.active}`} color="success" />
          <Chip icon={<EventAvailableIcon />} label={`Especialidades: ${specialties.length}`} color="primary" />
          <Chip icon={<GroupIcon />} label={`Usuarios clínicos: ${doctors.length + patients.length}`} />
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f3f6fb" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "rgba(255,255,255,0.9)",
          color: "#0f172a",
          borderBottom: "1px solid #dbe2ea",
          backdropFilter: "blur(10px)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", gap: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton onClick={() => setMobileOpen((prev) => !prev)} sx={{ display: { sm: "none" } }}>
              <MenuIcon />
            </IconButton>
            <Box>
              <Typography variant="h6" fontWeight={900}>{currentCopy.title}</Typography>
              <Typography variant="body2" color="text.secondary">{sessionStore.isLoggedIn ? currentCopy.subtitle : "Accede para obtener un dashboard adaptado a tu rol."}</Typography>
            </Box>
          </Stack>
          {sessionStore.isLoggedIn ? (
            <Button variant="outlined" startIcon={<LogoutIcon />} onClick={sessionStore.clearSession}>
              Cerrar sesión
            </Button>
          ) : (
            <Button variant="outlined" startIcon={<LoginIcon />} onClick={() => setLoginOpen(true)}>
              Iniciar sesión
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth, border: "none" },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": { width: drawerWidth, border: "none" },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />

        <Stack spacing={3}>
          {sessionStore.isLoggedIn && !sessionStore.userId && currentRole !== "ADMIN" ? (
            <Alert severity="warning">No se pudo extraer el UserId del token. Verifica que el JWT incluya el identificador del usuario para completar y relacionar perfiles.</Alert>
          ) : null}

          {pageMessage ? <Alert severity="success" onClose={() => setPageMessage("")}>{pageMessage}</Alert> : null}
          {pageError ? <Alert severity="error" onClose={() => setPageError("")}>{pageError}</Alert> : null}

          {loading ? (
            <Stack alignItems="center" py={6} spacing={2}>
              <CircularProgress />
              <Typography color="text.secondary">Cargando información del panel...</Typography>
            </Stack>
          ) : (
            renderSection()
          )}
        </Stack>
      </Box>

      <LoginView open={loginOpen} onClose={() => setLoginOpen(false)} />
    </Box>
  );
});
