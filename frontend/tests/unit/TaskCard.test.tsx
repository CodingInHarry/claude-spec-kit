import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TaskCard } from "../../src/components/TaskCard";
import type { Task, User } from "../../src/types";

const members: User[] = [
  { id: "u-eng-1", name: "이서준", role: "Engineer" },
  { id: "u-eng-2", name: "박민아", role: "Engineer" },
];

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

describe("TaskCard", () => {
  it("shows the task title and lets you reassign the task", async () => {
    const onReassign = vi.fn();
    const onMoveStatus = vi.fn();

    render(
      <TaskCard
        task={task}
        members={members}
        onReassign={onReassign}
        onMoveStatus={onMoveStatus}
        onOpenDetail={vi.fn()}
      />,
    );

    expect(screen.getByText("칸반 보드 구현")).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText("담당자"), "u-eng-1");
    expect(onReassign).toHaveBeenCalledWith("t1", "u-eng-1");
  });

  it("allows changing status via the keyboard-accessible select", async () => {
    const onReassign = vi.fn();
    const onMoveStatus = vi.fn();

    render(
      <TaskCard
        task={task}
        members={members}
        onReassign={onReassign}
        onMoveStatus={onMoveStatus}
        onOpenDetail={vi.fn()}
      />,
    );

    await userEvent.selectOptions(screen.getByLabelText("키보드로 상태 변경"), "in_progress");
    expect(onMoveStatus).toHaveBeenCalledWith("t1", "in_progress");
  });
});
