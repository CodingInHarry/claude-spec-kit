import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient, ApiClientError } from "../../src/services/apiClient";

const originalFetch = global.fetch;
const STORAGE_KEY = "taskify.activeUserId";

describe("apiClient", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    localStorage.removeItem(STORAGE_KEY);
  });

  it("sends the active user id header (read from localStorage) and parses JSON responses", async () => {
    localStorage.setItem(STORAGE_KEY, "u-pm");
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    const result = await apiClient.get<{ ok: boolean }>("/projects");

    expect(result).toEqual({ ok: true });
    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect((options.headers as Headers).get("X-User-Id")).toBe("u-pm");
  });

  it("falls back to a bootstrap user id when none is stored yet", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    await apiClient.get("/users");

    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect((options.headers as Headers).get("X-User-Id")).toBe("bootstrap");
  });

  it("throws ApiClientError with the server's error payload", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ code: "PROJECT_NAME_REQUIRED", message: "이름이 필요합니다." }),
        { status: 400 },
      ),
    );

    await expect(apiClient.post("/projects", {})).rejects.toMatchObject({
      code: "PROJECT_NAME_REQUIRED",
      message: "이름이 필요합니다.",
    });
  });

  it("wraps unparsable error bodies in a generic ApiClientError", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response("not json", { status: 500 }),
    );

    await expect(apiClient.get("/projects")).rejects.toBeInstanceOf(ApiClientError);
  });

  it("returns undefined for 204 No Content responses", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(new Response(null, { status: 204 }));

    const result = await apiClient.delete("/projects/p1/members/u-eng-1");
    expect(result).toBeUndefined();
  });
});
