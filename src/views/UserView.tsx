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
  TextField,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import type { DoctorEntity } from "../common/entities/DoctorEntity";
import type { PatientEntity } from "../common/entities/PatientEntity";
import type { SpecialtyEntity } from "../common/entities/SpecialtyEntity";
import type { UserViewModel } from "../viewmodels/UserViewModel";

type UserViewMode = "profile" | "patients" | "doctors" | "specialties";

type UserViewProps = {
  mode: UserViewMode;
  currentRole: string;
  needsProfileCompletion: boolean;
  currentUserId: string;
  userViewModel: UserViewModel;
  patients: PatientEntity[];
  doctors: DoctorEntity[];
  specialties: SpecialtyEntity[];
  onProfileSaved: (message: string) => Promise<void>;
  onCreateSpecialty?: () => Promise<unknown>;
  specialtyForm?: {
    name: string;
    appointmentDurationMinutes: string;
    setName: (value: string) => void;
    setDuration: (value: string) => void;
  };
};

export const UserView = observer(function UserView({
  mode,
  currentRole,
  needsProfileCompletion,
  currentUserId,
  userViewModel,
  patients,
  doctors,
  specialties,
  onProfileSaved,
  onCreateSpecialty,
  specialtyForm,
}: UserViewProps) {
  if (mode === "profile") {
    if (!needsProfileCompletion) {
      return <Alert severity="success">Tu perfil ya está completo para operar en el sistema.</Alert>;
    }

    return (
      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack spacing={2.5}>
            <Alert severity="warning">
              Tu usuario tiene rol {currentRole}, pero todavía no existe el registro asociado. Completa este paso para continuar.
            </Alert>

            {userViewModel.profileErrorMessage ? (
              <Alert severity="error">{userViewModel.profileErrorMessage}</Alert>
            ) : null}

            {currentRole === "PATIENT" ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Nombre completo"
                    value={userViewModel.patientForm.name}
                    onChange={(event) => userViewModel.setPatientForm("name", event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha de nacimiento"
                    InputLabelProps={{ shrink: true }}
                    value={userViewModel.patientForm.birthDate}
                    onChange={(event) => userViewModel.setPatientForm("birthDate", event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    value={userViewModel.patientForm.phone}
                    onChange={(event) => userViewModel.setPatientForm("phone", event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    variant="contained"
                    onClick={async () => {
                      const success = await userViewModel.createPatientProfile(currentUserId);
                      if (success) {
                        await onProfileSaved("Perfil de paciente completado correctamente.");
                      }
                    }}
                  >
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
                    value={userViewModel.doctorForm.name}
                    onChange={(event) => userViewModel.setDoctorForm("name", event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Especialidad</InputLabel>
                    <Select
                      label="Especialidad"
                      value={userViewModel.doctorForm.specialtyId}
                      onChange={(event) => userViewModel.setDoctorForm("specialtyId", event.target.value)}
                    >
                      {specialties.filter((specialty) => specialty.isActive).map((specialty) => (
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
                    value={userViewModel.doctorForm.phone}
                    onChange={(event) => userViewModel.setDoctorForm("phone", event.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    variant="contained"
                    onClick={async () => {
                      const success = await userViewModel.createDoctorProfile(currentUserId);
                      if (success) {
                        await onProfileSaved("Perfil de doctor completado correctamente.");
                      }
                    }}
                  >
                    Finalizar registro de doctor
                  </Button>
                </Grid>
              </Grid>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (mode === "patients") {
    return patients.length ? (
      <Stack spacing={2}>
        {patients.map((patient) => (
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
        ))}
      </Stack>
    ) : (
      <Alert severity="info">No hay pacientes registrados todavía.</Alert>
    );
  }

  if (mode === "doctors") {
    const visibleDoctors = doctors.filter((doctor) => doctor.isActive);
    return visibleDoctors.length ? (
      <Stack spacing={2}>
        {visibleDoctors.map((doctor) => (
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
        ))}
      </Stack>
    ) : (
      <Alert severity="info">No hay doctores activos disponibles.</Alert>
    );
  }

  return (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Card sx={{ borderRadius: 4 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={800}>Registrar especialidad</Typography>
              <Alert severity="info">Esta vista separa la gestión de usuarios y catálogos básicos del resto del calendario.</Alert>
              <TextField
                fullWidth
                label="Nombre de la especialidad"
                value={specialtyForm?.name ?? ""}
                onChange={(event) => specialtyForm?.setName(event.target.value)}
              />
              <TextField
                fullWidth
                label="Duración de cita (minutos)"
                type="number"
                inputProps={{ min: 5, max: 240 }}
                value={specialtyForm?.appointmentDurationMinutes ?? "30"}
                onChange={(event) => specialtyForm?.setDuration(event.target.value)}
              />
              <Button variant="contained" onClick={() => void onCreateSpecialty?.()}>
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
                      <Typography color="text.secondary">
                        Duración configurada: {specialty.appointmentDurationMinutes} minutos.
                      </Typography>
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
});
