import { Alert, Card, CardContent, Chip, Grid, Stack, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import type { RolesViewModel } from "../viewmodels/RolesViewModel";

type RolesViewProps = {
  viewModel: RolesViewModel;
};

export const RolesView = observer(function RolesView({ viewModel }: RolesViewProps) {
  const roles = viewModel.activeRoles;

  return (
    <Stack spacing={2}>
      <Alert severity="info">
        Esta vista concentra la lógica de roles para separar la consulta de <strong>RoleRepository</strong> en su propio view model.
      </Alert>

      {viewModel.errorMessage ? <Alert severity="error">{viewModel.errorMessage}</Alert> : null}

      <Grid container spacing={2}>
        {roles.length ? (
          roles.map((role) => (
            <Grid key={role.id} size={{ xs: 12, md: 4 }}>
              <Card sx={{ borderRadius: 4, height: "100%" }}>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" fontWeight={800}>
                        {role.name}
                      </Typography>
                      <Chip label={role.isActive ? "Activo" : "Inactivo"} color={role.isActive ? "success" : "default"} />
                    </Stack>
                    <Typography color="text.secondary">
                      Rol disponible para autenticar y segmentar el dashboard, perfiles y calendario clínico.
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Creado: {new Date(role.createdAt).toLocaleDateString("es-DO")}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid size={{ xs: 12 }}>
            <Alert severity="warning">No hay roles activos disponibles en este momento.</Alert>
          </Grid>
        )}
      </Grid>
    </Stack>
  );
});
