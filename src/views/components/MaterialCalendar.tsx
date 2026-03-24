import { Box, Button, Card, Chip, Stack, Typography } from "@mui/material";
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from "@mui/icons-material";
import { createMonthMatrix, isSameMonth, toDateKey } from "../../viewmodels/AppointmentsViewModel";

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export type MaterialCalendarEvent = {
  id: string;
  title: string;
  subtitle?: string;
  color?: "default" | "primary" | "success" | "warning" | "error";
};

type MaterialCalendarProps = {
  month: Date;
  selectedDate?: string;
  enabledDates?: Set<string>;
  eventsByDate?: Record<string, MaterialCalendarEvent[]>;
  helperText?: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelectDate?: (dateKey: string) => void;
};

export function MaterialCalendar({
  month,
  selectedDate,
  enabledDates,
  eventsByDate = {},
  helperText,
  onPreviousMonth,
  onNextMonth,
  onSelectDate,
}: MaterialCalendarProps) {
  const days = createMonthMatrix(month);

  return (
    <Card sx={{ borderRadius: 4, p: 2.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Button startIcon={<ChevronLeftIcon />} onClick={onPreviousMonth}>
          Mes anterior
        </Button>
        <Box textAlign="center">
          <Typography variant="h6" fontWeight={800}>
            {month.toLocaleDateString("es-DO", { month: "long", year: "numeric" })}
          </Typography>
          {helperText ? (
            <Typography variant="body2" color="text.secondary">
              {helperText}
            </Typography>
          ) : null}
        </Box>
        <Button endIcon={<ChevronRightIcon />} onClick={onNextMonth}>
          Mes siguiente
        </Button>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 1,
        }}
      >
        {weekDays.map((day) => (
          <Typography key={day} variant="caption" fontWeight={800} color="text.secondary" sx={{ px: 1 }}>
            {day}
          </Typography>
        ))}

        {days.map((day) => {
          const dateKey = toDateKey(day);
          const isCurrentMonth = isSameMonth(day, month);
          const isEnabled = enabledDates ? enabledDates.has(dateKey) : true;
          const isSelected = selectedDate === dateKey;
          const events = eventsByDate[dateKey] ?? [];

          return (
            <Box
              key={dateKey}
              onClick={() => {
                if (isEnabled && onSelectDate) {
                  onSelectDate(dateKey);
                }
              }}
              sx={{
                minHeight: 120,
                borderRadius: 3,
                border: isSelected ? "2px solid" : "1px solid",
                borderColor: isSelected ? "primary.main" : "divider",
                bgcolor: isEnabled ? "background.paper" : "action.hover",
                opacity: isCurrentMonth ? 1 : 0.45,
                p: 1,
                cursor: isEnabled && onSelectDate ? "pointer" : "default",
                transition: "all 0.2s ease",
                '&:hover': isEnabled && onSelectDate ? { boxShadow: 3, transform: 'translateY(-1px)' } : undefined,
              }}
            >
              <Stack spacing={0.75}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={700}>{day.getDate()}</Typography>
                  {isEnabled ? <Chip label="Disponible" size="small" color="primary" variant="outlined" /> : null}
                </Stack>

                {events.slice(0, 3).map((event) => (
                  <Chip
                    key={event.id}
                    label={event.title}
                    color={event.color ?? "default"}
                    size="small"
                    sx={{ justifyContent: "flex-start", '& .MuiChip-label': { px: 1, width: '100%' } }}
                  />
                ))}

                {events.length > 3 ? (
                  <Typography variant="caption" color="text.secondary">
                    +{events.length - 3} más
                  </Typography>
                ) : null}
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}