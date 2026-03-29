"use client";

import { useState } from "react";
import { DESheet } from "@/components/modules/detail-estimatif";

interface DEButtonProps {
  projetId?: string;
  projetName?: string;
}

export function DEButton({ projetId, projetName }: DEButtonProps) {
  const [open, setOpen] = useState(false);

  if (!projetId || !projetName) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-accent text-text-main px-3 py-1.5 rounded-md
                   text-sm font-semibold hover:bg-yellow-600 hover:text-white transition-colors"
      >
        <span>DE</span>
      </button>

      <DESheet
        open={open}
        onOpenChange={setOpen}
        projetId={projetId}
        projetName={projetName}
      />
    </>
  );
}
