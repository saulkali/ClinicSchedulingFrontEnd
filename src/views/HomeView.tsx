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
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  CalendarMonth as CalendarMonthIcon,
  EventAvailable as EventAvailableIcon,
  Group as GroupIcon,
  Groups as GroupsIcon,
  Home as HomeIcon,
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
  VerifiedUser as VerifiedUserIcon,
} from "@mui/icons-material";
import { observer } from "mobx-react-lite";
import { sessionStore } from "../common/session/SessionStore";
import { AppointmentRepository } from "../models/repositories/AppointmentRepository";
import { AuthRepository } from "../models/repositories/AuthRepository";
import { DoctorRepository } from "../models/repositories/DoctorRepository";
import { DoctorScheduleRepository } from "../models/repositories/DoctorScheduleRepository";
import { PatientRepository } from "../models/repositories/PatientRepository";
import { RoleRepository } from "../models/repositories/RoleRepository";
import { SpecialtyRepository } from "../models/repositories/SpecialtyRepository";
import { UserRepository } from "../models/repositories/UserRepository";
import { AppointmentsViewModel } from "../viewmodels/AppointmentsViewModel";
import { RolesViewModel } from "../viewmodels/RolesViewModel";
import { UserViewModel } from "../viewmodels/UserViewModel";
import { AppointmentsView } from "./AppointmentsView";
import { LoginView } from "./LoginView";
import { RolesView } from "./RolesView";
import { UserView } from "./UserView";

type SectionKey =
  | "welcome"
  | "overview"
  | "roles"
  | "patients"
  | "doctors"
  | "specialties"
  | "appointments"
  | "find-doctors"
  | "my-calendar"
  | "work-schedule";

type NavItem = {
  key: SectionKey;
  label: string;
  icon: ReactNode;
};

const drawerWidth = 300;

const roleCopy: Record<string, { title: string; subtitle: string }> = {
  ADMIN: {
    title: "Panel administrativo",
    subtitle: "Supervisa pacientes, doctores, especialidades, roles y operación clínica.",
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

const getNavItemsByRole = (role: string, isLoggedIn: boolean): NavItem[] => {
  if (!isLoggedIn) {
    return [{ key: "welcome", label: "Principal", icon: <HomeIcon /> }];
  }

  if (role === "ADMIN") {
    return [
      { key: "overview", label: "Resumen", icon: <AdminPanelSettingsIcon /> },
      { key: "roles", label: "Roles", icon: <VerifiedUserIcon /> },
      { key: "patients", label: "Pacientes", icon: <GroupsIcon /> },
      { key: "doctors", label: "Doctores", icon: <MedicalServicesIcon /> },
      { key: "specialties", label: "Especialidades", icon: <ManageAccountsIcon /> },
      { key: "appointments", label: "Citas", icon: <CalendarMonthIcon /> },
      { key: "my-calendar", label: "Calendario", icon: <TodayIcon /> },
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
    { key: "find-doctors", label: "Agendar cita", icon: <PersonSearchIcon /> },
    { key: "appointments", label: "Mis citas", icon: <CalendarMonthIcon /> },
    { key: "my-calendar", label: "Calendario", icon: <TodayIcon /> },
  ];
};

export const HomeView = observer(function HomeView() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [section, setSection] = useState<SectionKey>("overview");

  const rolesViewModel = useMemo(() => new RolesViewModel(new RoleRepository()), []);
  const appointmentsViewModel = useMemo(
    () =>
      new AppointmentsViewModel(
        new DoctorRepository(),
        new PatientRepository(),
        new SpecialtyRepository(),
        new AppointmentRepository(),
        new DoctorScheduleRepository()
      ),
    []
  );
  const userViewModel = useMemo(
    () =>
      new UserViewModel(
        new AuthRepository(),
        new UserRepository(),
        new PatientRepository(),
        new DoctorRepository(),
        rolesViewModel
      ),
    [rolesViewModel]
  );

  const isLoggedIn = sessionStore.isLoggedIn;
  const currentUserId = sessionStore.userId;
  const currentRole = sessionStore.normalizedRole || "PATIENT";
  const navItems = useMemo(() => getNavItemsByRole(currentRole, isLoggedIn), [currentRole, isLoggedIn]);
  const currentCopy = roleCopy[currentRole] ?? roleCopy.PATIENT;
  const needsProfileCompletion = Boolean(
    isLoggedIn &&
      ["PATIENT", "DOCTOR"].includes(currentRole) &&
      currentUserId &&
      ((currentRole === "PATIENT" && !appointmentsViewModel.currentPatient) ||
        (currentRole === "DOCTOR" && !appointmentsViewModel.currentDoctor))
  );

  useEffect(() => {
    setSection(navItems[0]?.key ?? "overview");
  }, [navItems]);

  useEffect(() => {
    void rolesViewModel.loadRoles();
  }, [rolesViewModel]);

  useEffect(() => {
    void appointmentsViewModel.loadDashboardData();
  }, [appointmentsViewModel, currentRole, currentUserId, isLoggedIn]);

  useEffect(() => {
    userViewModel.syncProfileForms({
      currentRole,
      currentDoctor: appointmentsViewModel.currentDoctor,
      currentPatient: appointmentsViewModel.currentPatient,
    });
  }, [
    appointmentsViewModel.currentDoctor,
    appointmentsViewModel.currentPatient,
    currentRole,
    userViewModel,
  ]);

  const renderOverview = () => (
    <Grid container spacing={2.5}>
      {[
        {
          label: currentRole === "ADMIN" ? "Pacientes" : "Citas activas",
          value: currentRole === "ADMIN" ? appointmentsViewModel.patients.length : appointmentsViewModel.appointmentSummary.active,
          icon: <GroupsIcon />,
        },
        {
          label: currentRole === "ADMIN" ? "Doctores" : "Citas canceladas",
          value: currentRole === "ADMIN" ? appointmentsViewModel.doctors.length : appointmentsViewModel.appointmentSummary.cancelled,
          icon: <MedicalServicesIcon />,
        },
        {
          label:
            currentRole === "DOCTOR"
              ? "Bloques de horario"
              : currentRole === "PATIENT"
                ? "Citas completadas"
                : "Roles activos",
          value:
            currentRole === "DOCTOR"
              ? appointmentsViewModel.filteredSchedules.length
              : currentRole === "PATIENT"
                ? appointmentsViewModel.appointmentSummary.completed
                : rolesViewModel.activeRoles.length,
          icon: <TodayIcon />,
        },
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
              Centro de control de citas
            </Typography>
            <Stack spacing={1.5}>
              <Alert severity="info">Supervisa en tiempo real el comportamiento de tu agenda clínica.</Alert>
              <Typography color="text.secondary">
                Revisa pacientes, especialistas y estados de citas para tomar decisiones rápidas y mantener una atención ordenada.
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`Roles activos: ${rolesViewModel.activeRoles.length}`} color="primary" />
                <Chip label={`Especialidades: ${appointmentsViewModel.specialties.length}`} />
                <Chip label={`Horarios: ${appointmentsViewModel.filteredSchedules.length}`} color="success" />
              </Stack>
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
              <Chip label={`Activas: ${appointmentsViewModel.appointmentSummary.active}`} color="success" />
              <Chip label={`Canceladas: ${appointmentsViewModel.appointmentSummary.cancelled}`} color="error" />
              <Chip label={`Completadas: ${appointmentsViewModel.appointmentSummary.completed}`} color="warning" />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {needsProfileCompletion ? (
        <Grid size={{ xs: 12 }}>
          <UserView
            mode="profile"
            currentRole={currentRole}
            needsProfileCompletion={needsProfileCompletion}
            currentUserId={currentUserId}
            userViewModel={userViewModel}
            patients={appointmentsViewModel.patients}
            doctors={appointmentsViewModel.doctors}
            specialties={appointmentsViewModel.specialties}
            onProfileSaved={(message) => appointmentsViewModel.refreshAll(message)}
          />
        </Grid>
      ) : null}
    </Grid>
  );

  const renderGuestSection = () => (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Card sx={{ borderRadius: 5, background: "linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)", color: "white" }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={2.5}>
              <Typography variant="h3" fontWeight={900}>Bienvenido a la mini agenda de citas</Typography>
              <Typography>
                Inicia sesión para continuar o regístrate y comienza a gestionar tu salud desde un solo lugar.
              </Typography>
              <Button variant="contained" color="secondary" startIcon={<LoginIcon />} onClick={() => setLoginOpen(true)} sx={{ alignSelf: "flex-start" }}>
                Iniciar sesión o registrarte
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Stack spacing={2}>
          {[
            { title: "Agenda en minutos", text: "Agenda tus citas con especialistas en minutos y sin llamadas telefónicas." },
            { title: "Historial organizado", text: "Organiza tu historial de citas para consultar rápidamente tus atenciones previas." },
            { title: "Recordatorios claros", text: "Recibe seguimiento de tus próximas citas para no perder ninguna consulta importante." },
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

  const renderSection = () => {
    if (!sessionStore.isLoggedIn) {
      return renderGuestSection();
    }

    if (needsProfileCompletion && section !== "overview") {
      return (
        <UserView
          mode="profile"
          currentRole={currentRole}
          needsProfileCompletion={needsProfileCompletion}
          currentUserId={currentUserId}
          userViewModel={userViewModel}
          patients={appointmentsViewModel.patients}
          doctors={appointmentsViewModel.doctors}
          specialties={appointmentsViewModel.specialties}
          onProfileSaved={(message) => appointmentsViewModel.refreshAll(message)}
        />
      );
    }

    switch (section) {
      case "roles":
        return <RolesView viewModel={rolesViewModel} />;
      case "patients":
        return (
          <UserView
            mode="patients"
            currentRole={currentRole}
            needsProfileCompletion={needsProfileCompletion}
            currentUserId={currentUserId}
            userViewModel={userViewModel}
            patients={appointmentsViewModel.patients}
            doctors={appointmentsViewModel.doctors}
            specialties={appointmentsViewModel.specialties}
            onProfileSaved={(message) => appointmentsViewModel.refreshAll(message)}
          />
        );
      case "doctors":
        return (
          <UserView
            mode="doctors"
            currentRole={currentRole}
            needsProfileCompletion={needsProfileCompletion}
            currentUserId={currentUserId}
            userViewModel={userViewModel}
            patients={appointmentsViewModel.patients}
            doctors={appointmentsViewModel.doctors}
            specialties={appointmentsViewModel.specialties}
            onProfileSaved={(message) => appointmentsViewModel.refreshAll(message)}
          />
        );
      case "specialties":
        return (
          <UserView
            mode="specialties"
            currentRole={currentRole}
            needsProfileCompletion={needsProfileCompletion}
            currentUserId={currentUserId}
            userViewModel={userViewModel}
            patients={appointmentsViewModel.patients}
            doctors={appointmentsViewModel.doctors}
            specialties={appointmentsViewModel.specialties}
            onProfileSaved={(message) => appointmentsViewModel.refreshAll(message)}
            onCreateSpecialty={appointmentsViewModel.createSpecialty}
            specialtyForm={{
              name: appointmentsViewModel.specialtyForm.name,
              appointmentDurationMinutes: appointmentsViewModel.specialtyForm.appointmentDurationMinutes,
              setName: (value) => appointmentsViewModel.setSpecialtyForm("name", value),
              setDuration: (value) => appointmentsViewModel.setSpecialtyForm("appointmentDurationMinutes", value),
            }}
          />
        );
      case "find-doctors":
        return <AppointmentsView mode="booking" viewModel={appointmentsViewModel} />;
      case "appointments":
        return <AppointmentsView mode="appointments" viewModel={appointmentsViewModel} />;
      case "my-calendar":
        return <AppointmentsView mode="calendar" viewModel={appointmentsViewModel} />;
      case "work-schedule":
        return <AppointmentsView mode="schedule" viewModel={appointmentsViewModel} />;
      case "overview":
      default:
        return renderOverview();
    }
  };

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#0f172a", color: "white" }}>
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
          <Chip icon={<NotificationsActiveIcon />} label={`Activas: ${appointmentsViewModel.appointmentSummary.active}`} color="success" />
          <Chip icon={<EventAvailableIcon />} label={`Especialidades: ${appointmentsViewModel.specialties.length}`} color="primary" />
          <Chip icon={<GroupIcon />} label={`Usuarios clínicos: ${appointmentsViewModel.doctors.length + appointmentsViewModel.patients.length}`} />
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
              <Typography variant="body2" color="text.secondary">
                {sessionStore.isLoggedIn ? currentCopy.subtitle : "Accede para obtener un dashboard adaptado a tu rol."}
              </Typography>
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
          sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { width: drawerWidth, border: "none" } }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{ display: { xs: "none", sm: "block" }, "& .MuiDrawer-paper": { width: drawerWidth, border: "none" } }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />

        <Stack spacing={3}>
          {sessionStore.isLoggedIn && !sessionStore.userId && currentRole !== "ADMIN" ? (
            <Alert severity="warning">
              No se pudo extraer el UserId del token. Verifica que el JWT incluya el identificador del usuario para completar y relacionar perfiles.
            </Alert>
          ) : null}

          {appointmentsViewModel.successMessage ? (
            <Alert severity="success" onClose={appointmentsViewModel.clearMessages}>
              {appointmentsViewModel.successMessage}
            </Alert>
          ) : null}
          {appointmentsViewModel.errorMessage ? (
            <Alert severity="error" onClose={appointmentsViewModel.clearMessages}>
              {appointmentsViewModel.errorMessage}
            </Alert>
          ) : null}

          {appointmentsViewModel.loading ? (
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
