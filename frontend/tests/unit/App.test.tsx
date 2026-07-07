import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { App } from "../../src/App";
import { ActiveUserProvider } from "../../src/context/ActiveUserContext";

const mockGet = vi.fn();

vi.mock("../../src/services/apiClient", () => ({
  apiClient: { get: (...args: unknown[]) => mockGet(...args) },
}));

vi.mock("../../src/pages/ProjectListPage", () => ({
  ProjectListPage: ({ onOpenProject }: { onOpenProject: (id: string) => void }) => (
    <button onClick={() => onOpenProject("p1")}>프로젝트 열기</button>
  ),
}));

vi.mock("../../src/pages/ProjectBoardPage", () => ({
  ProjectBoardPage: ({ onBack }: { onBack: () => void }) => (
    <button onClick={onBack}>목록으로</button>
  ),
}));

describe("App", () => {
  it("shows the user picker until a user is selected, then navigates between pages", async () => {
    mockGet.mockResolvedValue([{ id: "u-pm", name: "김지현 (PM)", role: "PM" }]);

    render(
      <ActiveUserProvider>
        <App />
      </ActiveUserProvider>,
    );

    const userButton = await screen.findByRole("button", { name: /김지현/ });
    await userEvent.click(userButton);

    expect(await screen.findByText("Taskify")).toBeInTheDocument();
    expect(screen.getByText("프로젝트 열기")).toBeInTheDocument();

    await userEvent.click(screen.getByText("프로젝트 열기"));
    expect(await screen.findByText("목록으로")).toBeInTheDocument();

    await userEvent.click(screen.getByText("목록으로"));
    expect(await screen.findByText("프로젝트 열기")).toBeInTheDocument();
  });
});
