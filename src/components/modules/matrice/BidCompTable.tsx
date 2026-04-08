"use client";

import { useCallback, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { saveNotations } from "@/actions/matrice";
import { CritereRow } from "./CritereRow";
import {
  FournisseurColumnHeader,
  FournisseurScoreFooter,
} from "./FournisseurColumn";
import { AddFournisseurDialog } from "./AddFournisseurDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatMontant } from "@/lib/utils";

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

interface BidCompTableProps {
  projetId: string;
  matriceId: string;
  matrice: {
    acheteur: string | null;
    site: string | null;
    familleAchats: string | null;
    budgetTheorique: number | null;
    devise: string;
    seuilGo: number;
  };
  criteres: Critere[];
  fournisseurs: Fournisseur[];
}

const FAMILLE_LABELS: Record<string, string> = {
  general: "General",
  qualite: "Qualite",
  couts: "Couts",
  delais: "Delais",
  service: "Service",
};

export function BidCompTable({
  projetId,
  matriceId,
  matrice,
  criteres,
  fournisseurs,
}: BidCompTableProps) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);

  // Local state for notations (for optimistic updates)
  const [localNotations, setLocalNotations] = useState<
    Record<string, Record<string, {
      valeurTexte?: string | null;
      note?: number | null;
      valeurBool?: boolean | null;
      estNonConformiteMajeure: boolean;
      estNonConformiteNegociable: boolean;
    }>>
  >(() => {
    const map: Record<string, Record<string, {
      valeurTexte?: string | null;
      note?: number | null;
      valeurBool?: boolean | null;
      estNonConformiteMajeure: boolean;
      estNonConformiteNegociable: boolean;
    }>> = {};
    for (const f of fournisseurs) {
      map[f.id] = {};
      for (const n of f.notations) {
        map[f.id][n.critereId] = {
          valeurTexte: n.valeurTexte,
          note: n.note,
          valeurBool: n.valeurBool,
          estNonConformiteMajeure: n.estNonConformiteMajeure,
          estNonConformiteNegociable: n.estNonConformiteNegociable,
        };
      }
    }
    return map;
  });

  // Debounced save
  const saveTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const scheduleSave = useCallback(
    (fournisseurId: string, notationMap: Record<string, {
      valeurTexte?: string | null;
      note?: number | null;
      valeurBool?: boolean | null;
      estNonConformiteMajeure: boolean;
      estNonConformiteNegociable: boolean;
    }>) => {
      clearTimeout(saveTimers.current[fournisseurId]);
      saveTimers.current[fournisseurId] = setTimeout(async () => {
        const notations = Object.entries(notationMap).map(([critereId, data]) => ({
          critereId,
          ...data,
        }));
        await saveNotations(projetId, fournisseurId, notations);
      }, 500);
    },
    [projetId]
  );

  const handleNotationChange = useCallback(
    (fournisseurId: string, critereId: string, data: Record<string, unknown>) => {
      setLocalNotations((prev) => {
        const fMap = { ...(prev[fournisseurId] ?? {}) };
        fMap[critereId] = {
          ...(fMap[critereId] ?? {
            valeurTexte: null,
            note: null,
            valeurBool: null,
            estNonConformiteMajeure: false,
            estNonConformiteNegociable: false,
          }),
          ...data,
        };
        const next = { ...prev, [fournisseurId]: fMap };
        scheduleSave(fournisseurId, fMap);
        return next;
      });
    },
    [scheduleSave]
  );

  // Group criteres by famille
  const grouped = useMemo(() => {
    const families: string[] = [];
    const map: Record<string, Critere[]> = {};
    for (const c of criteres) {
      if (!map[c.famille]) {
        map[c.famille] = [];
        families.push(c.famille);
      }
      map[c.famille].push(c);
    }
    return { families, map };
  }, [criteres]);

  // Calculate scores
  const scores = useMemo(() => {
    const result: Record<string, { score: number; scoreMax: number; scoreNormalise: number }> = {};
    const noteCriteres = criteres.filter((c) => c.type === "note_1_3");
    const scoreMax = noteCriteres.reduce((sum, c) => sum + 3 * c.coefficient, 0);

    for (const f of fournisseurs) {
      let score = 0;
      for (const c of noteCriteres) {
        const n = localNotations[f.id]?.[c.id];
        if (n?.note) {
          score += n.note * c.coefficient;
        }
      }
      const scoreNormalise = scoreMax > 0 ? (score / scoreMax) * 100 : 0;
      result[f.id] = { score, scoreMax, scoreNormalise };
    }
    return result;
  }, [criteres, fournisseurs, localNotations]);

  const fournisseurIds = fournisseurs.map((f) => f.id);

  return (
    <div className="space-y-4">
      {/* Header info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-[#F0F0F0] rounded-lg text-sm">
        {matrice.acheteur && (
          <div>
            <span className="text-[#5A5A5A]">Acheteur : </span>
            <span className="font-medium">{matrice.acheteur}</span>
          </div>
        )}
        {matrice.site && (
          <div>
            <span className="text-[#5A5A5A]">Site : </span>
            <span className="font-medium">{matrice.site}</span>
          </div>
        )}
        {matrice.familleAchats && (
          <div>
            <span className="text-[#5A5A5A]">Famille : </span>
            <span className="font-medium">{matrice.familleAchats}</span>
          </div>
        )}
        {matrice.budgetTheorique != null && (
          <div>
            <span className="text-[#5A5A5A]">Budget : </span>
            <span className="font-bold text-[#004489]">
              {formatMontant(matrice.budgetTheorique)}
            </span>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex justify-start">
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-[#004489] text-white hover:bg-[#003370] text-xs"
          size="sm"
          disabled={fournisseurs.length >= 5}
        >
          <Plus className="h-3 w-3 mr-1" />
          Fournisseur
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-[#DCDCDC] rounded-lg">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#004489]">
              <th className="px-3 py-2 text-left text-white font-bold min-w-[200px]">
                Critere
              </th>
              {fournisseurs.map((f) => (
                <FournisseurColumnHeader
                  key={f.id}
                  nom={f.nom}
                  decision={f.decision}
                  couleurDecision={f.couleurDecision}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {grouped.families.map((famille) => (
              <>
                {/* Famille header row */}
                <tr key={`fam-${famille}`}>
                  <td
                    colSpan={1 + fournisseurs.length}
                    className="px-3 py-1.5 text-xs font-bold text-white"
                    style={{ backgroundColor: "#004489" }}
                  >
                    {FAMILLE_LABELS[famille] ?? famille}
                  </td>
                </tr>
                {/* Critere rows */}
                {grouped.map[famille].map((c, idx) => (
                  <CritereRow
                    key={c.id}
                    critereId={c.id}
                    libelle={c.libelle}
                    type={c.type as "texte" | "note_1_3" | "booleen" | "date" | "montant"}
                    coefficient={c.coefficient}
                    fournisseurNotations={
                      Object.fromEntries(
                        fournisseurIds.map((fId) => [
                          fId,
                          localNotations[fId]?.[c.id] ?? {
                            valeurTexte: null,
                            note: null,
                            valeurBool: null,
                            estNonConformiteMajeure: false,
                            estNonConformiteNegociable: false,
                          },
                        ])
                      )
                    }
                    fournisseurIds={fournisseurIds}
                    onNotationChange={handleNotationChange}
                  />
                ))}
              </>
            ))}
          </tbody>
          {/* Score footer */}
          <tfoot>
            <tr className="bg-[#003370]">
              <td className="px-3 py-2 text-white font-bold text-xs">
                Score total
              </td>
              {fournisseurs.map((f) => (
                <FournisseurScoreFooter
                  key={f.id}
                  score={scores[f.id]?.score ?? 0}
                  scoreMax={scores[f.id]?.scoreMax ?? 0}
                  scoreNormalise={scores[f.id]?.scoreNormalise ?? 0}
                />
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <AddFournisseurDialog
        projetId={projetId}
        matriceId={matriceId}
        open={addOpen}
        onOpenChange={setAddOpen}
        currentCount={fournisseurs.length}
      />
    </div>
  );
}
