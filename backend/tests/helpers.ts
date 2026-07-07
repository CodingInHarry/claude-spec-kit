import { prisma } from "../src/models/prisma.js";

const PREDEFINED_USERS = [
  { id: "u-pm", name: "김지현 (PM)", role: "PM" },
  { id: "u-eng-1", name: "이서준", role: "Engineer" },
  { id: "u-eng-2", name: "박민아", role: "Engineer" },
  { id: "u-eng-3", name: "최도윤", role: "Engineer" },
  { id: "u-eng-4", name: "정하은", role: "Engineer" },
] as const;

export async function resetDatabase(): Promise<void> {
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  for (const user of PREDEFINED_USERS) {
    await prisma.user.create({ data: user });
  }
}

export { PREDEFINED_USERS };
