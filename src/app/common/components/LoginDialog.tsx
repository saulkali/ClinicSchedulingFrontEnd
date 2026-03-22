import { useState } from "react";
import {
  Alert,
  Box,
  Button,
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
  Close as CloseIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Visibility,
  VisibilityOff,
  HealthAndSafety as HealthAndSafetyIcon,
} from "@mui/icons-material";

type LoginDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function LoginDialog({ open, onClose }: LoginDialogProps) {
  const [tab, setTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={onClose}
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

          <IconButton onClick={onClose} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant="fullWidth"
        >
          <Tab icon={<LoginIcon />} iconPosition="start" label="Iniciar sesión" />
          <Tab icon={<PersonAddIcon />} iconPosition="start" label="Registro" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tab === 0 ? (
            <Stack spacing={2.5}>
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                Accede para revisar tus citas, historial y próximos recordatorios.
              </Alert>

              <TextField
                fullWidth
                label="Correo electrónico"
                placeholder="paciente@correo.com"
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

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Link underline="hover" component="button" type="button">
                  ¿Olvidaste tu contraseña?
                </Link>

                <Typography variant="body2" color="text.secondary">
                  Acceso seguro
                </Typography>
              </Stack>

              <Button
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
                  py: 1.4,
                }}
              >
                Ingresar
              </Button>
            </Stack>
          ) : (
            <Stack spacing={2.5}>
              <Alert severity="success" sx={{ borderRadius: 3 }}>
                Crea tu cuenta para agendar consultas y dar seguimiento a tu atención.
              </Alert>

              <TextField fullWidth label="Nombre completo" placeholder="Juan Pérez" />
              <TextField
                fullWidth
                label="Correo electrónico"
                placeholder="correo@ejemplo.com"
              />
              <TextField
                fullWidth
                type="password"
                label="Contraseña"
                placeholder="********"
              />
              <TextField
                fullWidth
                type="password"
                label="Confirmar contraseña"
                placeholder="********"
              />

              <Button
                variant="contained"
                size="large"
                startIcon={<PersonAddIcon />}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
                  py: 1.4,
                }}
              >
                Crear cuenta
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
}