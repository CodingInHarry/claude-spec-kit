import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ToastProvider } from "../../src/components/Toast";
import { ActiveUserProvider } from "../../src/context/ActiveUserContext";
import { ProjectBoardPage } from "../../src/pages/ProjectBoardPage";
import type { Project, Task } from "../../src/types";

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();
const mockDelete = vi.fn();

vi.mock("../../src/services/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
  setActiveUserId: vi.fn(),
}));

vi.mock("../../src/services/socketClient", () => ({
  joinProjectRoom: vi.fn(),
  leaveProjectRoom: vi.fn(),
  onTaskUpdated: () => () => {},
  onCommentCreated: () => () => {},
}));

const project: Project = {
  id: "p1",
  name: "테스트 프로젝트",
  description: "설명",
  createdAt: "",
  members: [{ id: "u-eng-1", name: "이서준", role: "Engineer" }],
};

const task: Task = {
  id: "t1",
  projectId: "p1",
  title: "기존 태스크",
  description: null,
  status: "todo",
  assigneeId: null,
  createdAt: "",
  updatedAt: "",
};

function setup(tasks: Task[] = [task]) {
  mockGet.mockImplementation((path: string) => {
    if (path === "/projects/p1") return Promise.resolve(project);
    if (path === "/projects/p1/tasks") return Promise.resolve(tasks);
    if (path === "/users") return Promise.resolve([]);
    return Promise.resolve([]);
  });
  return render(
    <ToastProvider>
      <ActiveUserProvider>
        <ProjectBoardPage projectId="p1" onBack={vi.fn()} />
      </ActiveUserProvider>
    </ToastProvider>,
  );
}

describe("ProjectBoardPage", () => {
  it("loads project and tasks, then creates a new task", async () => {
    mockPost.mockResolvedValueOnce({
      id: "t2",
      projectId: "p1",
      title: "새 태스크",
      description: null,
      status: "todo",
      assigneeId: null,
      createdAt: "",
      updatedAt: "",
    });

    setup();

    expect(await screen.findByText("테스트 프로젝트")).toBeInTheDocument();
    expect(await screen.findByText("기존 태스크")).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("태스크 제목"), "새 태스크");
    await userEvent.click(screen.getByRole("button", { name: "태스크 추가" }));

    expect(mockPost).toHaveBeenCalledWith("/projects/p1/tasks", {
      title: "새 태스크",
      description: undefined,
    });
    expect(await screen.findByText("새 태스크")).toBeInTheDocument();
  });

  it("rolls back a task status change when the PATCH request fails", async () => {
    mockPatch.mockRejectedValueOnce(new Error("network error"));

    setup();

    await screen.findByText("기존 태스크");

    await userEvent.selectOptions(screen.getByLabelText("키보드로 상태 변경"), "in_progress");

    expect(await screen.findByText(/이전 상태로 되돌렸습니다/)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByLabelText("키보드로 상태 변경")).toHaveValue("todo"),
    );
  });
});
