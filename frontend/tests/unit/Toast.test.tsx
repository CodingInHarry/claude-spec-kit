import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ToastProvider, useToast } from "../../src/components/Toast";

function Consumer() {
  const { showError, showInfo } = useToast();
  return (
    <div>
      <button onClick={() => showError("에러 메시지")}>에러 트리거</button>
      <button onClick={() => showInfo("안내 메시지")}>안내 트리거</button>
    </div>
  );
}

describe("Toast", () => {
  it("shows error and info toasts when triggered", async () => {
    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>,
    );

    await userEvent.click(screen.getByText("에러 트리거"));
    expect(await screen.findByText("에러 메시지")).toBeInTheDocument();

    await userEvent.click(screen.getByText("안내 트리거"));
    expect(await screen.findByText("안내 메시지")).toBeInTheDocument();
  });
});
