import { prisma } from "../models/prisma.js";
import { badRequest, notFound } from "../api/errors.js";
import { assertUsersExist } from "./userService.js";

export interface CreateProjectInput {
  name: string;
  description?: string;
}

const projectWithMembers = {
  include: { members: { include: { user: true } } },
} as const;

function toProjectDto(project: {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  members: { user: { id: string; name: string; role: string } }[];
}) {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    createdAt: project.createdAt.toISOString(),
    members: project.members.map((m) => m.user),
  };
}

export async function listProjects() {
  const projects = await prisma.project.findMany({
    ...projectWithMembers,
    orderBy: { createdAt: "desc" },
  });
  return projects.map(toProjectDto);
}

export async function getProject(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    ...projectWithMembers,
  });
  if (!project) {
    throw notFound("project", projectId);
  }
  return toProjectDto(project);
}

export async function createProject(input: CreateProjectInput) {
  const name = input.name?.trim();
  if (!name) {
    throw badRequest("PROJECT_NAME_REQUIRED", "프로젝트 이름은 필수입니다.");
  }
  const project = await prisma.project.create({
    data: { name, description: input.description?.trim() || null },
    ...projectWithMembers,
  });
  return toProjectDto(project);
}

export async function addProjectMember(projectId: string, userId: string) {
  await getProject(projectId);
  await assertUsersExist([userId]);

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId, userId } },
    update: {},
    create: { projectId, userId },
  });

  return getProject(projectId);
}

export async function removeProjectMember(projectId: string, userId: string) {
  await getProject(projectId);
  await prisma.projectMember.deleteMany({ where: { projectId, userId } });
  return getProject(projectId);
}

export async function isProjectMember(projectId: string, userId: string): Promise<boolean> {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  return Boolean(membership);
}
