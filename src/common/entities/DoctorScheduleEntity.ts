export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DoctorScheduleEntity = {
  id: string;
  doctorId: string;
  weekday: Weekday;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  isActive: boolean;
};

export type CreateDoctorScheduleEntity = Omit<DoctorScheduleEntity, "id">;
export type UpdateDoctorScheduleEntity = Partial<Omit<DoctorScheduleEntity, "id" | "doctorId">>;
