import { DndContext, useDroppable, type DragEndEvent } from "@dnd-kit/core";

import { STATUS_LABELS, STATUS_ORDER, type Task, type TaskStatus, type User } from "../types";
import { TaskCard } from "./TaskCard";

interface Props {
  tasks: Task[];
  members: User[];
  onReassign: (taskId: string, assigneeId: string | null) => void;
  onMoveStatus: (taskId: string, status: TaskStatus) => void;
  onOpenDetail: (taskId: string) => void;
}

function Column({
  status,
  tasks,
  members,
  onReassign,
  onMoveStatus,
  onOpenDetail,
}: {
  status: TaskStatus;
  tasks: Task[];
  members: User[];
  onReassign: Props["onReassign"];
  onMoveStatus: Props["onMoveStatus"];
  onOpenDetail: Props["onOpenDetail"];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[200px] flex-1 flex-col gap-2 rounded-md border p-3 ${
        isOver ? "border-brand-400 bg-brand-50" : "border-slate-200 bg-slate-50"
      }`}
    >
      <h3 className="text-sm font-semibold text-slate-700">{STATUS_LABELS[status]}</h3>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          members={members}
          onReassign={onReassign}
          onMoveStatus={onMoveStatus}
          onOpenDetail={onOpenDetail}
        />
      ))}
    </div>
  );
}

export function KanbanBoard({ tasks, members, onReassign, onMoveStatus, onOpenDetail }: Props) {
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t.id === active.id);
    if (task && task.status !== newStatus) {
      onMoveStatus(task.id, newStatus);
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4">
        {STATUS_ORDER.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            members={members}
            onReassign={onReassign}
            onMoveStatus={onMoveStatus}
            onOpenDetail={onOpenDetail}
          />
        ))}
      </div>
    </DndContext>
  );
}
