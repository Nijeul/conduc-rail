"use client";

import { useCallback, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
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

const DEFAULT_COLOR = "#004489";

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
  couleur: string | null;
  estGroupe: boolean;
  estDFV: boolean;
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
  sortable?: boolean;
}

export function ChantierRow({
  projetId,
  chantierId,
  libelle,
  couleur,
  estGroupe,
  estDFV,
  slotCount,
  colWidth,
  activeSlots,
  onToggleSlot,
  onDragSlots,
  onCouleurChange,
  onRenommer,
  onSupprimer,
  sortable = false,
}: ChantierRowProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(libelle);

  // Sortable hook (only used when sortable=true)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chantierId, disabled: !sortable });

  const sortableStyle = sortable
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : undefined,
      }
    : {};

  // Color: custom color or default
  const activeColor = couleur ?? DEFAULT_COLOR;
  const dotColor = couleur ?? DEFAULT_COLOR;

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
      <div
        ref={sortable ? setNodeRef : undefined}
        style={{ backgroundColor: "#F0F0F0", ...sortableStyle }}
        className="flex"
        {...(sortable ? attributes : {})}
      >
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
          {sortable && (
            <span
              className="cursor-grab mr-1 text-gray-400 hover:text-gray-600"
              {...listeners}
            >
              <GripVertical className="h-3 w-3" />
            </span>
          )}
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
      {sortable && (
        <span
          className="cursor-grab mr-1 text-gray-400 hover:text-gray-600 shrink-0"
          {...listeners}
        >
          <GripVertical className="h-3 w-3" />
        </span>
      )}
      <span
        className="inline-block w-2 h-2 rounded-full mr-1.5 shrink-0"
        style={{ backgroundColor: dotColor }}
      />
      {libelle}
    </>
  );

  return (
    <div
      ref={sortable ? setNodeRef : undefined}
      className="flex"
      style={sortableStyle}
      {...(sortable ? attributes : {})}
    >
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className={`sticky left-0 z-10 flex items-center px-2 text-xs border-r border-b truncate ${
              estDFV ? "font-bold" : ""
            }`}
            style={{
              width: 180,
              minWidth: 180,
              borderColor: "#DCDCDC",
              height: 28,
              backgroundColor: estDFV ? "#E5EFF8" : "#FFFFFF",
              color: estDFV ? "#003370" : undefined,
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
                  Couleur par defaut
                </span>
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          {!estDFV && (
            <ContextMenuItem
              onClick={() => {
                setRenameValue(libelle);
                setIsRenaming(true);
              }}
            >
              Renommer
            </ContextMenuItem>
          )}
          {!estDFV && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => onSupprimer(chantierId)}
                className="text-[#E20025] focus:text-[#E20025]"
              >
                Supprimer
              </ContextMenuItem>
            </>
          )}
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
                backgroundColor: isActive ? activeColor : estDFV ? "#F0F8FF" : "transparent",
              }}
              onMouseDown={() => handleMouseDown(i)}
            />
          );
        })}
      </div>
    </div>
  );
}
