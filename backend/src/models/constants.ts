export const ROLE_VALUES = ["PM", "Engineer"] as const;
export type Role = (typeof ROLE_VALUES)[number];

export const TASK_STATUS_VALUES = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUS_VALUES)[number];

export function isTaskStatus(value: string): value is TaskStatus {
  return (TASK_STATUS_VALUES as readonly string[]).includes(value);
}
