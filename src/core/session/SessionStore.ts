import { makeAutoObservable } from "mobx";

type SessionData = {
  token: string;
  role: string;
  email: string;
  refreshToken?: string;
  expiresAt?: string;
};

const SESSION_STORAGE_KEY = "clinic-scheduling-session";

class SessionStore {
  token = "";
  role = "";
  email = "";
  refreshToken = "";
  expiresAt = "";

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.hydrate();
  }

  get isLoggedIn() {
    return Boolean(this.token && this.email);
  }

  hydrate() {
    const storageValue = window.localStorage.getItem(SESSION_STORAGE_KEY);

    if (!storageValue) {
      return;
    }

    try {
      const session = JSON.parse(storageValue) as SessionData;
      this.token = session.token;
      this.role = session.role;
      this.email = session.email;
      this.refreshToken = session.refreshToken ?? "";
      this.expiresAt = session.expiresAt ?? "";
    } catch {
      this.clearSession();
    }
  }

  setSession(session: SessionData) {
    this.token = session.token;
    this.role = session.role;
    this.email = session.email;
    this.refreshToken = session.refreshToken ?? "";
    this.expiresAt = session.expiresAt ?? "";

    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        token: this.token,
        role: this.role,
        email: this.email,
        refreshToken: this.refreshToken,
        expiresAt: this.expiresAt,
      })
    );
  }

  clearSession() {
    this.token = "";
    this.role = "";
    this.email = "";
    this.refreshToken = "";
    this.expiresAt = "";
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

export const sessionStore = new SessionStore();
