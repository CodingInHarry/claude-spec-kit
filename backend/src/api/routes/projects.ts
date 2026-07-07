import { Router } from "express";

import { asyncHandler, badRequest } from "../errors.js";
import {
  addProjectMember,
  createProject,
  getProject,
  listProjects,
  removeProjectMember,
} from "../../services/projectService.js";
import { createTask, listTasksForProject } from "../../services/taskService.js";

export const projectsRouter = Router();

projectsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await listProjects());
  }),
);

projectsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, description } = req.body as { name?: string; description?: string };
    const project = await createProject({ name: name ?? "", description });
    res.status(201).json(project);
  }),
);

projectsRouter.get(
  "/:projectId",
  asyncHandler(async (req, res) => {
    res.json(await getProject(req.params.projectId!));
  }),
);

projectsRouter.post(
  "/:projectId/members",
  asyncHandler(async (req, res) => {
    const { userId } = req.body as { userId?: string };
    if (!userId) {
      throw badRequest("USER_ID_REQUIRED", "userId는 필수입니다.");
    }
    res.status(201).json(await addProjectMember(req.params.projectId!, userId));
  }),
);

projectsRouter.delete(
  "/:projectId/members/:userId",
  asyncHandler(async (req, res) => {
    res.json(await removeProjectMember(req.params.projectId!, req.params.userId!));
  }),
);

projectsRouter.get(
  "/:projectId/tasks",
  asyncHandler(async (req, res) => {
    res.json(await listTasksForProject(req.params.projectId!));
  }),
);

projectsRouter.post(
  "/:projectId/tasks",
  asyncHandler(async (req, res) => {
    const { title, description } = req.body as { title?: string; description?: string };
    const task = await createTask(req.params.projectId!, { title: title ?? "", description });
    res.status(201).json(task);
  }),
);
