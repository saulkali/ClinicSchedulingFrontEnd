import { useMemo, useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  CssBaseline,
  Stack,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  CalendarMonth as CalendarMonthIcon,
  LocalHospital as LocalHospitalIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import { observer } from "mobx-react-lite";
import { sessionStore } from "../common/session/SessionStore";
import { AppointmentRepository } from "../models/repositories/AppointmentRepository";
import { AuthRepository } from "../models/repositories/AuthRepository";
import { DoctorScheduleRepository } from "../models/repositories/DoctorScheduleRepository";
import { RoleRepository } from "../models/repositories/RoleRepository";
import { UserRepository } from "../models/repositories/UserRepository";
import { AppointmentsViewModel } from "../viewmodels/AppointmentsViewModel";
import { RolesViewModel } from "../viewmodels/RolesViewModel";
import { UserViewModel } from "../viewmodels/UserViewModel";
import { AppointmentsView } from "./AppointmentsView";
import { RolesView } from "./RolesView";
import { UserView } from "./UserView";

export const HomeView = observer(function HomeView() {
  const [tab, setTab] = useState(0);

  const rolesViewModel = useMemo(() => new RolesViewModel(new RoleRepository()), []);
  const userViewModel = useMemo(
    () => new UserViewModel(new AuthRepository(), new UserRepository(), new RoleRepository()),
    []
  );
  const appointmentsViewModel = useMemo(
    () => new AppointmentsViewModel(new AppointmentRepository(), new DoctorScheduleRepository()),
    []
  );

  return (
    <>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "#f4f7fb" }}>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: "#0f172a" }}>
          <Toolbar>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
              <Avatar sx={{ bgcolor: "primary.main" }}>
                <LocalHospitalIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Clinic Scheduling FrontEnd
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Roles, usuarios y citas desacoplados por vista y view model.
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              {sessionStore.isLoggedIn ? (
                <Chip label={`${sessionStore.email} · ${sessionStore.role || "Sesión activa"}`} color="success" />
              ) : (
                <Chip label="Sin sesión iniciada" color="default" />
              )}
              <Button color="inherit" variant="outlined" onClick={sessionStore.clearSession}>
                Limpiar sesión
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Stack spacing={3}>
            <Box
              sx={{
                p: 3,
                borderRadius: 5,
                color: "white",
                background: "linear-gradient(135deg, #1565c0 0%, #0f172a 100%)",
              }}
            >
              <Typography variant="h3" fontWeight={900} gutterBottom>
                Panel clínico modular
              </Typography>
              <Typography sx={{ maxWidth: 960, opacity: 0.92 }}>
                Separamos la lógica de RoleRepository, UserRepository y AuthRepository hacia view models dedicados,
                y movimos cada pestaña a su propia vista. Además, AppointmentsView ahora usa un calendario tipo agenda
                Material UI para visualizar citas y agendar solo dentro de la disponibilidad laboral de cada doctor.
              </Typography>
            </Box>

            <Box sx={{ bgcolor: "background.paper", borderRadius: 4, p: 1 }}>
              <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto">
                <Tab icon={<SecurityIcon />} iconPosition="start" label="RolesView" />
                <Tab icon={<PeopleIcon />} iconPosition="start" label="UserView" />
                <Tab icon={<CalendarMonthIcon />} iconPosition="start" label="AppointmentsView" />
              </Tabs>
            </Box>

            <Box>
              {tab === 0 ? <RolesView viewModel={rolesViewModel} /> : null}
              {tab === 1 ? <UserView viewModel={userViewModel} /> : null}
              {tab === 2 ? <AppointmentsView viewModel={appointmentsViewModel} /> : null}
            </Box>
          </Stack>
        </Container>
      </Box>
    </>
  );
});
