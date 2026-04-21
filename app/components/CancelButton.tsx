"use client";

export default function CancelButton({ onCancel }: { onCancel: () => void }) {
  return (
    <button
      onClick={onCancel}
      className="text-xs uppercase tracking-[0.2em] text-apollo-muted hover:text-apollo-contradict transition-colors font-mono px-2 py-1"
    >
      Abort
    </button>
  );
}
