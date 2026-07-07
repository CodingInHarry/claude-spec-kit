import { useState, type FormEvent } from "react";

interface Props {
  onCreate: (title: string, description: string) => Promise<void>;
}

export function TaskCreateForm({ onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await onCreate(title, description);
    setTitle("");
    setDescription("");
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap items-end gap-2">
      <div className="flex flex-col">
        <label htmlFor="task-title" className="text-xs text-slate-500">
          태스크 제목
        </label>
        <input
          id="task-title"
          className="rounded border border-slate-300 px-2 py-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="task-description" className="text-xs text-slate-500">
          설명 (선택)
        </label>
        <input
          id="task-description"
          className="rounded border border-slate-300 px-2 py-1"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <button type="submit" className="rounded bg-brand-500 px-3 py-1.5 text-sm text-white">
        태스크 추가
      </button>
    </form>
  );
}
