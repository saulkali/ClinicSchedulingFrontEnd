import { useEffect, useMemo, useState } from "react";
import type { ReactNode, SyntheticEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  Badge as BadgeIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  MedicalServices as MedicalServicesIcon,
  PersonAdd as PersonAddIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { observer } from "mobx-react-lite";
import { sessionStore } from "../common/session/SessionStore";
import { AuthRepository } from "../models/repositories/AuthRepository";
import { DoctorRepository } from "../models/repositories/DoctorRepository";
import { PatientRepository } from "../models/repositories/PatientRepository";
import { RoleRepository } from "../models/repositories/RoleRepository";
import { UserRepository } from "../models/repositories/UserRepository";
import { RolesViewModel } from "../viewmodels/RolesViewModel";
import { UserViewModel } from "../viewmodels/UserViewModel";

type LoginDialogProps = {
  open: boolean;
  onClose: () => void;
};

const roleVisuals: Record<string, { icon: ReactNode; title: string; description: string }> = {
  admin: {
    icon: <HealthAndSafetyIcon fontSize="large" />,
    title: "Administrador",
    description: "Accede al dashboard para gestionar pacientes, doctores y especialidades.",
  },
  doctor: {
    icon: <MedicalServicesIcon fontSize="large" />,
    title: "Doctor",
    description: "Accede para gestionar agenda, disponibilidad y consultas.",
  },
  patient: {
    icon: <BadgeIcon fontSize="large" />,
    title: "Paciente",
    description: "Regístrate para agendar citas y consultar tu seguimiento médico.",
  },
  paciente: {
    icon: <BadgeIcon fontSize="large" />,
    title: "Paciente",
    description: "Regístrate para agendar citas y consultar tu seguimiento médico.",
  },
};

const getRoleVisual = (roleName: string) => {
  const normalizedName = roleName.trim().toLowerCase();

  return (
    roleVisuals[normalizedName] ?? {
      icon: <BadgeIcon fontSize="large" />,
      title: roleName,
      description: "Selecciona este rol para completar tu registro en la plataforma.",
    }
  );
};

export const LoginView = observer(function LoginDialog({ open, onClose }: LoginDialogProps) {
  const [tab, setTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const rolesViewModel = useMemo(() => new RolesViewModel(new RoleRepository()), []);
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

  useEffect(() => {
    if (open && tab === 1) {
      void userViewModel.ensureRolesLoaded();
    }
  }, [open, tab, userViewModel]);

  const handleClose = () => {
    userViewModel.clearMessages();
    userViewModel.clearRegisterMessages();
    setShowPassword(false);
    setShowRegisterPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const handleLogin = async () => {
    const success = await userViewModel.login();

    if (success) {
      handleClose();
    }
  };

  const handleRegister = async () => {
    const success = await userViewModel.register();

    if (success) {
      setTab(0);
      setShowRegisterPassword(false);
      setShowConfirmPassword(false);
    }
  };

  const handleLogout = () => {
    sessionStore.clearSession();
    userViewModel.resetForm();
  };

  const handleTabChange = (_: SyntheticEvent, value: number) => {
    setTab(value);

    if (value === 1) {
      void userViewModel.ensureRolesLoaded();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            px: 3,
            py: 2.5,
            color: "white",
            background: "linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <HealthAndSafetyIcon />
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Portal de acceso
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Pacientes y personal médico
              </Typography>
            </Box>
          </Stack>

          <IconButton onClick={handleClose} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Tabs value={tab} onChange={handleTabChange} variant="fullWidth">
          <Tab icon={<LoginIcon />} iconPosition="start" label="Iniciar sesión" />
          <Tab icon={<PersonAddIcon />} iconPosition="start" label="Registro" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tab === 0 ? (
            <Stack spacing={2.5}>
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                {sessionStore.isLoggedIn
                  ? `Sesión activa como ${sessionStore.email}${sessionStore.role ? ` · ${sessionStore.role}` : ""}`
                  : "Accede para revisar tus citas, historial y próximos recordatorios."}
              </Alert>

              {userViewModel.errorMessage ? (
                <Alert severity="error" sx={{ borderRadius: 3 }}>
                  {userViewModel.errorMessage}
                </Alert>
              ) : null}

              {userViewModel.successMessage ? (
                <Alert severity="success" sx={{ borderRadius: 3 }}>
                  {userViewModel.successMessage}
                </Alert>
              ) : null}

              <TextField
                fullWidth
                label="Correo electrónico"
                placeholder="paciente@correo.com"
                value={userViewModel.email}
                onChange={(event) => userViewModel.setEmail(event.target.value)}
                disabled={sessionStore.isLoggedIn}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                label="Contraseña"
                placeholder="********"
                value={userViewModel.password}
                onChange={(event) => userViewModel.setPassword(event.target.value)}
                disabled={sessionStore.isLoggedIn}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Link underline="hover" component="button" type="button">
                  ¿Olvidaste tu contraseña?
                </Link>

                <Typography variant="body2" color="text.secondary">
                  Acceso seguro
                </Typography>
              </Stack>

              {sessionStore.isLoggedIn ? (
                <Button variant="outlined" startIcon={<LogoutIcon />} onClick={handleLogout}>
                  Cerrar sesión actual
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<LoginIcon />}
                  disabled={!userViewModel.canSubmit}
                  onClick={() => void handleLogin()}
                >
                  Iniciar sesión
                </Button>
              )}
            </Stack>
          ) : (
            <Stack spacing={2.5}>
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                Selecciona el rol con el que deseas usar la plataforma y crea tu usuario.
              </Alert>

              {rolesViewModel.errorMessage ? (
                <Alert severity="error" sx={{ borderRadius: 3 }}>
                  {rolesViewModel.errorMessage}
                </Alert>
              ) : null}

              {userViewModel.registerErrorMessage ? (
                <Alert severity="error" sx={{ borderRadius: 3 }}>
                  {userViewModel.registerErrorMessage}
                </Alert>
              ) : null}

              {userViewModel.registerSuccessMessage ? (
                <Alert severity="success" sx={{ borderRadius: 3 }}>
                  {userViewModel.registerSuccessMessage}
                </Alert>
              ) : null}

              <TextField
                fullWidth
                label="Correo electrónico"
                placeholder="usuario@correo.com"
                value={userViewModel.registerEmail}
                onChange={(event) => userViewModel.setRegisterEmail(event.target.value)}
              />

              <TextField
                fullWidth
                type={showRegisterPassword ? "text" : "password"}
                label="Contraseña"
                value={userViewModel.registerPassword}
                onChange={(event) => userViewModel.setRegisterPassword(event.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowRegisterPassword((prev) => !prev)}>
                        {showRegisterPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                type={showConfirmPassword ? "text" : "password"}
                label="Confirmar contraseña"
                value={userViewModel.confirmPassword}
                onChange={(event) => userViewModel.setConfirmPassword(event.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword((prev) => !prev)}>
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Divider>
                <Chip label="Selecciona tu rol" />
              </Divider>

              <Stack spacing={1.5}>
                {rolesViewModel.isLoading ? (
                  <Alert severity="info">Cargando roles disponibles...</Alert>
                ) : rolesViewModel.activeRoles.length ? (
                  rolesViewModel.activeRoles.map((role) => {
                    const visual = getRoleVisual(role.name);
                    const selected = userViewModel.selectedRoleId === role.id;

                    return (
                      <Card
                        key={role.id}
                        variant={selected ? "elevation" : "outlined"}
                        sx={{
                          borderRadius: 4,
                          borderColor: selected ? "primary.main" : undefined,
                          boxShadow: selected ? 8 : undefined,
                        }}
                      >
                        <CardActionArea onClick={() => userViewModel.setSelectedRoleId(role.id)}>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ p: 2 }}>
                            <Box
                              sx={{
                                width: 52,
                                height: 52,
                                borderRadius: "50%",
                                bgcolor: selected ? "primary.main" : "action.hover",
                                color: selected ? "white" : "text.primary",
                                display: "grid",
                                placeItems: "center",
                              }}
                            >
                              {visual.icon}
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography fontWeight={800}>{visual.title}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {visual.description}
                              </Typography>
                            </Box>
                            {selected ? <Chip color="primary" label="Seleccionado" /> : null}
                          </Stack>
                        </CardActionArea>
                      </Card>
                    );
                  })
                ) : (
                  <Alert severity="warning">No hay roles activos configurados para el registro.</Alert>
                )}
              </Stack>

              <Button
                variant="contained"
                size="large"
                startIcon={<PersonAddIcon />}
                disabled={!userViewModel.canRegister}
                onClick={() => void handleRegister()}
              >
                Crear cuenta
              </Button>
            </Stack>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
});
