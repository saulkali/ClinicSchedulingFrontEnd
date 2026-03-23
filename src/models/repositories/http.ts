import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "../../common/config/env";
import { sessionStore } from "../../common/session/SessionStore";

export const createApiClient = () => {
  const client = axios.create({
    baseURL: env.apiBaseUrl,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (sessionStore.token) {
      config.headers.Authorization = `Bearer ${sessionStore.token}`;
    }

    return config;
  });

  return client;
};

export const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data;

    if (typeof responseData === "string" && responseData.trim()) {
      return responseData;
    }

    if (
      typeof responseData === "object" &&
      responseData !== null &&
      "message" in responseData &&
      typeof responseData.message === "string"
    ) {
      return responseData.message;
    }
  }

  return fallbackMessage;
};
