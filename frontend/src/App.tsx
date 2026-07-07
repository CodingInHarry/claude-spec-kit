import { useState } from "react";

import { UserPicker } from "./components/UserPicker";
import { useActiveUser } from "./context/ActiveUserContext";
import { ProjectBoardPage } from "./pages/ProjectBoardPage";
import { ProjectListPage } from "./pages/ProjectListPage";

export function App() {
  const { activeUser, loading, clearUser } = useActiveUser();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  if (loading) {
    return <p className="p-6 text-slate-500">불러오는 중...</p>;
  }

  if (!activeUser) {
    return <UserPicker />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <span className="font-semibold text-slate-900">Taskify</span>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>
            {activeUser.name} ({activeUser.role})
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedProjectId(null);
              clearUser();
            }}
            className="text-brand-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            계정 전환
          </button>
        </div>
      </header>

      {selectedProjectId ? (
        <ProjectBoardPage projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />
      ) : (
        <ProjectListPage onOpenProject={setSelectedProjectId} />
      )}
    </div>
  );
}
