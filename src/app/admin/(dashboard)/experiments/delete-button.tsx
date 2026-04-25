"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({ experimentId }: { experimentId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleTrashClick(e: React.MouseEvent) {
    e.preventDefault();
    setConfirming(true);
  }

  function handleCancel(e: React.MouseEvent) {
    e.preventDefault();
    setConfirming(false);
  }

  async function handleConfirm(e: React.MouseEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/experiments?id=${experimentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Failed to delete experiment.");
        setLoading(false);
        setConfirming(false);
        return;
      }
      router.refresh();
    } catch {
      alert("An unexpected error occurred. Please try again.");
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div
        className="flex items-center gap-1 flex-shrink-0"
        onClick={(e) => e.preventDefault()}
      >
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="px-2 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-medium rounded"
        >
          {loading ? "Deleting…" : "Delete"}
        </button>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="px-2 py-1 text-foreground-subtle hover:text-off-white text-xs"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleTrashClick}
      className="p-1.5 text-foreground-subtle hover:text-red-400 transition-colors rounded flex-shrink-0"
      aria-label="Delete experiment"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
        />
      </svg>
    </button>
  );
}
