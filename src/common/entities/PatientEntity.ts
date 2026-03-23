export type CreatePatientEntity = {
  userId: string;
  name: string;
  birthDate?: string | null;
  phone?: string;
};

export type UpdatePatientEntity = CreatePatientEntity & {
  isActive: boolean;
};

export type PatientEntity = {
  id: string;
  userId: string;
  userEmail: string;
  name: string;
  birthDate?: string | null;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string;
};
