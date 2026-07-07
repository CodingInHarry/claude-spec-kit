import { describe, expect, it, vi } from "vitest";

const emit = vi.fn();
const on = vi.fn();
const off = vi.fn();

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({ emit, on, off })),
}));

describe("socketClient", () => {
  it("joins and leaves project rooms via emit", async () => {
    const { joinProjectRoom, leaveProjectRoom } = await import("../../src/services/socketClient");

    joinProjectRoom("p1");
    expect(emit).toHaveBeenCalledWith("project:join", "p1");

    leaveProjectRoom("p1");
    expect(emit).toHaveBeenCalledWith("project:leave", "p1");
  });

  it("subscribes and unsubscribes task:updated and comment:created handlers", async () => {
    const { onTaskUpdated, onCommentCreated } = await import("../../src/services/socketClient");

    const taskHandler = vi.fn();
    const unsubscribeTask = onTaskUpdated(taskHandler);
    expect(on).toHaveBeenCalledWith("task:updated", taskHandler);
    unsubscribeTask();
    expect(off).toHaveBeenCalledWith("task:updated", taskHandler);

    const commentHandler = vi.fn();
    const unsubscribeComment = onCommentCreated(commentHandler);
    expect(on).toHaveBeenCalledWith("comment:created", commentHandler);
    unsubscribeComment();
    expect(off).toHaveBeenCalledWith("comment:created", commentHandler);
  });
});
