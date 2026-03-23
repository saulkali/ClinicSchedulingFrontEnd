import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Alert, Card, CardContent, Chip, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import { Security as SecurityIcon } from "@mui/icons-material";
import type { RolesViewModel } from "../viewmodels/RolesViewModel";

type RolesViewProps = {
  viewModel: RolesViewModel;
};

export const RolesView = observer(function RolesView({ viewModel }: RolesViewProps) {
  useEffect(() => {
    void viewModel.loadRoles();
  }, [viewModel]);

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4" fontWeight={800}>
          RolesView
        </Typography>
        <Typography color="text.secondary">
          Vista especializada para la consulta de roles desde su propio view model.
        </Typography>
      </Stack>

      {viewModel.errorMessage ? <Alert severity="warning">{viewModel.errorMessage}</Alert> : null}
      {viewModel.helperMessage ? <Alert severity="info">{viewModel.helperMessage}</Alert> : null}

      {viewModel.isLoading ? <CircularProgress /> : null}

      <Grid container spacing={2}>
        {viewModel.activeRoles.map((role) => (
          <Grid size={{ xs: 12, md: 4 }} key={role.id}>
            <Card sx={{ borderRadius: 4, height: "100%" }}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <SecurityIcon color="primary" />
                      <Typography variant="h6" fontWeight={700}>
                        {role.name}
                      </Typography>
                    </Stack>
                    <Chip label={role.isActive ? "Activo" : "Inactivo"} color={role.isActive ? "success" : "default"} />
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    ID: {role.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Creado: {new Date(role.createdAt).toLocaleString("es-MX")}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
});
