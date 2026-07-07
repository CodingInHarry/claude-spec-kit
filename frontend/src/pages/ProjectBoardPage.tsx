import { useCallback, useEffect, useState } from "react";

import { KanbanBoard } from "../components/KanbanBoard";
import { ProjectMembersPanel } from "../components/ProjectMembersPanel";
import { TaskCreateForm } from "../components/TaskCreateForm";
import { TaskDetailPanel } from "../components/TaskDetailPanel";
import { useToast } from "../components/Toast";
import { apiClient } from "../services/apiClient";
import { joinProjectRoom, leaveProjectRoom, onTaskUpdated } from "../services/socketClient";
import type { Project, Task, TaskStatus } from "../types";

interface Props {
  projectId: string;
  onBack: () => void;
}

export function ProjectBoardPage({ projectId, onBack }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { showError } = useToast();

  const reloadProject = useCallback(async () => {
    try {
      const p = await apiClient.get<Project>(`/projects/${projectId}`);
      setProject(p);
    } catch {
      showError("프로젝트 정보를 불러오지 못했습니다.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const reloadTasks = useCallback(async () => {
    try {
      const list = await apiClient.get<Task[]>(`/projects/${projectId}/tasks`);
      setTasks(list);
    } catch {
      showError("태스크 목록을 불러오지 못했습니다.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- projectId 변경 시 데이터 재조회
    void reloadProject();
    void reloadTasks();
  }, [reloadProject, reloadTasks]);

  useEffect(() => {
    joinProjectRoom(projectId);
    const unsubscribe = onTaskUpdated((payload) => {
      const updated = payload as Task;
      setTasks((prev) => {
        const exists = prev.some((t) => t.id === updated.id);
        return exists ? prev.map((t) => (t.id === updated.id ? updated : t)) : [...prev, updated];
      });
    });
    return () => {
      unsubscribe();
      leaveProjectRoom(projectId);
    };
  }, [projectId]);

  async function handleAddMember(userId: string) {
    try {
      await apiClient.post(`/projects/${projectId}/members`, { userId });
      await reloadProject();
    } catch {
      showError("팀원 추가에 실패했습니다.");
    }
  }

  async function handleRemoveMember(userId: string) {
    try {
      await apiClient.delete(`/projects/${projectId}/members/${userId}`);
      await reloadProject();
    } catch {
      showError("팀원 제거에 실패했습니다.");
    }
  }

  async function handleCreateTask(title: string, description: string) {
    try {
      const task = await apiClient.post<Task>(`/projects/${projectId}/tasks`, {
        title,
        description: description || undefined,
      });
      setTasks((prev) => [...prev, task]);
    } catch {
      showError("태스크 생성에 실패했습니다.");
    }
  }

  async function patchTask(taskId: string, changes: Partial<Task>, revert: Task) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...changes } : t)));
    try {
      const updated = await apiClient.patch<Task>(`/tasks/${taskId}`, changes);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? revert : t)));
      showError("변경 사항을 저장하지 못했습니다. 이전 상태로 되돌렸습니다.");
    }
  }

  async function handleMoveStatus(taskId: string, status: TaskStatus) {
    const current = tasks.find((t) => t.id === taskId);
    if (!current) return;
    await patchTask(taskId, { status }, current);
  }

  async function handleReassign(taskId: string, assigneeId: string | null) {
    const current = tasks.find((t) => t.id === taskId);
    if (!current) return;
    await patchTask(taskId, { assigneeId }, current);
  }

  if (!project) {
    return <p className="p-6 text-slate-500">불러오는 중...</p>;
  }

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 text-sm text-brand-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
      >
        ← 프로젝트 목록으로
      </button>
      <h1 className="text-2xl font-semibold text-slate-900">{project.name}</h1>
      {project.description && <p className="mb-4 text-slate-600">{project.description}</p>}

      <div className="mt-4 grid gap-6 md:grid-cols-[3fr_1fr]">
        <div>
          <TaskCreateForm onCreate={handleCreateTask} />
          <KanbanBoard
            tasks={tasks}
            members={project.members}
            onReassign={handleReassign}
            onMoveStatus={handleMoveStatus}
            onOpenDetail={setSelectedTaskId}
          />
        </div>
        <ProjectMembersPanel
          project={project}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
        />
      </div>

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          members={project.members}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}
