import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CommentList } from "../../src/components/CommentList";
import type { Comment, User } from "../../src/types";

const members: User[] = [{ id: "u-eng-1", name: "이서준", role: "Engineer" }];

describe("CommentList", () => {
  it("shows a placeholder when there are no comments", () => {
    render(<CommentList comments={[]} members={members} />);
    expect(screen.getByText("아직 댓글이 없습니다.")).toBeInTheDocument();
  });

  it("renders comments with the author's display name", () => {
    const comments: Comment[] = [
      {
        id: "c1",
        taskId: "t1",
        authorId: "u-eng-1",
        text: "확인했습니다!",
        createdAt: new Date().toISOString(),
      },
    ];

    render(<CommentList comments={comments} members={members} />);

    expect(screen.getByText("확인했습니다!")).toBeInTheDocument();
    expect(screen.getByText("이서준")).toBeInTheDocument();
  });
});
