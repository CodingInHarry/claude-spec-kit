import { Router } from "express";

import { asyncHandler } from "../errors.js";
import { broadcastToProject } from "../../realtime/socket.js";
import { createComment, listCommentsForTask } from "../../services/commentService.js";

export const commentsRouter = Router();

commentsRouter.get(
  "/:taskId/comments",
  asyncHandler(async (req, res) => {
    res.json(await listCommentsForTask(req.params.taskId!));
  }),
);

commentsRouter.post(
  "/:taskId/comments",
  asyncHandler(async (req, res) => {
    const { text } = req.body as { text?: string };
    const { comment, projectId } = await createComment(
      req.params.taskId!,
      req.activeUserId,
      text ?? "",
    );
    broadcastToProject(projectId, "comment:created", comment);
    res.status(201).json(comment);
  }),
);
