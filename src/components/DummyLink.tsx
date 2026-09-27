"use client";

import { useToast } from "./Toast";

/** A link that exists only for the UI; the feature is not part of this project. */
export function DummyLink({ label, className = "" }: { label: string; className?: string }) {
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={() => toast(`${label} is not available.`)}
      className={`cursor-pointer hover:underline ${className}`}
    >
      {label}
    </button>
  );
}
