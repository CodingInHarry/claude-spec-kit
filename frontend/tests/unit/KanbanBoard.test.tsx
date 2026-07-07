import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { KanbanBoard } from "../../src/components/KanbanBoard";
import type { Task, User } from "../../src/types";

const members: User[] = [{ id: "u-eng-1", name: "이서준", role: "Engineer" }];

const tasks: Task[] = [
  {
    id: "t1",
    projectId: "p1",
    title: "할 일 카드",
    description: null,
    status: "todo",
    assigneeId: null,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "t2",
    projectId: "p1",
    title: "진행 중 카드",
    description: null,
    status: "in_progress",
    assigneeId: "u-eng-1",
    createdAt: "",
    updatedAt: "",
  },
];

describe("KanbanBoard", () => {
  it("groups tasks into the correct status columns", () => {
    render(
      <KanbanBoard
        tasks={tasks}
        members={members}
        onReassign={vi.fn()}
        onMoveStatus={vi.fn()}
        onOpenDetail={vi.fn()}
      />,
    );

    const todoColumn = screen.getByRole("heading", { name: "To Do" }).closest("div")!;
    expect(within(todoColumn).getByText("할 일 카드")).toBeInTheDocument();

    const progressColumn = screen.getByRole("heading", { name: "In Progress" }).closest("div")!;
    expect(within(progressColumn).getByText("진행 중 카드")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Done" })).toBeInTheDocument();
  });
});
