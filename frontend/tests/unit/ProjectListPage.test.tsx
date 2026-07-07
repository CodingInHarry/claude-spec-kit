import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProjectListPage } from "../../src/pages/ProjectListPage";

const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock("../../src/services/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

vi.mock("../../src/components/Toast", () => ({
  useToast: () => ({ showError: vi.fn(), showInfo: vi.fn() }),
}));

describe("ProjectListPage", () => {
  it("renders fetched projects and opens one on click", async () => {
    mockGet.mockResolvedValueOnce([
      { id: "p1", name: "런칭 준비", description: null, createdAt: "", members: [] },
    ]);
    const onOpenProject = vi.fn();

    render(<ProjectListPage onOpenProject={onOpenProject} />);

    expect(await screen.findByText("런칭 준비")).toBeInTheDocument();
    await userEvent.click(screen.getByText("런칭 준비"));
    expect(onOpenProject).toHaveBeenCalledWith("p1");
  });

  it("creates a project via the form", async () => {
    mockGet.mockResolvedValueOnce([]).mockResolvedValueOnce([
      { id: "p2", name: "새 프로젝트", description: null, createdAt: "", members: [] },
    ]);
    mockPost.mockResolvedValueOnce({});

    render(<ProjectListPage onOpenProject={vi.fn()} />);

    await screen.findByText("아직 프로젝트가 없습니다.");
    await userEvent.type(screen.getByLabelText("새 프로젝트 이름"), "새 프로젝트");
    await userEvent.click(screen.getByRole("button", { name: "프로젝트 생성" }));

    expect(mockPost).toHaveBeenCalledWith("/projects", {
      name: "새 프로젝트",
      description: undefined,
    });
  });
});
