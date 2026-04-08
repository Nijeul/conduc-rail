"use client";

import { cn } from "@/lib/utils";

interface FournisseurColumnProps {
  nom: string;
  decision: string;
  couleurDecision: string;
  score?: number;
  scoreMax?: number;
  scoreNormalise?: number;
}

function getDecisionBadge(decision: string, couleur: string) {
  if (decision === "go") {
    return {
      label: "GO",
      bg: "bg-[#E8EFDA]",
      text: "text-[#5E8019]",
      border: "border-[#5E8019]",
    };
  }
  if (couleur === "rouge") {
    return {
      label: "NO-GO",
      bg: "bg-[#FDEAED]",
      text: "text-[#E20025]",
      border: "border-[#E20025]",
    };
  }
  return {
    label: "NO-GO",
    bg: "bg-[#FFF7D1]",
    text: "text-[#DD9412]",
    border: "border-[#DD9412]",
  };
}

export function FournisseurColumnHeader({
  nom,
  decision,
  couleurDecision,
}: FournisseurColumnProps) {
  const badge = getDecisionBadge(decision, couleurDecision);

  return (
    <th className="px-2 py-2 text-center min-w-[140px]">
      <div className="flex flex-col items-center gap-1">
        <span className="font-bold text-white text-xs truncate max-w-[130px]">
          {nom}
        </span>
        <span
          className={cn(
            "text-[10px] px-2 py-0.5 rounded-full font-bold border",
            badge.bg,
            badge.text,
            badge.border
          )}
        >
          {badge.label}
        </span>
      </div>
    </th>
  );
}

export function FournisseurScoreFooter({
  score,
  scoreMax,
  scoreNormalise,
}: {
  score: number;
  scoreMax: number;
  scoreNormalise: number;
}) {
  return (
    <td className="px-2 py-2 text-center">
      <div className="font-bold text-sm" style={{ color: "#004489" }}>
        {score} / {scoreMax}
      </div>
      <div className="text-xs text-[#5A5A5A]">
        {scoreNormalise.toFixed(1)}%
      </div>
    </td>
  );
}
