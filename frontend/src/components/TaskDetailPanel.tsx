import { useEffect, useState } from "react";

import { apiClient } from "../services/apiClient";
import { onCommentCreated } from "../services/socketClient";
import type { Comment, Task, User } from "../types";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";
import { useToast } from "./Toast";

interface Props {
  task: Task;
  members: User[];
  onClose: () => void;
}

export function TaskDetailPanel({ task, members, onClose }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const { showError } = useToast();

  useEffect(() => {
    let active = true;
    apiClient
      .get<Comment[]>(`/tasks/${task.id}/comments`)
      .then((list) => {
        if (active) setComments(list);
      })
      .catch(() => showError("댓글을 불러오지 못했습니다."));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id]);

  useEffect(() => {
    return onCommentCreated((payload) => {
      const comment = payload as Comment;
      if (comment.taskId !== task.id) return;
      setComments((prev) =>
        prev.some((c) => c.id === comment.id) ? prev : [...prev, comment],
      );
    });
  }, [task.id]);

  async function handleSubmitComment(text: string) {
    try {
      await apiClient.post<Comment>(`/tasks/${task.id}/comments`, { text });
    } catch {
      showError("댓글 등록에 실패했습니다.");
    }
  }

  return (
    <div
      role="dialog"
      aria-label={`${task.title} 상세`}
      className="fixed inset-y-0 right-0 w-full max-w-sm overflow-y-auto border-l border-slate-200 bg-white p-4 shadow-xl"
    >
      <button
        type="button"
        onClick={onClose}
        className="mb-3 text-sm text-slate-500 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
      >
        닫기
      </button>
      <h2 className="text-lg font-semibold text-slate-900">{task.title}</h2>
      {task.description && <p className="mt-1 text-sm text-slate-600">{task.description}</p>}

      <h3 className="mb-2 mt-4 text-sm font-semibold text-slate-700">댓글</h3>
      <CommentList comments={comments} members={members} />
      <CommentForm onSubmit={handleSubmitComment} />
    </div>
  );
}
