import { createServer, type Server as HttpServer } from "http";
import type { AddressInfo } from "net";

import request from "supertest";
import { io as ioClient, type Socket as ClientSocket } from "socket.io-client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../../src/api/app.js";
import { initSocketServer } from "../../src/realtime/socket.js";
import { resetDatabase } from "../helpers.js";

describe("사용자 스토리 2: 칸반 보드 태스크 관리", () => {
  let httpServer: HttpServer;
  let baseUrl: string;
  let client: ClientSocket;

  beforeEach(async () => {
    await resetDatabase();
    const app = createApp();
    httpServer = createServer(app);
    initSocketServer(httpServer);
    await new Promise<void>((resolve) => httpServer.listen(0, resolve));
    const { port } = httpServer.address() as AddressInfo;
    baseUrl = `http://localhost:${port}`;
  });

  afterEach(async () => {
    client?.close();
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  });

  it("태스크 생성 → 할당 → 드래그 이동 → 다른 클라이언트로 브로드캐스트", async () => {
    const project = await request(baseUrl)
      .post("/api/projects")
      .set("X-User-Id", "u-pm")
      .send({ name: "칸반 통합 테스트" });
    const projectId = project.body.id as string;

    await request(baseUrl)
      .post(`/api/projects/${projectId}/members`)
      .set("X-User-Id", "u-pm")
      .send({ userId: "u-eng-1" });

    const task = await request(baseUrl)
      .post(`/api/projects/${projectId}/tasks`)
      .set("X-User-Id", "u-pm")
      .send({ title: "드래그 테스트 태스크" });
    const taskId = task.body.id as string;

    client = ioClient(baseUrl, { path: "/socket.io" });
    await new Promise<void>((resolve) => client.on("connect", () => resolve()));
    client.emit("project:join", projectId);

    const updatePromise = new Promise<Record<string, unknown>>((resolve) => {
      client.on("task:updated", (payload) => resolve(payload));
    });

    await request(baseUrl)
      .patch(`/api/tasks/${taskId}`)
      .set("X-User-Id", "u-eng-1")
      .send({ assigneeId: "u-eng-1" });

    await request(baseUrl)
      .patch(`/api/tasks/${taskId}`)
      .set("X-User-Id", "u-eng-1")
      .send({ status: "in_progress" });

    const broadcast = await updatePromise;
    expect(broadcast.id).toBe(taskId);
  });
});
