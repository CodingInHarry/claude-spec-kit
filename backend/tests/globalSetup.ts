import { execSync } from "child_process";
import { existsSync, unlinkSync } from "fs";
import path from "path";

const TEST_DB_PATH = path.resolve(__dirname, "test.db");

export async function setup() {
  process.env.DATABASE_URL = `file:${TEST_DB_PATH}`;
  if (existsSync(TEST_DB_PATH)) {
    unlinkSync(TEST_DB_PATH);
  }
  execSync("npx prisma db push --skip-generate", {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, DATABASE_URL: `file:${TEST_DB_PATH}` },
    stdio: "inherit",
  });
}

export async function teardown() {
  if (existsSync(TEST_DB_PATH)) {
    unlinkSync(TEST_DB_PATH);
  }
}
