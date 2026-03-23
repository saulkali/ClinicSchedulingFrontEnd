const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const trimLeadingSlash = (value: string) => value.replace(/^\/+/, "");

const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5078");
const authLoginPath = import.meta.env.VITE_AUTH_LOGIN_PATH ?? "/api/auth/login";

export const env = {
  apiBaseUrl,
  authLoginPath: `/${trimLeadingSlash(authLoginPath)}`,
};
