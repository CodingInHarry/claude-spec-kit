import type { Comment, User } from "../types";

interface Props {
  comments: Comment[];
  members: User[];
}

export function CommentList({ comments, members }: Props) {
  if (comments.length === 0) {
    return <p className="text-sm text-slate-400">아직 댓글이 없습니다.</p>;
  }

  return (
    <ul className="flex flex-col gap-2" aria-label="댓글 목록">
      {comments.map((comment) => {
        const author = members.find((m) => m.id === comment.authorId);
        return (
          <li key={comment.id} className="rounded bg-slate-50 p-2 text-sm">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-700">{author?.name ?? comment.authorId}</span>
              <time dateTime={comment.createdAt}>
                {new Date(comment.createdAt).toLocaleString("ko-KR")}
              </time>
            </div>
            <p className="mt-1 text-slate-800">{comment.text}</p>
          </li>
        );
      })}
    </ul>
  );
}
