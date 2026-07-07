import { useEffect, useState } from "react";

import { apiClient } from "../services/apiClient";
import { useToast } from "../components/Toast";
import type { Project } from "../types";

interface Props {
  onOpenProject: (projectId: string) => void;
}

export function ProjectListPage({ onOpenProject }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { showError } = useToast();

  async function reload() {
    setLoading(true);
    try {
      const list = await apiClient.get<Project[]>("/projects");
      setProjects(list);
    } catch {
      showError("프로젝트 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 시 1회 데이터 조회
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await apiClient.post("/projects", { name, description: description || undefined });
      setName("");
      setDescription("");
      await reload();
    } catch {
      showError("프로젝트 생성에 실패했습니다.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">프로젝트</h1>

      <form onSubmit={handleCreate} className="mb-6 flex flex-col gap-2 rounded-md border border-slate-200 p-4">
        <label htmlFor="project-name" className="text-sm font-medium text-slate-700">
          새 프로젝트 이름
        </label>
        <input
          id="project-name"
          className="rounded border border-slate-300 px-3 py-1.5"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label htmlFor="project-description" className="text-sm font-medium text-slate-700">
          설명 (선택)
        </label>
        <input
          id="project-description"
          className="rounded border border-slate-300 px-3 py-1.5"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          type="submit"
          className="mt-2 self-start rounded bg-brand-500 px-4 py-1.5 text-white hover:bg-brand-600"
        >
          프로젝트 생성
        </button>
      </form>

      {loading ? (
        <p className="text-slate-500">불러오는 중...</p>
      ) : projects.length === 0 ? (
        <p className="text-slate-500">아직 프로젝트가 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {projects.map((project) => (
            <li key={project.id}>
              <button
                type="button"
                onClick={() => onOpenProject(project.id)}
                className="flex w-full flex-col rounded-md border border-slate-200 px-4 py-3 text-left hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
              >
                <span className="font-medium text-slate-900">{project.name}</span>
                <span className="text-sm text-slate-500">
                  팀원 {project.members.length}명
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
