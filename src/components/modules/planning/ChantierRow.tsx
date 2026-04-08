"use client";

import { useCallback, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

const COULEURS_CATEGORIE: Record<string, string> = {
  catenaire: "#004489",
  voie: "#FF8F00",
  procedure_sncf: "#E20025",
  essais: "#7AA536",
  dfv: "#003370",
  groupe: "#F0F0F0",
  autre: "#5A5A5A",
};

const COULEURS_LIGNE = [
  { label: "Bleu VINCI", couleur: "#004489" },
  { label: "Rouge", couleur: "#E20025" },
  { label: "Orange", couleur: "#FF8F00" },
  { label: "Vert", couleur: "#7AA536" },
  { label: "Violet", couleur: "#A152E5" },
  { label: "Rose", couleur: "#F25799" },
  { label: "Bleu clair", couleur: "#307BFF" },
  { label: "Jaune", couleur: "#F2AB1B" },
  { label: "Brun", couleur: "#C26A32" },
  { label: "Gris", couleur: "#5A5A5A" },
];

interface Creneau {
  id?: string;
  debut: Date;
  fin: Date;
  effectif: number;
  statut: string;
}

interface ChantierRowProps {
  projetId: string;
  chantierId: string;
  libelle: string;
  categorie: string | null;
  couleur: string | null;
  estGroupe: boolean;
  creneaux: Creneau[];
  slotCount: number;
  colWidth: number;
  dateDebut: Date;
  activeSlots: Set<number>;
  onToggleSlot: (chantierId: string, slotIndex: number) => void;
  onDragSlots: (chantierId: string, startIdx: number, endIdx: number) => void;
  onCouleurChange: (chantierId: string, couleur: string | null) => void;
  onRenommer: (chantierId: string, newLibelle: string) => void;
  onSupprimer: (chantierId: string) => void;
}

export function ChantierRow({
  projetId,
  chantierId,
  libelle,
  categorie,
  couleur,
  estGroupe,
  slotCount,
  colWidth,
  activeSlots,
  onToggleSlot,
  onDragSlots,
  onCouleurChange,
  onRenommer,
  onSupprimer,
}: ChantierRowProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(libelle);

  // Custom color takes priority, then category color
  const categorieColor = COULEURS_CATEGORIE[categorie ?? "autre"] ?? COULEURS_CATEGORIE.autre;
  const activeColor = couleur ?? categorieColor;
  const dotColor = couleur ?? categorieColor;

  const handleMouseDown = useCallback(
    (slotIndex: number) => {
      if (estGroupe) return;
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

  const handleRenameSubmit = useCallback(() => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== libelle) {
      onRenommer(chantierId, trimmed);
    }
    setIsRenaming(false);
  }, [renameValue, libelle, chantierId, onRenommer]);

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

  const labelContent = isRenaming ? (
    <div className="flex items-center w-full">
      <input
        autoFocus
        className="text-xs w-full border rounded px-1"
        style={{ borderColor: "#004489" }}
        value={renameValue}
        onChange={(e) => setRenameValue(e.target.value)}
        onBlur={handleRenameSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleRenameSubmit();
          if (e.key === "Escape") {
            setRenameValue(libelle);
            setIsRenaming(false);
          }
        }}
      />
    </div>
  ) : (
    <>
      <span
        className="inline-block w-2 h-2 rounded-full mr-1.5 shrink-0"
        style={{ backgroundColor: dotColor }}
      />
      {libelle}
    </>
  );

  return (
    <div className="flex">
      <ContextMenu>
        <ContextMenuTrigger asChild>
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
            {labelContent}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <span className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-sm border"
                  style={{
                    backgroundColor: couleur ?? "transparent",
                    borderColor: "#DCDCDC",
                  }}
                />
                Changer la couleur
              </span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              {COULEURS_LIGNE.map((c) => (
                <ContextMenuItem
                  key={c.couleur}
                  onClick={() => onCouleurChange(chantierId, c.couleur)}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-sm"
                      style={{ backgroundColor: c.couleur }}
                    />
                    {c.label}
                    {couleur === c.couleur && (
                      <span className="ml-auto text-xs" style={{ color: "#004489" }}>
                        ✓
                      </span>
                    )}
                  </span>
                </ContextMenuItem>
              ))}
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => onCouleurChange(chantierId, null)}
              >
                <span className="text-xs" style={{ color: "#5A5A5A" }}>
                  Couleur par defaut (categorie)
                </span>
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuItem
            onClick={() => {
              setRenameValue(libelle);
              setIsRenaming(true);
            }}
          >
            Renommer
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => onSupprimer(chantierId)}
            className="text-[#E20025] focus:text-[#E20025]"
          >
            Supprimer
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
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
                backgroundColor: isActive ? activeColor : "transparent",
              }}
              onMouseDown={() => handleMouseDown(i)}
            />
          );
        })}
      </div>
    </div>
  );
}
