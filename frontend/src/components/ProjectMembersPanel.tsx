import { useState } from "react";

import { useActiveUser } from "../context/ActiveUserContext";
import type { Project, User } from "../types";

interface Props {
  project: Project;
  onAddMember: (userId: string) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
}

export function ProjectMembersPanel({ project, onAddMember, onRemoveMember }: Props) {
  const { users } = useActiveUser();
  const [selectedUserId, setSelectedUserId] = useState("");
  const memberIds = new Set(project.members.map((m) => m.id));
  const availableUsers = users.filter((u) => !memberIds.has(u.id));

  async function handleAdd() {
    if (!selectedUserId) return;
    await onAddMember(selectedUserId);
    setSelectedUserId("");
  }

  return (
    <section aria-label="팀원 관리" className="rounded-md border border-slate-200 p-4">
      <h2 className="mb-2 text-sm font-semibold text-slate-700">팀원</h2>
      <ul className="mb-3 flex flex-col gap-1">
        {project.members.length === 0 && (
          <li className="text-sm text-slate-400">아직 팀원이 없습니다.</li>
        )}
        {project.members.map((member: User) => (
          <li
            key={member.id}
            className="flex items-center justify-between rounded bg-slate-50 px-3 py-1.5 text-sm"
          >
            <span>
              {member.name} <span className="text-xs text-slate-400">({member.role})</span>
            </span>
            <button
              type="button"
              className="text-xs text-red-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
              onClick={() => onRemoveMember(member.id)}
            >
              제거
            </button>
          </li>
        ))}
      </ul>

      {availableUsers.length > 0 && (
        <div className="flex gap-2">
          <label htmlFor="add-member-select" className="sr-only">
            추가할 팀원 선택
          </label>
          <select
            id="add-member-select"
            className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">팀원 선택...</option>
            {availableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!selectedUserId}
            className="rounded bg-brand-500 px-3 py-1 text-sm text-white disabled:opacity-40"
          >
            추가
          </button>
        </div>
      )}
    </section>
  );
}
