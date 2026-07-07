import { prisma } from "../models/prisma.js";
import { badRequest } from "../api/errors.js";

export async function listUsers() {
  return prisma.user.findMany({ orderBy: { id: "asc" } });
}

export async function assertUsersExist(userIds: string[]): Promise<void> {
  const found = await prisma.user.findMany({ where: { id: { in: userIds } } });
  if (found.length !== userIds.length) {
    const foundIds = new Set(found.map((u) => u.id));
    const missing = userIds.filter((id) => !foundIds.has(id));
    throw badRequest(
      "UNKNOWN_USER",
      `알 수 없는 사용자입니다: ${missing.join(", ")}`,
      { userIds: missing },
    );
  }
}
