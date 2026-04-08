"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { calculerResultats } from "@/actions/matrice";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMontant, formatDateFR } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

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
  type: string;
  notations: Notation[];
};

type Fournisseur = {
  id: string;
  nom: string;
  rang: number;
  refOffre: string | null;
  decision: string;
  couleurDecision: string;
  notations: Notation[];
};

interface MatriceDashboardProps {
  projetId: string;
  matriceId: string;
  matrice: {
    titre: string;
    budgetTheorique: number | null;
    devise: string;
    seuilGo: number;
    createdAt: Date;
  };
  criteres: Critere[];
  fournisseurs: Fournisseur[];
}

function getDecisionStyle(decision: string, couleur: string) {
  if (decision === "go") {
    return { bg: "bg-[#E8EFDA]", text: "text-[#5E8019]", label: "GO" };
  }
  if (couleur === "rouge") {
    return { bg: "bg-[#FDEAED]", text: "text-[#E20025]", label: "NO-GO" };
  }
  return { bg: "bg-[#FFF7D1]", text: "text-[#DD9412]", label: "NO-GO" };
}

export function MatriceDashboard({
  projetId,
  matriceId,
  matrice,
  criteres,
  fournisseurs,
}: MatriceDashboardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Calculate scores locally
  const results = useMemo(() => {
    const noteCriteres = criteres.filter((c) => c.type === "note_1_3");
    const scoreMax = noteCriteres.reduce((s, c) => s + 3 * c.coefficient, 0);

    const data = fournisseurs.map((f) => {
      let score = 0;
      let hasNC = false;
      for (const c of noteCriteres) {
        const n = f.notations.find((n) => n.critereId === c.id);
        if (n?.note) score += n.note * c.coefficient;
        if (n?.estNonConformiteMajeure) hasNC = true;
      }
      // Also check all notations for NC
      for (const n of f.notations) {
        if (n.estNonConformiteMajeure) hasNC = true;
      }
      const scoreNormalise = scoreMax > 0 ? (score / scoreMax) * 100 : 0;
      return { ...f, score, scoreMax, scoreNormalise, hasNC };
    });

    data.sort((a, b) => b.scoreNormalise - a.scoreNormalise);
    return data;
  }, [criteres, fournisseurs]);

  // Best offer
  const bestOffer = results.find((r) => r.decision === "go");

  async function handleRecalculate() {
    setLoading(true);
    await calculerResultats(matriceId);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#F0F0F0] rounded-lg p-4">
          <div className="text-xs text-[#5A5A5A]">Matrice</div>
          <div className="font-bold text-sm text-[#004489]">{matrice.titre}</div>
        </div>
        <div className="bg-[#F0F0F0] rounded-lg p-4">
          <div className="text-xs text-[#5A5A5A]">Date de creation</div>
          <div className="font-bold text-sm">{formatDateFR(new Date(matrice.createdAt))}</div>
        </div>
        <div className="bg-[#F0F0F0] rounded-lg p-4">
          <div className="text-xs text-[#5A5A5A]">Budget theorique</div>
          <div className="font-bold text-sm text-[#004489]">
            {matrice.budgetTheorique != null
              ? formatMontant(matrice.budgetTheorique)
              : "-"}
          </div>
        </div>
        <div className="bg-[#F0F0F0] rounded-lg p-4">
          <div className="text-xs text-[#5A5A5A]">Offre retenue</div>
          <div className="font-bold text-sm text-[#5E8019]">
            {bestOffer ? bestOffer.nom : "Aucune"}
          </div>
        </div>
      </div>

      {/* Recalculate button */}
      <div className="flex justify-end">
        <Button
          onClick={handleRecalculate}
          disabled={loading}
          className="bg-[#004489] text-white hover:bg-[#003370]"
          size="sm"
        >
          <RefreshCw className={cn("h-3 w-3 mr-2", loading && "animate-spin")} />
          Recalculer les scores
        </Button>
      </div>

      {/* Results table */}
      <div className="overflow-x-auto border border-[#DCDCDC] rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#004489]">
              <th className="px-4 py-2 text-left text-white font-bold">Rang</th>
              <th className="px-4 py-2 text-left text-white font-bold">Fournisseur</th>
              <th className="px-4 py-2 text-center text-white font-bold">Score</th>
              <th className="px-4 py-2 text-center text-white font-bold">Score (%)</th>
              <th className="px-4 py-2 text-center text-white font-bold">Decision</th>
              <th className="px-4 py-2 text-left text-white font-bold">Ref. offre</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, idx) => {
              const style = getDecisionStyle(r.decision, r.couleurDecision);
              return (
                <tr
                  key={r.id}
                  className={cn(
                    "border-b border-[#DCDCDC]",
                    idx % 2 === 1 ? "bg-[#F0F0F0]" : "bg-white"
                  )}
                >
                  <td className="px-4 py-2 font-bold text-[#004489]">
                    #{idx + 1}
                  </td>
                  <td className="px-4 py-2 font-medium">{r.nom}</td>
                  <td className="px-4 py-2 text-center font-bold text-[#004489]">
                    {r.score} / {r.scoreMax}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {r.scoreNormalise.toFixed(1)}%
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span
                      className={cn(
                        "inline-block px-3 py-1 rounded-full text-xs font-bold",
                        style.bg,
                        style.text
                      )}
                    >
                      {style.label}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-[#5A5A5A]">
                    {r.refOffre ?? "-"}
                  </td>
                </tr>
              );
            })}
            {results.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#5A5A5A]">
                  Aucun fournisseur dans cette matrice.
                </td>
              </tr>
            )}
          </tbody>
          {results.length > 0 && (
            <tfoot>
              <tr className="bg-[#003370]">
                <td colSpan={2} className="px-4 py-2 text-white font-bold">
                  Seuil Go : {matrice.seuilGo}%
                </td>
                <td colSpan={4} className="px-4 py-2 text-white text-right text-xs">
                  {fournisseurs.length} fournisseur(s) evalue(s)
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
