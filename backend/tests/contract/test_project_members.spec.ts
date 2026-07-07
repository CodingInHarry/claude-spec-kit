import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../../src/api/app.js";
import { resetDatabase } from "../helpers.js";

const app = createApp();

async function createProject() {
  const res = await request(app)
    .post("/api/projects")
    .set("X-User-Id", "u-pm")
    .send({ name: "테스트 프로젝트" });
  return res.body as { id: string };
}

describe("POST/DELETE /api/projects/:id/members", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("adds a predefined user as a project member", async () => {
    const project = await createProject();

    const res = await request(app)
      .post(`/api/projects/${project.id}/members`)
      .set("X-User-Id", "u-pm")
      .send({ userId: "u-eng-1" });

    expect(res.status).toBe(201);
    expect(res.body.members).toHaveLength(1);
    expect(res.body.members[0].id).toBe("u-eng-1");
  });

  it("rejects adding a non-existent user", async () => {
    const project = await createProject();

    const res = await request(app)
      .post(`/api/projects/${project.id}/members`)
      .set("X-User-Id", "u-pm")
      .send({ userId: "u-does-not-exist" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("UNKNOWN_USER");
  });

  it("removes a project member", async () => {
    const project = await createProject();
    await request(app)
      .post(`/api/projects/${project.id}/members`)
      .set("X-User-Id", "u-pm")
      .send({ userId: "u-eng-1" });

    const res = await request(app)
      .delete(`/api/projects/${project.id}/members/u-eng-1`)
      .set("X-User-Id", "u-pm");

    expect(res.status).toBe(200);
    expect(res.body.members).toHaveLength(0);
  });
});
