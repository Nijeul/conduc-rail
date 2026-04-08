"use client";

import { useCallback, useRef, useState, useMemo } from "react";
import { saveNotations } from "@/actions/matrice";
import { cn } from "@/lib/utils";

type Notation = {
  id: string;
  critereId: string;
  fournisseurId: string;
  valeurTexte: string | null;
  note: number | null;
  valeurBool: boolean | null;
  commentaire: string | null;
  estNonConformiteMajeure: boolean;
  estNonConformiteNegociable: boolean;
};

type Critere = {
  id: string;
  famille: string;
  libelle: string;
  coefficient: number;
  ordreAffichage: number;
  type: string;
  notations: Notation[];
};

type Fournisseur = {
  id: string;
  nom: string;
  rang: number;
  decision: string;
  couleurDecision: string;
  notations: Notation[];
};

interface SelectionRMSTableProps {
  projetId: string;
  criteres: Critere[];
  fournisseurs: Fournisseur[];
}

export function SelectionRMSTable({
  projetId,
  criteres,
  fournisseurs,
}: SelectionRMSTableProps) {
  const noteCriteres = criteres.filter((c) => c.type === "note_1_3");

  // Local notation state
  const [localNotations, setLocalNotations] = useState<
    Record<string, Record<string, number | null>>
  >(() => {
    const map: Record<string, Record<string, number | null>> = {};
    for (const f of fournisseurs) {
      map[f.id] = {};
      for (const n of f.notations) {
        map[f.id][n.critereId] = n.note;
      }
    }
    return map;
  });

  const saveTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const scheduleSave = useCallback(
    (fournisseurId: string) => {
      clearTimeout(saveTimers.current[fournisseurId]);
      saveTimers.current[fournisseurId] = setTimeout(async () => {
        const fNotations = localNotations[fournisseurId] ?? {};
        const notations = Object.entries(fNotations).map(([critereId, note]) => ({
          critereId,
          note,
          estNonConformiteMajeure: false,
          estNonConformiteNegociable: false,
        }));
        await saveNotations(projetId, fournisseurId, notations);
      }, 500);
    },
    [projetId, localNotations]
  );

  const handleNoteChange = useCallback(
    (fournisseurId: string, critereId: string, note: number) => {
      setLocalNotations((prev) => {
        const fMap = { ...(prev[fournisseurId] ?? {}) };
        fMap[critereId] = note;
        const next = { ...prev, [fournisseurId]: fMap };
        return next;
      });
      // Schedule save after state update
      setTimeout(() => scheduleSave(fournisseurId), 0);
    },
    [scheduleSave]
  );

  // Calculate scores
  const scores = useMemo(() => {
    const result: Record<string, {
      byRow: Record<string, number>;
      total: number;
      max: number;
    }> = {};

    const max = noteCriteres.reduce((sum, c) => sum + 3 * c.coefficient, 0);

    for (const f of fournisseurs) {
      const byRow: Record<string, number> = {};
      let total = 0;
      for (const c of noteCriteres) {
        const note = localNotations[f.id]?.[c.id] ?? 0;
        const weighted = note * c.coefficient;
        byRow[c.id] = weighted;
        total += weighted;
      }
      result[f.id] = { byRow, total, max };
    }
    return result;
  }, [noteCriteres, fournisseurs, localNotations]);

  // Ranking
  const ranking = useMemo(() => {
    const sorted = [...fournisseurs].sort(
      (a, b) => (scores[b.id]?.total ?? 0) - (scores[a.id]?.total ?? 0)
    );
    return Object.fromEntries(sorted.map((f, i) => [f.id, i + 1]));
  }, [fournisseurs, scores]);

  return (
    <div className="overflow-x-auto border border-[#DCDCDC] rounded-lg">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#004489]">
            <th className="px-3 py-2 text-left text-white font-bold min-w-[200px]">
              Critere
            </th>
            <th className="px-2 py-2 text-center text-white font-bold w-16">
              Coeff.
            </th>
            {fournisseurs.map((f) => (
              <th
                key={f.id}
                className="px-2 py-2 text-center text-white font-bold min-w-[120px]"
              >
                <div>{f.nom}</div>
                <div className="text-[10px] font-normal opacity-80">
                  Rang #{ranking[f.id]}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {noteCriteres.map((c, idx) => (
            <tr
              key={c.id}
              className={cn(
                "border-b border-[#DCDCDC]",
                idx % 2 === 1 ? "bg-[#F0F0F0]" : "bg-white"
              )}
            >
              <td className="px-3 py-2 text-left">{c.libelle}</td>
              <td className="px-2 py-2 text-center font-bold text-[#004489]">
                {c.coefficient}
              </td>
              {fournisseurs.map((f) => {
                const note = localNotations[f.id]?.[c.id];
                const weighted = scores[f.id]?.byRow[c.id] ?? 0;
                return (
                  <td key={f.id} className="px-1 py-1">
                    <div className="flex items-center gap-1 justify-center">
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => handleNoteChange(f.id, c.id, v)}
                            className={cn(
                              "w-6 h-6 rounded text-[10px] font-bold border transition-colors",
                              note === v
                                ? v === 1
                                  ? "bg-[#FDEAED] text-[#E20025] border-[#E20025]"
                                  : v === 2
                                  ? "bg-[#FFF7D1] text-[#DD9412] border-[#DD9412]"
                                  : "bg-[#E8EFDA] text-[#5E8019] border-[#5E8019]"
                                : "bg-white text-[#5A5A5A] border-[#DCDCDC] hover:border-[#004489]"
                            )}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] text-[#5A5A5A] w-8 text-right">
                        ={weighted}
                      </span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-[#003370]">
            <td className="px-3 py-2 text-white font-bold" colSpan={2}>
              Score total
            </td>
            {fournisseurs.map((f) => (
              <td
                key={f.id}
                className="px-2 py-2 text-center"
              >
                <span className="font-bold text-sm text-white">
                  {scores[f.id]?.total ?? 0}
                </span>
                <span className="text-[10px] text-white/70 ml-1">
                  / {scores[f.id]?.max ?? 0}
                </span>
              </td>
            ))}
          </tr>
          <tr className="bg-[#003370]/80">
            <td className="px-3 py-1 text-white font-bold text-[10px]" colSpan={2}>
              Classement
            </td>
            {fournisseurs.map((f) => (
              <td key={f.id} className="px-2 py-1 text-center">
                <span
                  className={cn(
                    "inline-block px-2 py-0.5 rounded-full text-xs font-bold",
                    ranking[f.id] === 1
                      ? "bg-[#E8EFDA] text-[#5E8019]"
                      : "bg-white/20 text-white"
                  )}
                >
                  #{ranking[f.id]}
                </span>
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
