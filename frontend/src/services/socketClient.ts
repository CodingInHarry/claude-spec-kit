import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io({ path: "/socket.io", autoConnect: true });
  }
  return socket;
}

export function joinProjectRoom(projectId: string): void {
  getSocket().emit("project:join", projectId);
}

export function leaveProjectRoom(projectId: string): void {
  getSocket().emit("project:leave", projectId);
}

export function onTaskUpdated(handler: (task: unknown) => void): () => void {
  const s = getSocket();
  s.on("task:updated", handler);
  return () => s.off("task:updated", handler);
}

export function onCommentCreated(handler: (comment: unknown) => void): () => void {
  const s = getSocket();
  s.on("comment:created", handler);
  return () => s.off("comment:created", handler);
}
