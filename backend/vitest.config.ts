import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    globalSetup: ["./tests/globalSetup.ts"],
    fileParallelism: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // 부트스트랩 스크립트(엔트리포인트, 시드)는 비즈니스 로직이 없어 커버리지 대상에서 제외
      exclude: ["**/src/index.ts", "**/prisma/seed.ts", "**/tests/**", "**/*.config.ts"],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
