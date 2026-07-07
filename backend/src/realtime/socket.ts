import type { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | undefined;

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    socket.on("project:join", (projectId: string) => {
      socket.join(`project:${projectId}`);
    });

    socket.on("project:leave", (projectId: string) => {
      socket.leave(`project:${projectId}`);
    });
  });

  return io;
}

export function getSocketServer(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.IO 서버가 아직 초기화되지 않았습니다.");
  }
  return io;
}

export function broadcastToProject(projectId: string, event: string, payload: unknown): void {
  if (!io) return;
  io.to(`project:${projectId}`).emit(event, payload);
}
