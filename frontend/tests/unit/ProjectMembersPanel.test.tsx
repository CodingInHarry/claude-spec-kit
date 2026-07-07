import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProjectMembersPanel } from "../../src/components/ProjectMembersPanel";
import { ActiveUserProvider } from "../../src/context/ActiveUserContext";
import type { Project } from "../../src/types";

vi.mock("../../src/services/apiClient", () => ({
  apiClient: {
    get: vi.fn(async (path: string) => {
      if (path === "/users") {
        return [
          { id: "u-pm", name: "김지현", role: "PM" },
          { id: "u-eng-1", name: "이서준", role: "Engineer" },
        ];
      }
      return [];
    }),
  },
}));

const project: Project = {
  id: "p1",
  name: "테스트 프로젝트",
  description: null,
  createdAt: new Date().toISOString(),
  members: [{ id: "u-pm", name: "김지현", role: "PM" }],
};

describe("ProjectMembersPanel", () => {
  it("shows current members and lets the user add a new one", async () => {
    const onAddMember = vi.fn().mockResolvedValue(undefined);
    const onRemoveMember = vi.fn().mockResolvedValue(undefined);

    render(
      <ActiveUserProvider>
        <ProjectMembersPanel
          project={project}
          onAddMember={onAddMember}
          onRemoveMember={onRemoveMember}
        />
      </ActiveUserProvider>,
    );

    expect(await screen.findByText(/김지현/)).toBeInTheDocument();

    const select = await screen.findByLabelText("추가할 팀원 선택");
    await userEvent.selectOptions(select, "u-eng-1");
    await userEvent.click(screen.getByRole("button", { name: "추가" }));

    expect(onAddMember).toHaveBeenCalledWith("u-eng-1");
  });

  it("calls onRemoveMember when 제거 is clicked", async () => {
    const onAddMember = vi.fn();
    const onRemoveMember = vi.fn();

    render(
      <ActiveUserProvider>
        <ProjectMembersPanel
          project={project}
          onAddMember={onAddMember}
          onRemoveMember={onRemoveMember}
        />
      </ActiveUserProvider>,
    );

    await userEvent.click(await screen.findByRole("button", { name: "제거" }));
    expect(onRemoveMember).toHaveBeenCalledWith("u-pm");
  });
});
