import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../../src/api/app.js";
import { resetDatabase } from "../helpers.js";

const app = createApp();

async function createProject() {
  const res = await request(app)
    .post("/api/projects")
    .set("X-User-Id", "u-pm")
    .send({ name: "태스크 테스트 프로젝트" });
  return res.body as { id: string };
}

describe("POST /api/projects/:id/tasks, GET tasks", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("creates a task in the todo column", async () => {
    const project = await createProject();

    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set("X-User-Id", "u-pm")
      .send({ title: "로그인 페이지 제거", description: "인증 없이 접근" });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("todo");
    expect(res.body.assigneeId).toBeNull();

    const list = await request(app)
      .get(`/api/projects/${project.id}/tasks`)
      .set("X-User-Id", "u-pm");
    expect(list.body).toHaveLength(1);
  });

  it("rejects a task without a title", async () => {
    const project = await createProject();
    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set("X-User-Id", "u-pm")
      .send({ description: "제목 없음" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("TASK_TITLE_REQUIRED");
  });
});
