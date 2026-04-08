"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OcpHeader } from "./OcpHeader";
import { TimelineHeader, generateSlots } from "./TimelineHeader";
import { ChantierRow } from "./ChantierRow";
import { ChantierForm } from "./ChantierForm";
import { updateCreneaux, calculerDFV } from "@/actions/planning";

const ZOOM_LEVELS = {
  compact: 10,
  normal: 24,
  large: 40,
} as const;

type ZoomLevel = keyof typeof ZOOM_LEVELS;

interface Creneau {
  id: string;
  debut: Date;
  fin: Date;
  effectif: number;
  statut: string;
}

interface ChantierEl {
  id: string;
  libelle: string;
  categorie: string | null;
  estGroupe: boolean;
  ordreAffichage: number;
  creneaux: Creneau[];
}

interface OCPData {
  id: string;
  nom: string;
  version: string;
  dateDebut: Date;
  dateFin: Date;
  dfvTotalMinutes: number;
  statut: string;
  chantiersElementaires: ChantierEl[];
}

interface PlanningMinuteGridProps {
  projetId: string;
  ocp: OCPData;
}

/**
 * Build a Set of active slot indices from a chantier's creneaux
 */
function buildActiveSlots(
  creneaux: Creneau[],
  startMs: number,
  stepMs: number
): Set<number> {
  const set = new Set<number>();
  for (const c of creneaux) {
    if (c.statut === "annule") continue;
    const cDebut = new Date(c.debut).getTime();
    const cFin = new Date(c.fin).getTime();
    const startSlot = Math.floor((cDebut - startMs) / stepMs);
    const endSlot = Math.ceil((cFin - startMs) / stepMs);
    for (let i = startSlot; i < endSlot; i++) {
      set.add(i);
    }
  }
  return set;
}

/**
 * Convert a Set of active slot indices back to creneaux array
 */
function slotsToCreneaux(
  slots: Set<number>,
  startMs: number,
  stepMs: number,
  existingCreneaux: Creneau[]
): { debut: Date; fin: Date; effectif: number; statut: string; id?: string }[] {
  if (slots.size === 0) return [];

  // Merge contiguous slots into ranges
  const sorted = Array.from(slots).sort((a, b) => a - b);
  const ranges: { start: number; end: number }[] = [];
  let rangeStart = sorted[0];
  let rangeEnd = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === rangeEnd + 1) {
      rangeEnd = sorted[i];
    } else {
      ranges.push({ start: rangeStart, end: rangeEnd });
      rangeStart = sorted[i];
      rangeEnd = sorted[i];
    }
  }
  ranges.push({ start: rangeStart, end: rangeEnd });

  // Match existing creneaux by overlap for ID preservation
  return ranges.map((range) => {
    const debut = new Date(startMs + range.start * stepMs);
    const fin = new Date(startMs + (range.end + 1) * stepMs);

    // Try to find an existing creneau that overlaps this range
    const existing = existingCreneaux.find((c) => {
      const cd = new Date(c.debut).getTime();
      const cf = new Date(c.fin).getTime();
      return cd < fin.getTime() && cf > debut.getTime();
    });

    return {
      id: existing?.id,
      debut,
      fin,
      effectif: existing?.effectif ?? 1,
      statut: "planifie" as const,
    };
  });
}

export function PlanningMinuteGrid({ projetId, ocp }: PlanningMinuteGridProps) {
  const router = useRouter();
  const [zoom, setZoom] = useState<ZoomLevel>("normal");
  const [chantierFormOpen, setChantierFormOpen] = useState(false);
  const [dfvMinutes, setDfvMinutes] = useState(ocp.dfvTotalMinutes);

  const startMs = new Date(ocp.dateDebut).getTime();
  const stepMs = 30 * 60 * 1000;
  const colWidth = ZOOM_LEVELS[zoom];

  const slots = useMemo(
    () => generateSlots(ocp.dateDebut, ocp.dateFin),
    [ocp.dateDebut, ocp.dateFin]
  );
  const slotCount = slots.length;

  // Local state for each chantier's active slots
  const [chantierSlots, setChantierSlots] = useState<Record<string, Set<number>>>(() => {
    const map: Record<string, Set<number>> = {};
    for (const ch of ocp.chantiersElementaires) {
      map[ch.id] = buildActiveSlots(ch.creneaux, startMs, stepMs);
    }
    return map;
  });

  // Compute DFV line (union of all active slots)
  const dfvSlots = useMemo(() => {
    const union = new Set<number>();
    for (const s of Object.values(chantierSlots)) {
      s.forEach((idx) => union.add(idx));
    }
    return union;
  }, [chantierSlots]);

  // Update DFV display when slots change
  useEffect(() => {
    const minutes = dfvSlots.size * 30;
    setDfvMinutes(minutes);
  }, [dfvSlots]);

  // Debounced save ref
  const saveTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const scheduleCreneauxSave = useCallback(
    (chantierId: string, activeSlots: Set<number>) => {
      clearTimeout(saveTimers.current[chantierId]);
      saveTimers.current[chantierId] = setTimeout(async () => {
        const chantier = ocp.chantiersElementaires.find(
          (ch) => ch.id === chantierId
        );
        const creneaux = slotsToCreneaux(
          activeSlots,
          startMs,
          stepMs,
          chantier?.creneaux ?? []
        );
        await updateCreneaux(projetId, chantierId, creneaux);
        await calculerDFV(ocp.id);
      }, 500);
    },
    [projetId, ocp.id, ocp.chantiersElementaires, startMs, stepMs]
  );

  const handleToggleSlot = useCallback(
    (chantierId: string, slotIndex: number) => {
      setChantierSlots((prev) => {
        const newSet = new Set(prev[chantierId] ?? []);
        if (newSet.has(slotIndex)) {
          newSet.delete(slotIndex);
        } else {
          newSet.add(slotIndex);
        }
        const updated = { ...prev, [chantierId]: newSet };
        scheduleCreneauxSave(chantierId, newSet);
        return updated;
      });
    },
    [scheduleCreneauxSave]
  );

  const handleDragSlots = useCallback(
    (chantierId: string, startIdx: number, endIdx: number) => {
      setChantierSlots((prev) => {
        const currentSet = prev[chantierId] ?? new Set<number>();
        const newSet = new Set(currentSet);
        // Determine action: if the starting slot was active, deactivate range; otherwise activate
        const shouldActivate = !currentSet.has(startIdx);
        for (let i = startIdx; i <= endIdx; i++) {
          if (shouldActivate) {
            newSet.add(i);
          } else {
            newSet.delete(i);
          }
        }
        const updated = { ...prev, [chantierId]: newSet };
        scheduleCreneauxSave(chantierId, newSet);
        return updated;
      });
    },
    [scheduleCreneauxSave]
  );

  const handleZoomIn = useCallback(() => {
    setZoom((z) => (z === "compact" ? "normal" : z === "normal" ? "large" : z));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => (z === "large" ? "normal" : z === "normal" ? "compact" : z));
  }, []);

  // Re-init slots when ocp data changes (after server revalidation)
  useEffect(() => {
    const map: Record<string, Set<number>> = {};
    for (const ch of ocp.chantiersElementaires) {
      map[ch.id] = buildActiveSlots(ch.creneaux, startMs, stepMs);
    }
    setChantierSlots(map);
  }, [ocp.chantiersElementaires, startMs, stepMs]);

  return (
    <div className="flex flex-col h-full">
      <OcpHeader
        nom={ocp.nom}
        version={ocp.version}
        dateDebut={ocp.dateDebut}
        dateFin={ocp.dateFin}
        dfvTotalMinutes={dfvMinutes}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onAddChantier={() => setChantierFormOpen(true)}
      />

      <div className="flex-1 overflow-auto relative">
        <div style={{ minWidth: 180 + slotCount * colWidth }}>
          {/* Sticky timeline header row — label column + time columns */}
          <div className="flex sticky top-0 z-30">
            <div
              className="sticky left-0 z-40 flex items-center justify-center text-xs font-bold text-white"
              style={{
                width: 180,
                minWidth: 180,
                height: 46,
                backgroundColor: "#004489",
              }}
            >
              Chantiers
            </div>
            <TimelineHeader
              dateDebut={ocp.dateDebut}
              dateFin={ocp.dateFin}
              colWidth={colWidth}
            />
          </div>

          {/* DFV summary row */}
          <div className="flex">
            <div
              className="sticky left-0 z-10 flex items-center px-2 text-xs font-bold border-r border-b bg-white"
              style={{
                width: 180,
                minWidth: 180,
                borderColor: "#DCDCDC",
                height: 28,
                color: "#003370",
              }}
            >
              DFV
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
                    backgroundColor: dfvSlots.has(i) ? "#003370" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Chantier rows */}
          {ocp.chantiersElementaires.map((ch) => (
            <ChantierRow
              key={ch.id}
              chantierId={ch.id}
              libelle={ch.libelle}
              categorie={ch.categorie}
              estGroupe={ch.estGroupe}
              creneaux={ch.creneaux}
              slotCount={slotCount}
              colWidth={colWidth}
              dateDebut={ocp.dateDebut}
              activeSlots={chantierSlots[ch.id] ?? new Set()}
              onToggleSlot={handleToggleSlot}
              onDragSlots={handleDragSlots}
            />
          ))}
        </div>
      </div>

      <ChantierForm
        projetId={projetId}
        ocpId={ocp.id}
        open={chantierFormOpen}
        onOpenChange={setChantierFormOpen}
        nextOrdre={ocp.chantiersElementaires.length}
      />
    </div>
  );
}
