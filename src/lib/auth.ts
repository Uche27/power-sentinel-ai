export interface User {
  name: string;
  email: string;
  role: "Admin" | "Analyst" | "Utility Staff";
}

const KEY = "et-auth-user";

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(KEY);
    return v ? (JSON.parse(v) as User) : null;
  } catch {
    return null;
  }
}

export function setUser(u: User) {
  localStorage.setItem(KEY, JSON.stringify(u));
}

export function clearUser() {
  localStorage.removeItem(KEY);
}
