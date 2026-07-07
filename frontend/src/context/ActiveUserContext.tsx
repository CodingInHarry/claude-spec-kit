import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { apiClient, setActiveUserId } from "../services/apiClient";
import type { User } from "../types";

const STORAGE_KEY = "taskify.activeUserId";

interface ActiveUserContextValue {
  users: User[];
  activeUser: User | null;
  loading: boolean;
  selectUser: (userId: string) => void;
  clearUser: () => void;
}

const ActiveUserContext = createContext<ActiveUserContextValue | undefined>(undefined);

export function ActiveUserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUserId, setActiveUserIdState] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveUserId(activeUserId);
  }, [activeUserId]);

  useEffect(() => {
    async function loadUsers() {
      setActiveUserId("bootstrap");
      try {
        const list = await apiClient.get<User[]>("/users");
        setUsers(list);
      } finally {
        setActiveUserId(activeUserId);
        setLoading(false);
      }
    }
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeUser = useMemo(
    () => users.find((u) => u.id === activeUserId) ?? null,
    [users, activeUserId],
  );

  function selectUser(userId: string) {
    localStorage.setItem(STORAGE_KEY, userId);
    setActiveUserIdState(userId);
  }

  function clearUser() {
    localStorage.removeItem(STORAGE_KEY);
    setActiveUserIdState(null);
  }

  return (
    <ActiveUserContext.Provider value={{ users, activeUser, loading, selectUser, clearUser }}>
      {children}
    </ActiveUserContext.Provider>
  );
}

export function useActiveUser(): ActiveUserContextValue {
  const ctx = useContext(ActiveUserContext);
  if (!ctx) {
    throw new Error("useActiveUser는 ActiveUserProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
}
