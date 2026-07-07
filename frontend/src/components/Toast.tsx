import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface ToastMessage {
  id: number;
  text: string;
  tone: "error" | "info";
}

interface ToastContextValue {
  showError: (text: string) => void;
  showInfo: (text: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const push = useCallback((text: string, tone: ToastMessage["tone"]) => {
    const id = nextId++;
    setMessages((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }, 4000);
  }, []);

  const showError = useCallback((text: string) => push(text, "error"), [push]);
  const showInfo = useCallback((text: string) => push(text, "info"), [push]);

  return (
    <ToastContext.Provider value={{ showError, showInfo }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`pointer-events-auto rounded-md px-4 py-2 text-sm text-white shadow-lg ${
              m.tone === "error" ? "bg-red-600" : "bg-slate-800"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast는 ToastProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
}
