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
import { RoleRepository } from "../models/repositories/RoleRepository";
import { UserRepository } from "../models/repositories/UserRepository";
import { LoginViewModel } from "../viewmodels/LoginViewModel";

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

export const LoginView = observer(function LoginDialog({
  open,
  onClose,
}: LoginDialogProps) {
  const [tab, setTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const viewModel = useMemo(
    () => new LoginViewModel(new AuthRepository(), new RoleRepository(), new UserRepository()),
    []
  );

  useEffect(() => {
    if (open && tab === 1) {
      void viewModel.ensureRolesLoaded();
    }
  }, [open, tab, viewModel]);

  const handleClose = () => {
    viewModel.clearMessages();
    viewModel.clearRegisterMessages();
    setShowPassword(false);
    setShowRegisterPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const handleLogin = async () => {
    const success = await viewModel.login();

    if (success) {
      handleClose();
    }
  };

  const handleRegister = async () => {
    const success = await viewModel.register();

    if (success) {
      setTab(0);
      setShowRegisterPassword(false);
      setShowConfirmPassword(false);
    }
  };

  const handleLogout = () => {
    sessionStore.clearSession();
    viewModel.resetForm();
  };

  const handleTabChange = (_: SyntheticEvent, value: number) => {
    setTab(value);

    if (value === 1) {
      void viewModel.ensureRolesLoaded();
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

              {viewModel.errorMessage ? (
                <Alert severity="error" sx={{ borderRadius: 3 }}>
                  {viewModel.errorMessage}
                </Alert>
              ) : null}

              {viewModel.successMessage ? (
                <Alert severity="success" sx={{ borderRadius: 3 }}>
                  {viewModel.successMessage}
                </Alert>
              ) : null}

              <TextField
                fullWidth
                label="Correo electrónico"
                placeholder="paciente@correo.com"
                value={viewModel.email}
                onChange={(event) => viewModel.setEmail(event.target.value)}
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
                value={viewModel.password}
                onChange={(event) => viewModel.setPassword(event.target.value)}
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
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 700,
                    py: 1.4,
                  }}
                >
                  Cerrar sesión
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<LoginIcon />}
                  onClick={handleLogin}
                  disabled={!viewModel.canSubmit}
                  sx={{
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 700,
                    py: 1.4,
                  }}
                >
                  {viewModel.isLoading ? "Ingresando..." : "Ingresar"}
                </Button>
              )}
            </Stack>
          ) : (
            <Stack spacing={2.5}>
              <Alert severity="success" sx={{ borderRadius: 3 }}>
Selecciona el rol con el que deseas registrarte para abrir su dashboard correspondiente.
              </Alert>

              {viewModel.registerErrorMessage ? (
                <Alert severity="error" sx={{ borderRadius: 3 }}>
                  {viewModel.registerErrorMessage}
                </Alert>
              ) : null}

              {viewModel.registerSuccessMessage ? (
                <Alert severity="success" sx={{ borderRadius: 3 }}>
                  {viewModel.registerSuccessMessage}
                </Alert>
              ) : null}

              <Stack spacing={1.5}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Elige tu rol
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Los roles se consultan en tiempo real desde la base de datos mediante el endpoint de roles.
                </Typography>
              </Stack>

              {viewModel.isRolesLoading ? (
                <Alert severity="info" sx={{ borderRadius: 3 }}>
                  Cargando roles disponibles...
                </Alert>
              ) : null}

              <Stack spacing={1.5}>
                {viewModel.roles.map((role) => {
                  const visual = getRoleVisual(role.name);
                  const isSelected = viewModel.selectedRoleId === role.id;

                  return (
                    <Card
                      key={role.id}
                      elevation={isSelected ? 8 : 0}
                      sx={{
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: isSelected ? "primary.main" : "divider",
                        backgroundColor: isSelected ? "rgba(25, 118, 210, 0.06)" : "background.paper",
                        transition: "all 0.2s ease-in-out",
                      }}
                    >
                      <CardActionArea onClick={() => viewModel.setSelectedRoleId(role.id)}>
                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="center"
                          sx={{ px: 2, py: 2 }}
                        >
                          <Box
                            sx={{
                              width: 56,
                              height: 56,
                              borderRadius: 2.5,
                              display: "grid",
                              placeItems: "center",
                              backgroundColor: isSelected ? "primary.main" : "rgba(25, 118, 210, 0.10)",
                              color: isSelected ? "primary.contrastText" : "primary.main",
                              flexShrink: 0,
                            }}
                          >
                            {visual.icon}
                          </Box>

                          <Box sx={{ flex: 1 }}>
                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              spacing={1}
                              justifyContent="space-between"
                              alignItems={{ xs: "flex-start", sm: "center" }}
                            >
                              <Typography variant="subtitle1" fontWeight={800}>
                                {visual.title}
                              </Typography>
                              <Chip
                                label={isSelected ? "Seleccionado" : "Disponible"}
                                color={isSelected ? "primary" : "default"}
                                size="small"
                              />
                            </Stack>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {visual.description}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardActionArea>
                    </Card>
                  );
                })}
              </Stack>

              <TextField
                fullWidth
                label="Correo electrónico"
                placeholder="correo@ejemplo.com"
                value={viewModel.registerEmail}
                onChange={(event) => viewModel.setRegisterEmail(event.target.value)}
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
                type={showRegisterPassword ? "text" : "password"}
                label="Contraseña"
                placeholder="********"
                helperText="Debe contener al menos 6 caracteres."
                value={viewModel.registerPassword}
                onChange={(event) => viewModel.setRegisterPassword(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
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
                placeholder="********"
                value={viewModel.confirmPassword}
                onChange={(event) => viewModel.setConfirmPassword(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword((prev) => !prev)}>
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="contained"
                size="large"
                startIcon={<PersonAddIcon />}
                onClick={handleRegister}
                disabled={!viewModel.canRegister || viewModel.isRolesLoading}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
                  py: 1.4,
                }}
              >
                {viewModel.isRegistering ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            </Stack>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Al continuar aceptas nuestros términos de servicio y aviso de privacidad.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
});
