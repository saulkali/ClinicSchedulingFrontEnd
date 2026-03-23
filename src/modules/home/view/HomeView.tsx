import { useMemo, useState } from "react";
import {
  alpha,
  Avatar,
  AppBar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CssBaseline,
  Divider,
  Drawer,
  Fab,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Toolbar,
  Typography,
  Zoom,
  keyframes,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  CalendarMonth as CalendarMonthIcon,
  Favorite as FavoriteIcon,
  Home as HomeIcon,
  LocalHospital as LocalHospitalIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Lock as LockIcon,
  MedicalServices as MedicalServicesIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Vaccines as VaccinesIcon,
  MonitorHeart as MonitorHeartIcon,
  Emergency as EmergencyIcon,
  Psychology as PsychologyIcon,
  Healing as HealingIcon,
  Groups as GroupsIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
  Phone as PhoneIcon,
  EventAvailable as EventAvailableIcon,
} from "@mui/icons-material";
import { observer } from "mobx-react-lite";
import { LoginDialog } from "../../../app/common/components/LoginDialog";
import { sessionStore } from "../../../core/session/SessionStore";

const drawerWidth = 280;

const floatY = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.35); }
  70% { box-shadow: 0 0 0 18px rgba(25, 118, 210, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
`;

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

type MenuItem = {
  text: string;
  icon: React.ReactNode;
  badge?: string;
  requiresAuth?: boolean;
};

export const HomeView = observer(function HomeView() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const openLogin = () => {
    setLoginOpen(true);
  };

  const menuItems = useMemo<MenuItem[]>(
    () => [
      { text: "Inicio", icon: <HomeIcon /> },
      { text: "Agendar cita", icon: <CalendarMonthIcon />, badge: "Nuevo", requiresAuth: true },
      { text: "Especialidades", icon: <MedicalServicesIcon /> },
      { text: "Médicos", icon: <GroupsIcon /> },
      { text: "Mis citas", icon: <AccessTimeIcon />, requiresAuth: true },
      { text: "Urgencias", icon: <EmergencyIcon /> },
      { text: "Bienestar", icon: <FavoriteIcon /> },
      { text: "Mi perfil", icon: <PersonIcon />, requiresAuth: true },
    ],
    []
  );

  const specialties = [
    { title: "Cardiología", icon: <MonitorHeartIcon />, color: "#e53935" },
    { title: "Psicología", icon: <PsychologyIcon />, color: "#8e24aa" },
    { title: "Vacunación", icon: <VaccinesIcon />, color: "#43a047" },
    { title: "Medicina general", icon: <HealingIcon />, color: "#1e88e5" },
  ];

  const quickStats = [
    { label: "Médicos disponibles", value: "48+" },
    { label: "Especialidades", value: "22" },
    { label: "Citas hoy", value: "130" },
  ];

  const featuredDoctors = [
    {
      name: "Dra. Laura Méndez",
      specialty: "Cardiología",
      schedule: "Disponible hoy · 4:30 PM",
    },
    {
      name: "Dr. José Ramírez",
      specialty: "Traumatología",
      schedule: "Mañana · 10:00 AM",
    },
    {
      name: "Dra. Fernanda Ortiz",
      specialty: "Pediatría",
      schedule: "Hoy · 6:00 PM",
    },
  ];

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        color: "white",
        background: "linear-gradient(180deg, #0f172a 0%, #102a43 55%, #1565c0 100%)",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          animation: `${fadeUp} .5s ease`,
        }}
      >
        <Avatar
          sx={{
            bgcolor: "#42a5f5",
            width: 46,
            height: 46,
            animation: `${floatY} 3s ease-in-out infinite`,
          }}
        >
          <LocalHospitalIcon />
        </Avatar>

        <Box>
          <Typography variant="h6" fontWeight={800}>
            MediCare
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            Agenda médica inteligente
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />

      <Box sx={{ px: 2, pt: 2 }}>
        <Card
          sx={{
            borderRadius: 4,
            color: "white",
            background: "rgba(255,255,255,0.08)",
            boxShadow: "none",
            backdropFilter: "blur(10px)",
            animation: `${fadeUp} .7s ease`,
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
              <Avatar sx={{ bgcolor: alpha("#fff", 0.14) }}>
                <FavoriteIcon />
              </Avatar>
              <Box>
                <Typography fontWeight={700}>
                  {sessionStore.isLoggedIn ? sessionStore.email : "Portal del paciente"}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                  {sessionStore.isLoggedIn
                    ? `Rol actual: ${sessionStore.role || "Usuario autenticado"}`
                    : "Gestiona tus consultas"}
                </Typography>
              </Box>
            </Stack>

            {sessionStore.isLoggedIn ? (
              <Button
                variant="outlined"
                fullWidth
                startIcon={<LogoutIcon />}
                onClick={sessionStore.clearSession}
                sx={{
                  mt: 1.5,
                  borderRadius: 3,
                  borderColor: "rgba(255,255,255,0.35)",
                  color: "white",
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Cerrar sesión
              </Button>
            ) : (
              <Button
                variant="contained"
                fullWidth
                startIcon={<LoginIcon />}
                onClick={openLogin}
                sx={{
                  mt: 1.5,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
                  animation: `${pulse} 2.4s infinite`,
                }}
              >
                Iniciar sesión
              </Button>
            )}
          </CardContent>
        </Card>
      </Box>

      <List sx={{ px: 1.5, py: 2 }}>
        {menuItems.map((item, index) => {
          const isBlocked = Boolean(item.requiresAuth && !sessionStore.isLoggedIn);

          return (
            <ListItemButton
              key={item.text}
              onClick={isBlocked ? openLogin : undefined}
              sx={{
                borderRadius: 3,
                mb: 0.9,
                color: "white",
                opacity: isBlocked ? 0.6 : 1,
                animation: `${fadeUp} ${0.25 + index * 0.08}s ease`,
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.1)",
                  transform: "translateX(4px)",
                },
                transition: "all .25s ease",
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 42 }}>
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.text}
                secondary={isBlocked ? "Requiere iniciar sesión" : undefined}
                secondaryTypographyProps={{ sx: { color: "rgba(255,255,255,0.7)" } }}
              />

              {isBlocked ? (
                <LockIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.7)" }} />
              ) : null}

              {item.badge ? (
                <Chip
                  label={item.badge}
                  size="small"
                  sx={{
                    bgcolor: "#42a5f5",
                    color: "white",
                    fontWeight: 700,
                  }}
                />
              ) : null}
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ px: 2, pb: 2 }}>
        <Typography variant="body2" sx={{ opacity: 0.75, mb: 1 }}>
          Accesos rápidos
        </Typography>

        <Stack direction="row" spacing={1.2} flexWrap="wrap" useFlexGap>
          <Chip
            icon={<PhoneIcon />}
            label="Soporte"
            sx={{ color: "white", bgcolor: "rgba(255,255,255,.08)" }}
          />
          <Chip
            icon={<EventAvailableIcon />}
            label="Disponibilidad"
            sx={{ color: "white", bgcolor: "rgba(255,255,255,.08)" }}
          />
          <Chip
            icon={<NotificationsIcon />}
            label="Alertas"
            sx={{ color: "white", bgcolor: "rgba(255,255,255,.08)" }}
          />
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f7fb" }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "rgba(255,255,255,0.86)",
          color: "#0f172a",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>

            <Box>
              <Typography variant="h6" fontWeight={800}>
                Sistema de citas médicas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {sessionStore.isLoggedIn
                  ? `Sesión iniciada como ${sessionStore.email}`
                  : "Encuentra especialistas y agenda en minutos"}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              icon={<FavoriteIcon />}
              label="Salud y bienestar"
              sx={{
                display: { xs: "none", md: "flex" },
                borderRadius: 2,
                backgroundColor: "#e3f2fd",
                color: "#1565c0",
                fontWeight: 700,
              }}
            />

            <IconButton>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {sessionStore.isLoggedIn ? (
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={sessionStore.clearSession}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Cerrar sesión
              </Button>
            ) : (
              <Button
                variant="outlined"
                startIcon={<LoginIcon />}
                onClick={openLogin}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Iniciar sesión
              </Button>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              border: "none",
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              border: "none",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          p: 3,
        }}
      >
        <Toolbar />

        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            p: { xs: 3, md: 4 },
            borderRadius: 5,
            background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 60%, #90caf9 100%)",
            color: "white",
            mb: 3,
            animation: `${fadeUp} .4s ease`,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 180,
              height: 180,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.12)",
              animation: `${floatY} 6s ease-in-out infinite`,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -40,
              right: 80,
              width: 120,
              height: 120,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.08)",
              animation: `${floatY} 4.5s ease-in-out infinite`,
            }}
          />

          <Typography variant="h4" fontWeight={900} gutterBottom>
            Agenda tu cita médica fácilmente
          </Typography>

          <Typography variant="body1" sx={{ maxWidth: 720, opacity: 0.96, mb: 3 }}>
            Encuentra médicos por especialidad, revisa horarios disponibles y
            organiza tus consultas desde un solo lugar, con una experiencia clara y moderna.
          </Typography>

          {!sessionStore.isLoggedIn ? (
            <AlertBanner onLogin={openLogin} />
          ) : (
            <Chip
              label={`Usuario autenticado: ${sessionStore.email}${sessionStore.role ? ` · ${sessionStore.role}` : ""}`}
              sx={{
                mb: 3,
                bgcolor: "rgba(255,255,255,0.18)",
                color: "white",
                fontWeight: 700,
              }}
            />
          )}

          <Stack direction="row" spacing={1.2} mb={3} flexWrap="wrap" useFlexGap>
            {quickStats.map((stat) => (
              <Chip
                key={stat.label}
                label={`${stat.label}: ${stat.value}`}
                sx={{
                  bgcolor: "rgba(255,255,255,0.18)",
                  color: "white",
                  fontWeight: 700,
                  backdropFilter: "blur(8px)",
                }}
              />
            ))}
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ maxWidth: 950 }}
          >
            <TextField
              fullWidth
              placeholder="Buscar médico o especialidad"
              variant="outlined"
              sx={{
                bgcolor: "white",
                borderRadius: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              placeholder="Fecha de consulta"
              variant="outlined"
              sx={{
                bgcolor: "white",
                borderRadius: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                },
              }}
            />

            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={!sessionStore.isLoggedIn ? openLogin : undefined}
              sx={{
                minWidth: 190,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 800,
                bgcolor: "#0f172a",
                "&:hover": {
                  bgcolor: "#111827",
                },
              }}
            >
              Buscar cita
            </Button>
          </Stack>
        </Box>

        <Stack direction={{ xs: "column", md: "row" }} spacing={3} mb={3}>
          <Card
            sx={{
              flex: 1,
              borderRadius: 4,
              boxShadow: 2,
              animation: `${fadeUp} .55s ease`,
              transition: "transform .25s ease, box-shadow .25s ease",
              "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: 8,
              },
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: "#e3f2fd", color: "#1976d2" }}>
                  <MedicalServicesIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={800}>
                  Especialidades médicas
                </Typography>
              </Stack>

              <Typography color="text.secondary">
                Cardiología, medicina general, pediatría, traumatología,
                dermatología y más.
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              borderRadius: 4,
              boxShadow: 2,
              animation: `${fadeUp} .7s ease`,
              transition: "transform .25s ease, box-shadow .25s ease",
              "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: 8,
              },
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: "#e8f5e9", color: "#2e7d32" }}>
                  <CalendarMonthIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={800}>
                  Agenda rápida
                </Typography>
              </Stack>

              <Typography color="text.secondary">
                Reserva citas en pocos pasos y recibe confirmación inmediata.
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              borderRadius: 4,
              boxShadow: 2,
              animation: `${fadeUp} .85s ease`,
              transition: "transform .25s ease, box-shadow .25s ease",
              "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: 8,
              },
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: "#fff3e0", color: "#ef6c00" }}>
                  <PersonIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={800}>
                  Portal del paciente
                </Typography>
              </Stack>

              <Typography color="text.secondary">
                Consulta historial, próximas citas, médicos favoritos y datos de tu cuenta.
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        <Card
          sx={{
            borderRadius: 5,
            boxShadow: 2,
            mb: 3,
            animation: `${fadeUp} .95s ease`,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight={900} mb={2}>
              Especialidades destacadas
            </Typography>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
            >
              {specialties.map((item) => (
                <Card
                  key={item.title}
                  variant="outlined"
                  sx={{
                    flex: 1,
                    borderRadius: 4,
                    transition: "all .25s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      borderColor: item.color,
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent>
                    <Avatar
                      sx={{
                        bgcolor: alpha(item.color, 0.12),
                        color: item.color,
                        mb: 2,
                      }}
                    >
                      {item.icon}
                    </Avatar>

                    <Typography fontWeight={800} mb={1}>
                      {item.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Atención profesional, seguimiento y disponibilidad flexible.
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 5,
            boxShadow: 2,
            animation: `${fadeUp} 1.1s ease`,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              mb={2}
              spacing={2}
            >
              <Box>
                <Typography variant="h5" fontWeight={900}>
                  Médicos recomendados
                </Typography>
                <Typography color="text.secondary">
                  Profesionales con alta demanda y disponibilidad próxima.
                </Typography>
              </Box>

              <Button
                variant="text"
                endIcon={<ArrowForwardIcon />}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Ver todos
              </Button>
            </Stack>

            <Stack spacing={2}>
              {featuredDoctors.map((doctor) => (
                <Box
                  key={doctor.name}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    border: "1px solid #e5e7eb",
                    transition: "all .2s ease",
                    "&:hover": {
                      bgcolor: "#f8fbff",
                      borderColor: "#90caf9",
                    },
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    spacing={2}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: "#1976d2" }}>
                        <LocalHospitalIcon />
                      </Avatar>

                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography fontWeight={800}>{doctor.name}</Typography>
                          <StarIcon sx={{ fontSize: 18, color: "#f9a825" }} />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {doctor.specialty}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          {doctor.schedule}
                        </Typography>
                      </Box>
                    </Stack>

                    <Button
                      variant="contained"
                      onClick={!sessionStore.isLoggedIn ? openLogin : undefined}
                      sx={{
                        borderRadius: 3,
                        textTransform: "none",
                        fontWeight: 700,
                      }}
                    >
                      {sessionStore.isLoggedIn ? "Reservar" : "Inicia sesión para reservar"}
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Zoom in>
        <Fab
          color="primary"
          onClick={openLogin}
          sx={{
            position: "fixed",
            right: 24,
            bottom: 24,
            display: { xs: "flex", md: "none" },
          }}
        >
          <LoginIcon />
        </Fab>
      </Zoom>

      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </Box>
  );
});

function AlertBanner({ onLogin }: { onLogin: () => void }) {
  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        borderRadius: 3,
        bgcolor: "rgba(255,255,255,0.14)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
      >
        <Box>
          <Typography fontWeight={800}>Acceso requerido para funciones privadas</Typography>
          <Typography variant="body2" sx={{ opacity: 0.95 }}>
            Inicia sesión para habilitar agendamiento, historial, perfil y seguimiento de citas.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={onLogin}
          startIcon={<LoginIcon />}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 700,
            bgcolor: "#0f172a",
          }}
        >
          Ir a iniciar sesión
        </Button>
      </Stack>
    </Box>
  );
}
