import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { UserPicker } from "../../src/components/UserPicker";
import { ActiveUserProvider } from "../../src/context/ActiveUserContext";

const mockGet = vi.fn();

vi.mock("../../src/services/apiClient", () => ({
  apiClient: { get: (...args: unknown[]) => mockGet(...args) },
  setActiveUserId: vi.fn(),
}));

describe("UserPicker", () => {
  it("lists the 5 predefined users and lets one be selected", async () => {
    mockGet.mockResolvedValueOnce([
      { id: "u-pm", name: "김지현 (PM)", role: "PM" },
      { id: "u-eng-1", name: "이서준", role: "Engineer" },
    ]);

    render(
      <ActiveUserProvider>
        <UserPicker />
      </ActiveUserProvider>,
    );

    expect(await screen.findByText("김지현 (PM)")).toBeInTheDocument();
    expect(screen.getByText("이서준")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /이서준/ }));
    expect(localStorage.getItem("taskify.activeUserId")).toBe("u-eng-1");
  });
});
