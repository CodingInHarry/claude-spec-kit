import { useState, type FormEvent } from "react";

interface Props {
  onSubmit: (text: string) => Promise<void>;
}

export function CommentForm({ onSubmit }: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) {
      setError("댓글 내용을 입력해 주세요.");
      return;
    }
    setError(null);
    await onSubmit(text);
    setText("");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-1">
      <label htmlFor="comment-text" className="text-xs text-slate-500">
        댓글 작성
      </label>
      <div className="flex gap-2">
        <input
          id="comment-text"
          className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError(null);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "comment-error" : undefined}
        />
        <button type="submit" className="rounded bg-brand-500 px-3 py-1 text-sm text-white">
          등록
        </button>
      </div>
      {error && (
        <p id="comment-error" role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
