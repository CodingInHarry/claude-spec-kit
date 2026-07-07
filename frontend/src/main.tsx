import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/Toast";
import { ActiveUserProvider } from "./context/ActiveUserContext";
import "./index.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("#root 엘리먼트를 찾을 수 없습니다.");
}

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <ActiveUserProvider>
          <App />
        </ActiveUserProvider>
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
);
