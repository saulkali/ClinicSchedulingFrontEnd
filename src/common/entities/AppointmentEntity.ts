export type AppointmentStatus = "Programada" | "Confirmada" | "Completada" | "Cancelada";

export type AppointmentEntity = {
  id: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  patientEmail: string;
  specialty: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  notes?: string;
};

export type CreateAppointmentEntity = Omit<AppointmentEntity, "id" | "doctorName" | "specialty" | "status"> & {
  status?: AppointmentStatus;
};
