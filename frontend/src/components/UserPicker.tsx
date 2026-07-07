import { useActiveUser } from "../context/ActiveUserContext";

export function UserPicker() {
  const { users, loading, selectUser } = useActiveUser();

  if (loading) {
    return <p className="p-6 text-slate-500">사용자 목록을 불러오는 중...</p>;
  }

  return (
    <div className="mx-auto mt-16 max-w-md rounded-lg border border-slate-200 p-6 shadow-sm">
      <h1 className="mb-1 text-xl font-semibold text-slate-900">Taskify</h1>
      <p className="mb-4 text-sm text-slate-500">
        로그인 없이 사용할 계정을 선택하세요.
      </p>
      <ul className="flex flex-col gap-2" aria-label="사용자 선택">
        {users.map((user) => (
          <li key={user.id}>
            <button
              type="button"
              onClick={() => selectUser(user.id)}
              className="flex w-full items-center justify-between rounded-md border border-slate-200 px-4 py-2 text-left hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            >
              <span className="font-medium text-slate-800">{user.name}</span>
              <span className="text-xs text-slate-500">{user.role}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
