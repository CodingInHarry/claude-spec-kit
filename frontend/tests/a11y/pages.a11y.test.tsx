import { render, screen } from "@testing-library/react";
import { run, type RunOptions } from "axe-core";
import { describe, expect, it, vi } from "vitest";

import { CommentForm } from "../../src/components/CommentForm";
import { CommentList } from "../../src/components/CommentList";
import { KanbanBoard } from "../../src/components/KanbanBoard";
import { ProjectMembersPanel } from "../../src/components/ProjectMembersPanel";
import { TaskCreateForm } from "../../src/components/TaskCreateForm";
import { ActiveUserProvider } from "../../src/context/ActiveUserContext";
import { UserPicker } from "../../src/components/UserPicker";
import type { Comment, Project, Task, User } from "../../src/types";

vi.mock("../../src/services/apiClient", () => ({
  apiClient: {
    get: vi.fn(async () => [
      { id: "u-pm", name: "김지현 (PM)", role: "PM" },
      { id: "u-eng-1", name: "이서준", role: "Engineer" },
    ]),
  },
}));

const AXE_OPTIONS: RunOptions = {
  // jsdom은 실제 레이아웃/렌더링이 없어 색상 대비 등 시각 규칙은 신뢰할 수 없으므로 제외
  rules: { "color-contrast": { enabled: false } },
};

async function expectNoViolations(container: Element) {
  const results = await run(container, AXE_OPTIONS);
  expect(results.violations).toEqual([]);
}

const members: User[] = [{ id: "u-eng-1", name: "이서준", role: "Engineer" }];

const project: Project = {
  id: "p1",
  name: "테스트 프로젝트",
  description: null,
  createdAt: "",
  members,
};

const tasks: Task[] = [
  {
    id: "t1",
    projectId: "p1",
    title: "칸반 보드 구현",
    description: "설명",
    status: "todo",
    assigneeId: null,
    createdAt: "",
    updatedAt: "",
  },
];

const comments: Comment[] = [
  { id: "c1", taskId: "t1", authorId: "u-eng-1", text: "확인!", createdAt: new Date().toISOString() },
];

describe("접근성 감사 (axe-core)", () => {
  it("UserPicker에 접근성 위반이 없다", async () => {
    const { container } = render(
      <ActiveUserProvider>
        <UserPicker />
      </ActiveUserProvider>,
    );
    await screen.findByText("김지현 (PM)");
    await expectNoViolations(container);
  });

  it("ProjectMembersPanel에 접근성 위반이 없다", async () => {
    const { container } = render(
      <ActiveUserProvider>
        <ProjectMembersPanel project={project} onAddMember={vi.fn()} onRemoveMember={vi.fn()} />
      </ActiveUserProvider>,
    );
    await screen.findByLabelText("추가할 팀원 선택");
    await expectNoViolations(container);
  });

  it("KanbanBoard에 접근성 위반이 없다", async () => {
    const { container } = render(
      <KanbanBoard
        tasks={tasks}
        members={members}
        onReassign={vi.fn()}
        onMoveStatus={vi.fn()}
        onOpenDetail={vi.fn()}
      />,
    );
    await expectNoViolations(container);
  });

  it("TaskCreateForm에 접근성 위반이 없다", async () => {
    const { container } = render(<TaskCreateForm onCreate={vi.fn()} />);
    await expectNoViolations(container);
  });

  it("CommentForm, CommentList에 접근성 위반이 없다", async () => {
    const { container } = render(
      <div>
        <CommentList comments={comments} members={members} />
        <CommentForm onSubmit={vi.fn()} />
      </div>,
    );
    await expectNoViolations(container);
  });
});
