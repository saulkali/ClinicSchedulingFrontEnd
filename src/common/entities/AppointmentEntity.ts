export type CreateAppointmentEntity = {
  doctorId: string;
  patientId: string;
  startDateTime: string;
  endDateTime: string;
  durationMinutes: number;
  reason?: string;
  status: string;
  cancellationReason?: string;
};

export type UpdateAppointmentEntity = CreateAppointmentEntity & {
  isActive: boolean;
};

export type AppointmentEntity = {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  startDateTime: string;
  endDateTime: string;
  durationMinutes: number;
  reason?: string | null;
  status: string;
  cancellationReason?: string | null;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string;
};
