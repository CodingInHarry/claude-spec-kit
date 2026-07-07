import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TaskCreateForm } from "../../src/components/TaskCreateForm";

describe("TaskCreateForm", () => {
  it("submits title and description and clears the form", async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    render(<TaskCreateForm onCreate={onCreate} />);

    await userEvent.type(screen.getByLabelText("태스크 제목"), "칸반 보드 구현");
    await userEvent.type(screen.getByLabelText("설명 (선택)"), "dnd-kit 사용");
    await userEvent.click(screen.getByRole("button", { name: "태스크 추가" }));

    expect(onCreate).toHaveBeenCalledWith("칸반 보드 구현", "dnd-kit 사용");
    expect(screen.getByLabelText("태스크 제목")).toHaveValue("");
  });

  it("does not submit when the title is empty", async () => {
    const onCreate = vi.fn();
    render(<TaskCreateForm onCreate={onCreate} />);

    await userEvent.click(screen.getByRole("button", { name: "태스크 추가" }));
    expect(onCreate).not.toHaveBeenCalled();
  });
});
