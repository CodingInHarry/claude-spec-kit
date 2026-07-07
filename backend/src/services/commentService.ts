import { prisma } from "../models/prisma.js";
import { badRequest } from "../api/errors.js";
import { getTaskRecord } from "./taskService.js";

function toCommentDto(comment: {
  id: string;
  taskId: string;
  authorId: string;
  text: string;
  createdAt: Date;
}) {
  return {
    id: comment.id,
    taskId: comment.taskId,
    authorId: comment.authorId,
    text: comment.text,
    createdAt: comment.createdAt.toISOString(),
  };
}

export async function listCommentsForTask(taskId: string) {
  await getTaskRecord(taskId);
  const comments = await prisma.comment.findMany({
    where: { taskId },
    orderBy: { createdAt: "asc" },
  });
  return comments.map(toCommentDto);
}

export async function createComment(taskId: string, authorId: string, text: string) {
  const trimmed = text?.trim();
  if (!trimmed) {
    throw badRequest("COMMENT_TEXT_REQUIRED", "댓글 내용을 입력해 주세요.");
  }
  const task = await getTaskRecord(taskId);

  const comment = await prisma.comment.create({
    data: { taskId, authorId, text: trimmed },
  });
  return { comment: toCommentDto(comment), projectId: task.projectId };
}
