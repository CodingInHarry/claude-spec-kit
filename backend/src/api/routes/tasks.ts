import { Router } from "express";

import { asyncHandler } from "../errors.js";
import { broadcastToProject } from "../../realtime/socket.js";
import { getTask, updateTask } from "../../services/taskService.js";

export const tasksRouter = Router();

tasksRouter.get(
  "/:taskId",
  asyncHandler(async (req, res) => {
    const task = await getTask(req.params.taskId!);
    res.json(task);
  }),
);

tasksRouter.patch(
  "/:taskId",
  asyncHandler(async (req, res) => {
    const { title, description, status, assigneeId } = req.body as {
      title?: string;
      description?: string;
      status?: string;
      assigneeId?: string | null;
    };
    const task = await updateTask(req.params.taskId!, { title, description, status, assigneeId });
    broadcastToProject(task.projectId, "task:updated", task);
    res.json(task);
  }),
);
