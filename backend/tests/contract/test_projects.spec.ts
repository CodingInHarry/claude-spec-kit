import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../../src/api/app.js";
import { resetDatabase } from "../helpers.js";

const app = createApp();

describe("GET/POST /api/projects", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("rejects requests without X-User-Id header", async () => {
    const res = await request(app).get("/api/projects");
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("MISSING_USER_ID");
  });

  it("creates a project and returns it in the list", async () => {
    const createRes = await request(app)
      .post("/api/projects")
      .set("X-User-Id", "u-pm")
      .send({ name: "Taskify 런칭", description: "1분기 목표" });

    expect(createRes.status).toBe(201);
    expect(createRes.body.name).toBe("Taskify 런칭");
    expect(createRes.body.members).toEqual([]);

    const listRes = await request(app).get("/api/projects").set("X-User-Id", "u-pm");
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(1);
  });

  it("rejects project creation without a name", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("X-User-Id", "u-pm")
      .send({ description: "이름 없음" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("PROJECT_NAME_REQUIRED");
  });
});
