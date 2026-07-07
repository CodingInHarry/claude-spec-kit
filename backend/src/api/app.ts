import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";

import { badRequest, errorHandler } from "./errors.js";
import { commentsRouter } from "./routes/comments.js";
import { projectsRouter } from "./routes/projects.js";
import { tasksRouter } from "./routes/tasks.js";
import { usersRouter } from "./routes/users.js";

declare module "express-serve-static-core" {
  interface Request {
    activeUserId: string;
  }
}

function requireActiveUser(req: Request, _res: Response, next: NextFunction): void {
  const userId = req.header("X-User-Id");
  if (!userId) {
    next(badRequest("MISSING_USER_ID", "X-User-Id 헤더가 필요합니다."));
    return;
  }
  req.activeUserId = userId;
  next();
}

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api", requireActiveUser);
  app.use("/api/users", usersRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/tasks", tasksRouter);
  app.use("/api/tasks", commentsRouter);

  app.use(errorHandler);

  return app;
}
