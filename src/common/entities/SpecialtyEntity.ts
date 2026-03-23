export type CreateSpecialtyEntity = {
  name: string;
  appointmentDurationMinutes: number;
};

export type UpdateSpecialtyEntity = CreateSpecialtyEntity & {
  isActive: boolean;
};

export type SpecialtyEntity = {
  id: string;
  name: string;
  appointmentDurationMinutes: number;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string;
};
