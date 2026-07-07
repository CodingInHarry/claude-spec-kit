import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../../src/api/app.js";
import { resetDatabase } from "../helpers.js";

const app = createApp();

async function setupTask() {
  const project = await request(app)
    .post("/api/projects")
    .set("X-User-Id", "u-pm")
    .send({ name: "댓글 테스트" });
  const task = await request(app)
    .post(`/api/projects/${project.body.id}/tasks`)
    .set("X-User-Id", "u-pm")
    .send({ title: "댓글 달 태스크" });
  return task.body.id as string;
}

describe("GET/POST /api/tasks/:id/comments", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("posts a comment and lists it", async () => {
    const taskId = await setupTask();

    const post = await request(app)
      .post(`/api/tasks/${taskId}/comments`)
      .set("X-User-Id", "u-eng-1")
      .send({ text: "좋아 보입니다!" });

    expect(post.status).toBe(201);
    expect(post.body.authorId).toBe("u-eng-1");

    const list = await request(app)
      .get(`/api/tasks/${taskId}/comments`)
      .set("X-User-Id", "u-pm");
    expect(list.body).toHaveLength(1);
  });

  it("rejects an empty comment", async () => {
    const taskId = await setupTask();

    const res = await request(app)
      .post(`/api/tasks/${taskId}/comments`)
      .set("X-User-Id", "u-eng-1")
      .send({ text: "   " });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("COMMENT_TEXT_REQUIRED");
  });
});
