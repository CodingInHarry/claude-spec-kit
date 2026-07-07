import { createServer, type Server as HttpServer } from "http";
import type { AddressInfo } from "net";

import request from "supertest";
import { io as ioClient, type Socket as ClientSocket } from "socket.io-client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../../src/api/app.js";
import { initSocketServer } from "../../src/realtime/socket.js";
import { resetDatabase } from "../helpers.js";

describe("사용자 스토리 3: 댓글 실시간 브로드캐스트", () => {
  let httpServer: HttpServer;
  let baseUrl: string;
  let clientA: ClientSocket;
  let clientB: ClientSocket;

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
    clientA?.close();
    clientB?.close();
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  });

  it("한 클라이언트가 댓글을 올리면 같은 태스크를 보는 다른 클라이언트에게 브로드캐스트된다", async () => {
    const project = await request(baseUrl)
      .post("/api/projects")
      .set("X-User-Id", "u-pm")
      .send({ name: "댓글 통합 테스트" });
    const projectId = project.body.id as string;

    const task = await request(baseUrl)
      .post(`/api/projects/${projectId}/tasks`)
      .set("X-User-Id", "u-pm")
      .send({ title: "실시간 댓글 태스크" });
    const taskId = task.body.id as string;

    clientA = ioClient(baseUrl, { path: "/socket.io" });
    clientB = ioClient(baseUrl, { path: "/socket.io" });
    await Promise.all([
      new Promise<void>((resolve) => clientA.on("connect", () => resolve())),
      new Promise<void>((resolve) => clientB.on("connect", () => resolve())),
    ]);
    clientA.emit("project:join", projectId);
    clientB.emit("project:join", projectId);

    const receivedByB = new Promise<Record<string, unknown>>((resolve) => {
      clientB.on("comment:created", (payload) => resolve(payload));
    });

    await request(baseUrl)
      .post(`/api/tasks/${taskId}/comments`)
      .set("X-User-Id", "u-pm")
      .send({ text: "다들 확인 부탁드려요" });

    const comment = await receivedByB;
    expect(comment.text).toBe("다들 확인 부탁드려요");
    expect(comment.taskId).toBe(taskId);
  });
});
