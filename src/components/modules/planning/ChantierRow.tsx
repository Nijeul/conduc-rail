"use client";

import { useCallback } from "react";

const COULEURS_CATEGORIE: Record<string, string> = {
  catenaire: "#004489",
  voie: "#FF8F00",
  procedure_sncf: "#E20025",
  essais: "#7AA536",
  dfv: "#003370",
  groupe: "#F0F0F0",
  autre: "#5A5A5A",
};

interface Creneau {
  id?: string;
  debut: Date;
  fin: Date;
  effectif: number;
  statut: string;
}

interface ChantierRowProps {
  chantierId: string;
  libelle: string;
  categorie: string | null;
  estGroupe: boolean;
  creneaux: Creneau[];
  slotCount: number;
  colWidth: number;
  dateDebut: Date;
  activeSlots: Set<number>;
  onToggleSlot: (chantierId: string, slotIndex: number) => void;
  onDragSlots: (chantierId: string, startIdx: number, endIdx: number) => void;
}

export function ChantierRow({
  chantierId,
  libelle,
  categorie,
  estGroupe,
  slotCount,
  colWidth,
  activeSlots,
  onToggleSlot,
  onDragSlots,
}: ChantierRowProps) {
  const color = COULEURS_CATEGORIE[categorie ?? "autre"] ?? COULEURS_CATEGORIE.autre;

  const handleMouseDown = useCallback(
    (slotIndex: number) => {
      if (estGroupe) return;
      // Start drag tracking via dataset on document
      const startIdx = slotIndex;
      let lastIdx = slotIndex;

      const onMove = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const idx = target.dataset?.slotIdx;
        const cId = target.dataset?.chantierId;
        if (idx && cId === chantierId) {
          lastIdx = parseInt(idx, 10);
        }
      };

      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        if (startIdx === lastIdx) {
          onToggleSlot(chantierId, startIdx);
        } else {
          const lo = Math.min(startIdx, lastIdx);
          const hi = Math.max(startIdx, lastIdx);
          onDragSlots(chantierId, lo, hi);
        }
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [chantierId, estGroupe, onToggleSlot, onDragSlots]
  );

  if (estGroupe) {
    return (
      <div className="flex" style={{ backgroundColor: "#F0F0F0" }}>
        <div
          className="sticky left-0 z-10 flex items-center px-2 text-xs font-bold border-r border-b truncate"
          style={{
            width: 180,
            minWidth: 180,
            backgroundColor: "#F0F0F0",
            borderColor: "#DCDCDC",
            height: 28,
          }}
        >
          {libelle}
        </div>
        <div className="flex">
          {Array.from({ length: slotCount }).map((_, i) => (
            <div
              key={i}
              className="border-r border-b shrink-0"
              style={{
                width: colWidth,
                minWidth: colWidth,
                height: 28,
                borderColor: "#DCDCDC",
                backgroundColor: "#F0F0F0",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div
        className="sticky left-0 z-10 flex items-center px-2 text-xs border-r border-b truncate bg-white"
        style={{
          width: 180,
          minWidth: 180,
          borderColor: "#DCDCDC",
          height: 28,
        }}
        title={libelle}
      >
        <span
          className="inline-block w-2 h-2 rounded-full mr-1.5 shrink-0"
          style={{ backgroundColor: color }}
        />
        {libelle}
      </div>
      <div className="flex">
        {Array.from({ length: slotCount }).map((_, i) => {
          const isActive = activeSlots.has(i);
          return (
            <div
              key={i}
              data-slot-idx={i}
              data-chantier-id={chantierId}
              className="border-r border-b shrink-0 cursor-pointer select-none"
              style={{
                width: colWidth,
                minWidth: colWidth,
                height: 28,
                borderColor: "#DCDCDC",
                backgroundColor: isActive ? color : "transparent",
              }}
              onMouseDown={() => handleMouseDown(i)}
            />
          );
        })}
      </div>
    </div>
  );
}
