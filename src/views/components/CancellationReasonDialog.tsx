import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type CancellationReasonDialogProps = {
  open: boolean;
  reason: string;
  onReasonChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export function CancellationReasonDialog({
  open,
  reason,
  onReasonChange,
  onConfirm,
  onClose,
}: CancellationReasonDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cancelar cita</DialogTitle>
      <DialogContent>
        <Stack spacing={1.25} sx={{ mt: 0.5 }}>
          <Typography color="text.secondary">
            Indica el motivo de cancelación para registrarlo en el historial de la cita.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            label="Motivo de cancelación"
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Volver</Button>
        <Button color="error" variant="contained" onClick={onConfirm}>
          Confirmar cancelación
        </Button>
      </DialogActions>
    </Dialog>
  );
}
