const userIdClaimKeys = [
  "sub",
  "nameid",
  "userId",
  "uid",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
];

const roleClaimKeys = [
  "role",
  "roles",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
];

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return window.atob(padded);
};

export const parseJwtPayload = (token: string): Record<string, unknown> | null => {
  const parts = token.split(".");

  if (parts.length < 2) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(parts[1])) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const getUserIdFromToken = (token: string) => {
  const payload = parseJwtPayload(token);

  if (!payload) {
    return "";
  }

  const key = userIdClaimKeys.find((claimKey) => typeof payload[claimKey] === "string");
  return key ? String(payload[key]) : "";
};

export const getRoleFromToken = (token: string) => {
  const payload = parseJwtPayload(token);

  if (!payload) {
    return "";
  }

  for (const key of roleClaimKeys) {
    const value = payload[key];

    if (typeof value === "string") {
      return value;
    }

    if (Array.isArray(value) && typeof value[0] === "string") {
      return value[0];
    }
  }

  return "";
};
