import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  TextField,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import type { AppointmentEntity } from "../common/entities/AppointmentEntity";
import type { AppointmentsViewModel } from "../viewmodels/AppointmentsViewModel";
import { dayOptions, formatDateTime, getStatusColor } from "../viewmodels/AppointmentsViewModel";
import { CancellationReasonDialog } from "./components/CancellationReasonDialog";
import { MaterialCalendar } from "./components/MaterialCalendar";

type AppointmentsViewMode = "appointments" | "calendar" | "booking" | "schedule";

type AppointmentsViewProps = {
  mode: AppointmentsViewMode;
  viewModel: AppointmentsViewModel;
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
        const normalizedStatus = appointment.status.trim().toLowerCase();
        const canCancel = onCancel && !["cancelled", "canceled", "completed", "done"].includes(normalizedStatus);
        const canComplete = onComplete && ["scheduled", "active", "confirmed"].includes(normalizedStatus);

        return (
          <Card key={appointment.id} variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack spacing={1.5}>
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
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

export const AppointmentsView = observer(function AppointmentsView({ mode, viewModel }: AppointmentsViewProps) {
  const canCancel = viewModel.currentRole === "PATIENT";
  const canComplete = viewModel.currentRole === "DOCTOR";
  const [appointmentToCancel, setAppointmentToCancel] = useState<AppointmentEntity | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");

  const handleOpenCancellationDialog = (appointment: AppointmentEntity) => {
    setAppointmentToCancel(appointment);
    setCancellationReason("");
  };

  const handleCloseCancellationDialog = () => {
    setAppointmentToCancel(null);
    setCancellationReason("");
  };

  const handleConfirmCancellation = async () => {
    if (!appointmentToCancel) {
      return;
    }

    const cancelled = await viewModel.cancelAppointment(
      appointmentToCancel,
      cancellationReason.trim() || undefined
    );

    if (cancelled) {
      handleCloseCancellationDialog();
    }
  };

  if (mode === "appointments") {
    return (
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip label={`Activas: ${viewModel.appointmentSummary.active}`} color="success" />
          <Chip label={`Canceladas: ${viewModel.appointmentSummary.cancelled}`} color="error" />
          <Chip label={`Completadas: ${viewModel.appointmentSummary.completed}`} color="warning" />
        </Stack>
        <AppointmentList
          appointments={viewModel.filteredAppointments}
          emptyText="No hay citas registradas para este rol todavía."
          onCancel={canCancel ? handleOpenCancellationDialog : undefined}
          onComplete={canComplete ? (appointment) => void viewModel.completeAppointment(appointment) : undefined}
        />
        <CancellationReasonDialog
          open={Boolean(appointmentToCancel)}
          reason={cancellationReason}
          onReasonChange={setCancellationReason}
          onConfirm={() => void handleConfirmCancellation()}
          onClose={handleCloseCancellationDialog}
        />
      </Stack>
    );
  }

  if (mode === "schedule") {
    return (
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={800}>Configurar horario laboral</Typography>
                <Alert severity="info">
                  Define el día de la semana y el rango horario disponible para atender citas. Este formulario ahora vive en una vista separada.
                </Alert>
                <FormControl fullWidth>
                  <InputLabel>Día laboral</InputLabel>
                  <Select
                    label="Día laboral"
                    value={viewModel.scheduleForm.dayOfWeek}
                    onChange={(event) => viewModel.setScheduleForm("dayOfWeek", event.target.value)}
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
                  value={viewModel.scheduleForm.startTime}
                  onChange={(event) => viewModel.setScheduleForm("startTime", event.target.value)}
                />
                <TextField
                  fullWidth
                  type="time"
                  label="Hora de fin"
                  InputLabelProps={{ shrink: true }}
                  value={viewModel.scheduleForm.endTime}
                  onChange={(event) => viewModel.setScheduleForm("endTime", event.target.value)}
                />
                <Button variant="contained" onClick={() => void viewModel.createSchedule()}>
                  Guardar horario
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2}>
            {viewModel.filteredSchedules.length ? (
              viewModel.filteredSchedules.map((schedule) => (
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
  }

  if (mode === "booking") {
    const enabledDates = new Set(viewModel.bookingEnabledDates);
    const eventsByDate = viewModel.bookingEnabledDates.reduce<Record<string, { id: string; title: string; color: "primary" }[]>>(
      (accumulator, dateKey) => {
        const date = new Date(`${dateKey}T00:00:00`);
        const jsDay = date.getDay();
        const dayOfWeek = jsDay === 0 ? 7 : jsDay;
        const schedulesForDay = viewModel.selectedDoctorSchedules.filter((schedule) => schedule.dayOfWeek === dayOfWeek);

        accumulator[dateKey] = schedulesForDay.map((schedule) => ({
          id: `${schedule.id}-${dateKey}`,
          title: `${schedule.startTime.slice(0, 5)} - ${schedule.endTime.slice(0, 5)}`,
          color: "primary",
        }));

        return accumulator;
      },
      {}
    );

    if (viewModel.bookingForm.selectedDate && viewModel.availableSlots.length) {
      eventsByDate[viewModel.bookingForm.selectedDate] = [
        ...(eventsByDate[viewModel.bookingForm.selectedDate] ?? []),
        ...viewModel.availableSlots.map((slot, index) => ({
          id: `${slot.startDateTime}-available-${index}`,
          title: `Libre: ${new Date(slot.startDateTime).toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit", hour12: false })}`,
          color: "primary" as const,
        })),
      ];
    }

    return (
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={800}>Agendar una cita</Typography>
                <Alert severity="info">
                  Selecciona el doctor, luego un día laboral en el calendario y finalmente uno de los horarios disponibles.
                </Alert>
                {viewModel.shouldShowCancellationAlert ? (
                  <Alert severity="warning">
                    Este paciente tiene {viewModel.currentPatientCancelledAppointments} cancelaciones acumuladas. Verifica antes de confirmar.
                  </Alert>
                ) : null}
                <FormControl fullWidth>
                  <InputLabel>Doctor</InputLabel>
                  <Select
                    label="Doctor"
                    value={viewModel.bookingForm.doctorId}
                    onChange={(event) => viewModel.setBookingDoctor(event.target.value)}
                  >
                    {viewModel.visibleDoctors.map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        {doctor.name} · {doctor.specialtyName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Especialidad / duración"
                  value={viewModel.selectedDoctorSpecialty ? `${viewModel.selectedDoctorSpecialty.name} · ${viewModel.selectedDoctorSpecialty.appointmentDurationMinutes} min` : "Selecciona un doctor"}
                  InputProps={{ readOnly: true }}
                />

                <Stack spacing={1}>
                  <Typography fontWeight={700}>Horarios disponibles</Typography>
                  {viewModel.availableSlots.length ? (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {viewModel.availableSlots.map((slot) => (
                        <Chip
                          key={slot.startDateTime}
                          label={`${new Date(slot.startDateTime).toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit", hour12: false })} - ${new Date(slot.endDateTime).toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit", hour12: false })}`}
                          clickable
                          color={viewModel.bookingForm.selectedSlot === slot.startDateTime ? "primary" : "default"}
                          onClick={() => viewModel.setBookingSlot(slot.startDateTime)}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Alert severity="warning">
                      {viewModel.bookingForm.doctorId && viewModel.bookingForm.selectedDate
                        ? "No hay horarios disponibles para la fecha seleccionada."
                        : "Selecciona un doctor y un día laboral para cargar horarios disponibles."}
                    </Alert>
                  )}
                </Stack>

                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Motivo"
                  value={viewModel.bookingForm.reason}
                  onChange={(event) => viewModel.setBookingReason(event.target.value)}
                />

                <Button variant="contained" onClick={() => void viewModel.createAppointment()}>
                  Confirmar cita
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <MaterialCalendar
            month={viewModel.calendarMonth}
            selectedDate={viewModel.bookingForm.selectedDate}
            enabledDates={enabledDates}
            eventsByDate={eventsByDate}
            helperText="Calendario para seleccionar el día y consultar disponibilidad del doctor."
            onPreviousMonth={viewModel.goToPreviousMonth}
            onNextMonth={viewModel.goToNextMonth}
            onSelectDate={(dateKey) => viewModel.setBookingDate(dateKey)}
          />
        </Grid>
      </Grid>
    );
  }

  const eventsByDate = Object.entries(viewModel.appointmentDatesMap).reduce<Record<string, { id: string; title: string; color: "success" | "warning" | "error" | "default" }[]>>(
    (accumulator, [dateKey, appointments]) => {
      accumulator[dateKey] = appointments.map((appointment) => ({
        id: appointment.id,
        title: `${new Date(appointment.startDateTime).toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })} ${appointment.patientName}`,
        color: getStatusColor(appointment.status),
      }));
      return accumulator;
    },
    {}
  );

  return (
    <Stack spacing={2}>
      <Alert severity="info">
        Vista de calendario separada para consultar citas en formato tipo Google Calendar usando componentes Material UI.
      </Alert>
      <MaterialCalendar
        month={viewModel.calendarMonth}
        eventsByDate={eventsByDate}
        helperText="Cada día muestra las citas del rol actual y permite una lectura rápida del estado operacional."
        onPreviousMonth={viewModel.goToPreviousMonth}
        onNextMonth={viewModel.goToNextMonth}
      />
      <AppointmentList
        appointments={viewModel.calendarAppointments}
        emptyText="No hay citas para mostrar en el calendario."
        onCancel={canCancel ? handleOpenCancellationDialog : undefined}
        onComplete={canComplete ? (appointment) => void viewModel.completeAppointment(appointment) : undefined}
      />
      <CancellationReasonDialog
        open={Boolean(appointmentToCancel)}
        reason={cancellationReason}
        onReasonChange={setCancellationReason}
        onConfirm={() => void handleConfirmCancellation()}
        onClose={handleCloseCancellationDialog}
      />
    </Stack>
  );
});
