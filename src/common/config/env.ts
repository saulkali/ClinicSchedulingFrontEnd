const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const trimLeadingSlash = (value: string) => value.replace(/^\/+/, "");

const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5078");
const authLoginPath = import.meta.env.VITE_AUTH_LOGIN_PATH ?? "/api/auth/login";
const rolePath = import.meta.env.VITE_ROLE_PATH ?? "/api/role";
const userPath = import.meta.env.VITE_USER_PATH ?? "/api/user";
const doctorPath = import.meta.env.VITE_DOCTOR_PATH ?? "/api/doctor";
const patientPath = import.meta.env.VITE_PATIENT_PATH ?? "/api/patient";
const specialtyPath = import.meta.env.VITE_SPECIALTY_PATH ?? "/api/specialty";
const appointmentPath = import.meta.env.VITE_APPOINTMENT_PATH ?? "/api/appointment";
const doctorSchedulePath = import.meta.env.VITE_DOCTOR_SCHEDULE_PATH ?? "/api/DoctorSchedule";

export const env = {
  apiBaseUrl,
  authLoginPath: `/${trimLeadingSlash(authLoginPath)}`,
  rolePath: `/${trimLeadingSlash(rolePath)}`,
  userPath: `/${trimLeadingSlash(userPath)}`,
  doctorPath: `/${trimLeadingSlash(doctorPath)}`,
  patientPath: `/${trimLeadingSlash(patientPath)}`,
  specialtyPath: `/${trimLeadingSlash(specialtyPath)}`,
  appointmentPath: `/${trimLeadingSlash(appointmentPath)}`,
  doctorSchedulePath: `/${trimLeadingSlash(doctorSchedulePath)}`,
};
