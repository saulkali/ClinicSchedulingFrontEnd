export type CreateDoctorScheduleEntity = {
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type UpdateDoctorScheduleEntity = CreateDoctorScheduleEntity & {
  isActive: boolean;
};

export type DoctorScheduleEntity = {
  id: string;
  doctorId: string;
  doctorName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string;
};
