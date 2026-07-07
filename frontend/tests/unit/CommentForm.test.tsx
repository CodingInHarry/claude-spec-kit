import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CommentForm } from "../../src/components/CommentForm";

describe("CommentForm", () => {
  it("submits the entered text and clears the input", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CommentForm onSubmit={onSubmit} />);

    const input = screen.getByLabelText("댓글 작성");
    await userEvent.type(input, "확인했습니다!");
    await userEvent.click(screen.getByRole("button", { name: "등록" }));

    expect(onSubmit).toHaveBeenCalledWith("확인했습니다!");
    expect(input).toHaveValue("");
  });

  it("rejects an empty comment without calling onSubmit", async () => {
    const onSubmit = vi.fn();
    render(<CommentForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: "등록" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("댓글 내용을 입력해 주세요.");
  });
});
