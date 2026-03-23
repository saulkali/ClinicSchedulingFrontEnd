import type { Weekday } from "../entities/DoctorScheduleEntity";

const weekdayLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const monthLabels = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const startOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate());

export const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

export const isPastDay = (value: Date) => startOfDay(value).getTime() < startOfDay(new Date()).getTime();

export const toDateInputValue = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatWeekday = (weekday: Weekday) => weekdayLabels[weekday];

export const formatDateLong = (value: Date) =>
  `${weekdayLabels[value.getDay()]}, ${value.getDate()} de ${monthLabels[value.getMonth()]} de ${value.getFullYear()}`;

export const formatDateTime = (value: string) => {
  const date = new Date(value);
  return `${formatDateLong(date)} · ${date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

export const startOfMonthGrid = (viewDate: Date) => {
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  return new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() - firstDay.getDay());
};

export const buildMonthGrid = (viewDate: Date) => {
  const start = startOfMonthGrid(viewDate);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
};

export const combineDateAndTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
};

export const addMinutes = (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60000);
