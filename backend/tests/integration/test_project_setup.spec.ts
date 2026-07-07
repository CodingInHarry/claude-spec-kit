import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../../src/api/app.js";
import { resetDatabase } from "../helpers.js";

const app = createApp();

describe("사용자 스토리 1: 프로젝트와 팀 구성", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("PM이 프로젝트를 만들고 엔지니어를 추가하면 그 엔지니어에게도 프로젝트가 보인다", async () => {
    const created = await request(app)
      .post("/api/projects")
      .set("X-User-Id", "u-pm")
      .send({ name: "Taskify 베타", description: "내부 테스트" });
    expect(created.status).toBe(201);
    const projectId = created.body.id as string;

    await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set("X-User-Id", "u-pm")
      .send({ userId: "u-eng-1" });
    await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set("X-User-Id", "u-pm")
      .send({ userId: "u-eng-2" });

    // 엔지니어 계정으로 전환해도 같은 프로젝트가 조회됨
    const asEngineer = await request(app)
      .get(`/api/projects/${projectId}`)
      .set("X-User-Id", "u-eng-1");

    expect(asEngineer.status).toBe(200);
    expect(asEngineer.body.members.map((m: { id: string }) => m.id)).toEqual(
      expect.arrayContaining(["u-eng-1", "u-eng-2"]),
    );
  });

  it("팀원이 없는 프로젝트도 빈 보드로 조회 가능하다", async () => {
    const created = await request(app)
      .post("/api/projects")
      .set("X-User-Id", "u-pm")
      .send({ name: "빈 프로젝트" });

    const res = await request(app)
      .get(`/api/projects/${created.body.id}`)
      .set("X-User-Id", "u-eng-3");

    expect(res.status).toBe(200);
    expect(res.body.members).toEqual([]);
  });
});
