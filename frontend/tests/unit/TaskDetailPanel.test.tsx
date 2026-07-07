import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TaskDetailPanel } from "../../src/components/TaskDetailPanel";
import { ToastProvider } from "../../src/components/Toast";
import type { Task, User } from "../../src/types";

const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock("../../src/services/apiClient", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

vi.mock("../../src/services/socketClient", () => ({
  onCommentCreated: () => () => {},
}));

const members: User[] = [{ id: "u-eng-1", name: "이서준", role: "Engineer" }];

const task: Task = {
  id: "t1",
  projectId: "p1",
  title: "칸반 보드 구현",
  description: "dnd-kit 사용",
  status: "todo",
  assigneeId: null,
  createdAt: "",
  updatedAt: "",
};

describe("TaskDetailPanel", () => {
  it("loads and shows comments, and posts a new one", async () => {
    mockGet.mockResolvedValueOnce([
      { id: "c1", taskId: "t1", authorId: "u-eng-1", text: "확인!", createdAt: new Date().toISOString() },
    ]);
    mockPost.mockResolvedValueOnce({});

    const onClose = vi.fn();
    render(
      <ToastProvider>
        <TaskDetailPanel task={task} members={members} onClose={onClose} />
      </ToastProvider>,
    );

    expect(screen.getByText("칸반 보드 구현")).toBeInTheDocument();
    expect(await screen.findByText("확인!")).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("댓글 작성"), "저도 확인했어요");
    await userEvent.click(screen.getByRole("button", { name: "등록" }));

    expect(mockPost).toHaveBeenCalledWith("/tasks/t1/comments", { text: "저도 확인했어요" });

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(onClose).toHaveBeenCalled();
  });
});
