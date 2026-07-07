import { prisma } from "../models/prisma.js";
import { badRequest, notFound } from "../api/errors.js";
import { isTaskStatus } from "../models/constants.js";
import { getProject, isProjectMember } from "./projectService.js";

export interface CreateTaskInput {
  title: string;
  description?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: string;
  assigneeId?: string | null;
}

function toTaskDto(task: {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  assigneeId: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status,
    assigneeId: task.assigneeId,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export async function listTasksForProject(projectId: string) {
  await getProject(projectId);
  const tasks = await prisma.task.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });
  return tasks.map(toTaskDto);
}

export async function createTask(projectId: string, input: CreateTaskInput) {
  const title = input.title?.trim();
  if (!title) {
    throw badRequest("TASK_TITLE_REQUIRED", "태스크 제목은 필수입니다.");
  }
  await getProject(projectId);

  const task = await prisma.task.create({
    data: {
      projectId,
      title,
      description: input.description?.trim() || null,
      status: "todo",
    },
  });
  return toTaskDto(task);
}

export async function getTaskRecord(taskId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw notFound("task", taskId);
  }
  return task;
}

export async function getTask(taskId: string) {
  return toTaskDto(await getTaskRecord(taskId));
}

export async function updateTask(taskId: string, input: UpdateTaskInput) {
  const existing = await getTaskRecord(taskId);

  if (input.status !== undefined && !isTaskStatus(input.status)) {
    throw badRequest("INVALID_TASK_STATUS", `유효하지 않은 상태입니다: ${input.status}`);
  }

  if (input.assigneeId) {
    const isMember = await isProjectMember(existing.projectId, input.assigneeId);
    if (!isMember) {
      throw badRequest(
        "ASSIGNEE_NOT_PROJECT_MEMBER",
        "담당자는 해당 프로젝트의 팀원이어야 합니다.",
        { assigneeId: input.assigneeId },
      );
    }
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      title: input.title?.trim() || undefined,
      description: input.description !== undefined ? input.description.trim() || null : undefined,
      status: input.status,
      assigneeId: input.assigneeId === undefined ? undefined : input.assigneeId,
    },
  });
  return toTaskDto(task);
}
