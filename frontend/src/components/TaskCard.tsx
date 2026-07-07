import { useDraggable } from "@dnd-kit/core";

import { STATUS_LABELS, STATUS_ORDER, type Task, type TaskStatus, type User } from "../types";

interface Props {
  task: Task;
  members: User[];
  onReassign: (taskId: string, assigneeId: string | null) => void;
  onMoveStatus: (taskId: string, status: TaskStatus) => void;
  onOpenDetail: (taskId: string) => void;
}

export function TaskCard({ task, members, onReassign, onMoveStatus, onOpenDetail }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });
  const assignee = members.find((m) => m.id === task.assigneeId);

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-md border border-slate-200 bg-white p-3 shadow-sm ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div
        {...listeners}
        {...attributes}
        role="button"
        tabIndex={0}
        aria-label={`${task.title} 드래그하여 상태 변경`}
        className="cursor-grab font-medium text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
      >
        {task.title}
      </div>
      {task.description && <p className="mt-1 text-xs text-slate-500">{task.description}</p>}

      <button
        type="button"
        onClick={() => onOpenDetail(task.id)}
        className="mt-1 text-xs text-brand-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
      >
        댓글 보기
      </button>

      <div className="mt-2 flex flex-col gap-1">
        <label className="text-xs text-slate-500" htmlFor={`assignee-${task.id}`}>
          담당자
        </label>
        <select
          id={`assignee-${task.id}`}
          className="rounded border border-slate-300 px-2 py-1 text-xs"
          value={task.assigneeId ?? ""}
          onChange={(e) => onReassign(task.id, e.target.value || null)}
        >
          <option value="">미할당</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        {!assignee && task.assigneeId && (
          <span className="text-xs text-amber-600">미할당(팀원 아님)</span>
        )}
      </div>

      <div className="mt-2 flex flex-col gap-1">
        <label className="text-xs text-slate-500" htmlFor={`status-${task.id}`}>
          키보드로 상태 변경
        </label>
        <select
          id={`status-${task.id}`}
          className="rounded border border-slate-300 px-2 py-1 text-xs"
          value={task.status}
          onChange={(e) => onMoveStatus(task.id, e.target.value as TaskStatus)}
        >
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
