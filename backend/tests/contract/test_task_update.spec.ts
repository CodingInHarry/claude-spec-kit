import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../../src/api/app.js";
import { resetDatabase } from "../helpers.js";

const app = createApp();

async function setupProjectWithTask() {
  const project = await request(app)
    .post("/api/projects")
    .set("X-User-Id", "u-pm")
    .send({ name: "PATCH 테스트" });
  await request(app)
    .post(`/api/projects/${project.body.id}/members`)
    .set("X-User-Id", "u-pm")
    .send({ userId: "u-eng-1" });
  const task = await request(app)
    .post(`/api/projects/${project.body.id}/tasks`)
    .set("X-User-Id", "u-pm")
    .send({ title: "칸반 보드 구현" });
  return { projectId: project.body.id as string, taskId: task.body.id as string };
}

describe("PATCH /api/tasks/:id", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("moves a task to a new status", async () => {
    const { taskId } = await setupProjectWithTask();

    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("X-User-Id", "u-pm")
      .send({ status: "in_progress" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("in_progress");
  });

  it("rejects an invalid status value", async () => {
    const { taskId } = await setupProjectWithTask();

    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("X-User-Id", "u-pm")
      .send({ status: "archived" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_TASK_STATUS");
  });

  it("assigns a task to a project member", async () => {
    const { taskId } = await setupProjectWithTask();

    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("X-User-Id", "u-pm")
      .send({ assigneeId: "u-eng-1" });

    expect(res.status).toBe(200);
    expect(res.body.assigneeId).toBe("u-eng-1");
  });

  it("rejects assigning a task to a non-member", async () => {
    const { taskId } = await setupProjectWithTask();

    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("X-User-Id", "u-pm")
      .send({ assigneeId: "u-eng-2" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("ASSIGNEE_NOT_PROJECT_MEMBER");
  });
});
