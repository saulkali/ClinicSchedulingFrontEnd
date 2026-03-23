import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  EventAvailable as EventAvailableIcon,
} from "@mui/icons-material";
import { formatDateLong, formatDateTime, formatWeekday } from "../common/utils/date";
import type { AppointmentsViewModel } from "../viewmodels/AppointmentsViewModel";

const weekdayHeaders = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

type AppointmentsViewProps = {
  viewModel: AppointmentsViewModel;
};

export const AppointmentsView = observer(function AppointmentsView({ viewModel }: AppointmentsViewProps) {
  useEffect(() => {
    void viewModel.loadData();
  }, [viewModel]);

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4" fontWeight={800}>
          AppointmentsView
        </Typography>
        <Typography color="text.secondary">
          Vista especializada para visualizar y agendar citas con calendario Material UI y disponibilidad por doctor.
        </Typography>
      </Stack>

      {viewModel.errorMessage ? <Alert severity="warning">{viewModel.errorMessage}</Alert> : null}
      {viewModel.helperMessage ? <Alert severity="info">{viewModel.helperMessage}</Alert> : null}
      {viewModel.successMessage ? <Alert severity="success">{viewModel.successMessage}</Alert> : null}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Stack spacing={3}>
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Calendario de citas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Solo puedes seleccionar días laborales futuros del doctor.
                    </Typography>
                  </Box>

                  <TextField
                    select
                    label="Doctor"
                    value={viewModel.selectedDoctorId}
                    onChange={(event) => viewModel.setSelectedDoctorId(event.target.value)}
                    sx={{ minWidth: 260 }}
                  >
                    {viewModel.doctors.map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        {doctor.name} · {doctor.specialty}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" startIcon={<ChevronLeftIcon />} onClick={viewModel.previousMonth}>
                      Mes anterior
                    </Button>
                    <Button variant="outlined" endIcon={<ChevronRightIcon />} onClick={viewModel.nextMonth}>
                      Siguiente mes
                    </Button>
                  </Stack>

                  <Typography variant="h6" fontWeight={700}>
                    {viewModel.currentMonth.toLocaleDateString("es-MX", { month: "long", year: "numeric" })}
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                    gap: 1,
                  }}
                >
                  {weekdayHeaders.map((label) => (
                    <Box key={label} sx={{ p: 1, textAlign: "center" }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {label}
                      </Typography>
                    </Box>
                  ))}

                  {viewModel.monthDays.map((day) => {
                    const isInMonth = day.getMonth() === viewModel.currentMonth.getMonth();
                    const isAvailable = viewModel.isDoctorAvailableOn(day);
                    const isSelected = day.toDateString() === viewModel.selectedDate.toDateString();
                    const appointmentsCount = viewModel.getDayAppointmentCount(day);

                    return (
                      <Button
                        key={day.toISOString()}
                        variant={isSelected ? "contained" : "outlined"}
                        disabled={!isAvailable}
                        onClick={() => viewModel.setSelectedDate(day)}
                        sx={{
                          minHeight: 108,
                          borderRadius: 3,
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          flexDirection: "column",
                          p: 1.25,
                          color: isInMonth ? "text.primary" : "text.disabled",
                          bgcolor: isSelected ? "primary.main" : isAvailable ? "background.default" : "action.disabledBackground",
                        }}
                      >
                        <Stack direction="row" width="100%" justifyContent="space-between" alignItems="center">
                          <Typography fontWeight={700}>{day.getDate()}</Typography>
                          {isAvailable ? <EventAvailableIcon fontSize="small" /> : null}
                        </Stack>

                        <Stack width="100%" spacing={0.5} alignItems="flex-start">
                          <Chip
                            size="small"
                            label={isAvailable ? "Laboral" : "No disponible"}
                            color={isAvailable ? "success" : "default"}
                          />
                          {appointmentsCount > 0 ? <Chip size="small" label={`${appointmentsCount} cita(s)`} /> : null}
                        </Stack>
                      </Button>
                    );
                  })}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ borderRadius: 4, mb: 3 }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={700}>
                  Disponibilidad del doctor
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {viewModel.selectedDoctor?.name} · {viewModel.selectedDoctor?.specialty}
                </Typography>
                <Typography variant="body2">Fecha seleccionada: {formatDateLong(viewModel.selectedDate)}</Typography>

                <Divider />

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {viewModel.selectedDoctorSchedules.map((schedule) => (
                    <Chip
                      key={schedule.id}
                      label={`${formatWeekday(schedule.weekday)} · ${schedule.startTime} - ${schedule.endTime}`}
                      color={schedule.weekday === viewModel.selectedDate.getDay() ? "primary" : "default"}
                    />
                  ))}
                </Stack>

                <TextField
                  select
                  label="Horario disponible"
                  value={viewModel.selectedTime}
                  onChange={(event) => viewModel.setSelectedTime(event.target.value)}
                  helperText="Se bloquean horas tomadas y horarios fuera de la jornada del doctor."
                  fullWidth
                >
                  {viewModel.availableTimes.length > 0 ? (
                    viewModel.availableTimes.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>
                      Sin horarios disponibles
                    </MenuItem>
                  )}
                </TextField>

                <TextField
                  label="Paciente"
                  value={viewModel.patientName}
                  onChange={(event) => viewModel.setPatientName(event.target.value)}
                  fullWidth
                />
                <TextField
                  label="Correo del paciente"
                  value={viewModel.patientEmail}
                  onChange={(event) => viewModel.setPatientEmail(event.target.value)}
                  fullWidth
                />
                <TextField
                  label="Notas"
                  value={viewModel.notes}
                  onChange={(event) => viewModel.setNotes(event.target.value)}
                  multiline
                  minRows={3}
                  fullWidth
                />

                <Button variant="contained" onClick={() => void viewModel.createAppointment()} disabled={viewModel.isSaving}>
                  Agendar cita
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={700}>
                  Citas del día
                </Typography>

                {viewModel.appointmentsForSelectedDate.length === 0 ? (
                  <Alert severity="info">No hay citas registradas para la fecha seleccionada.</Alert>
                ) : (
                  viewModel.appointmentsForSelectedDate.map((appointment) => (
                    <Box
                      key={appointment.id}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Stack spacing={1}>
                        <Typography fontWeight={700}>{appointment.patientName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {appointment.doctorName} · {appointment.specialty}
                        </Typography>
                        <Typography variant="body2">{formatDateTime(appointment.startsAt)}</Typography>
                        <Stack direction="row" spacing={1}>
                          <Chip size="small" label={appointment.status} color="primary" />
                          <Chip size="small" label={appointment.patientEmail} variant="outlined" />
                        </Stack>
                      </Stack>
                    </Box>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
});
