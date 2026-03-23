import { useEffect, useMemo, useState } from "react";
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
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import type { UserViewModel } from "../viewmodels/UserViewModel";
import { sessionStore } from "../common/session/SessionStore";

type UserViewProps = {
  viewModel: UserViewModel;
};

export const UserView = observer(function UserView({ viewModel }: UserViewProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const roleOptions = useMemo(() => viewModel.roles.filter((role) => role.isActive), [viewModel.roles]);

  useEffect(() => {
    void viewModel.loadBootstrapData();
  }, [viewModel]);

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4" fontWeight={800}>
          UserView
        </Typography>
        <Typography color="text.secondary">
          Vista especializada para autenticación, registro y consulta de usuarios usando UserViewModel.
        </Typography>
      </Stack>

      {viewModel.helperMessage ? <Alert severity="info">{viewModel.helperMessage}</Alert> : null}
      {viewModel.usersErrorMessage ? <Alert severity="warning">{viewModel.usersErrorMessage}</Alert> : null}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ borderRadius: 4, height: "100%" }}>
            <CardContent>
              <Stack spacing={2.5}>
                <Typography variant="h6" fontWeight={700}>
                  Acceso
                </Typography>

                {viewModel.loginErrorMessage ? <Alert severity="error">{viewModel.loginErrorMessage}</Alert> : null}
                {viewModel.loginSuccessMessage ? <Alert severity="success">{viewModel.loginSuccessMessage}</Alert> : null}

                <TextField
                  label="Correo electrónico"
                  value={viewModel.email}
                  onChange={(event) => viewModel.setEmail(event.target.value)}
                  fullWidth
                />
                <TextField
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  value={viewModel.password}
                  onChange={(event) => viewModel.setPassword(event.target.value)}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((value) => !value)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button variant="contained" onClick={() => void viewModel.login()} disabled={!viewModel.canLogin}>
                    Iniciar sesión
                  </Button>
                  <Button variant="outlined" onClick={viewModel.logout} disabled={!sessionStore.isLoggedIn}>
                    Cerrar sesión
                  </Button>
                </Stack>

                <Divider />

                <Typography variant="h6" fontWeight={700}>
                  Registro
                </Typography>

                {viewModel.registerErrorMessage ? <Alert severity="error">{viewModel.registerErrorMessage}</Alert> : null}
                {viewModel.registerSuccessMessage ? <Alert severity="success">{viewModel.registerSuccessMessage}</Alert> : null}

                <TextField
                  label="Correo del usuario"
                  value={viewModel.registerEmail}
                  onChange={(event) => viewModel.setRegisterEmail(event.target.value)}
                  fullWidth
                />
                <TextField
                  label="Contraseña"
                  type={showRegisterPassword ? "text" : "password"}
                  value={viewModel.registerPassword}
                  onChange={(event) => viewModel.setRegisterPassword(event.target.value)}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowRegisterPassword((value) => !value)}>
                          {showRegisterPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Confirmar contraseña"
                  type={showConfirmPassword ? "text" : "password"}
                  value={viewModel.confirmPassword}
                  onChange={(event) => viewModel.setConfirmPassword(event.target.value)}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword((value) => !value)}>
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  select
                  label="Rol"
                  value={viewModel.selectedRoleId}
                  onChange={(event) => viewModel.setSelectedRoleId(event.target.value)}
                  fullWidth
                  disabled={viewModel.isRolesLoading}
                >
                  {roleOptions.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </TextField>

                <Button variant="contained" color="secondary" onClick={() => void viewModel.register()} disabled={!viewModel.canRegister}>
                  Registrar usuario
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ borderRadius: 4, height: "100%" }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Usuarios
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Consulta separada de usuarios desde su view model.
                    </Typography>
                  </Box>
                  <Button variant="text" onClick={() => void viewModel.loadUsers()}>
                    Recargar
                  </Button>
                </Stack>

                <Stack spacing={1.5}>
                  {viewModel.users.map((user) => (
                    <Box
                      key={user.id}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                      }}
                    >
                      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                        <Box>
                          <Typography fontWeight={700}>{user.email}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Rol: {user.roleName}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={user.isActive ? "Activo" : "Inactivo"} color={user.isActive ? "success" : "default"} />
                          <Chip label={new Date(user.createdAt).toLocaleDateString("es-MX")} variant="outlined" />
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
});
