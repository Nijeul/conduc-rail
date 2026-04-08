"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { calculerResultats, updateFournisseur } from "@/actions/matrice";
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
  dateOffre: Date | null;
  montantOffre: number | null;
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

// --- Inline editable cell ---
type EditField = "nom" | "refOffre" | "montantOffre" | "dateOffre";

function InlineEdit({
  value,
  field,
  fournisseurId,
  projetId,
  onSaved,
}: {
  value: string;
  field: EditField;
  fournisseurId: string;
  projetId: string;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const inputType = field === "montantOffre" ? "number" : field === "dateOffre" ? "date" : "text";

  const handleStartEdit = () => {
    setEditing(true);
    setLocalValue(value);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSave = useCallback(async () => {
    setEditing(false);
    if (localValue === value) return;

    let payload: Record<string, unknown> = {};
    if (field === "montantOffre") {
      const num = parseFloat(localValue);
      payload = { montantOffre: isNaN(num) ? null : num };
    } else if (field === "dateOffre") {
      payload = { dateOffre: localValue || null };
    } else {
      payload = { [field]: localValue || null };
    }

    await updateFournisseur(projetId, fournisseurId, payload);
    onSaved();
  }, [localValue, value, field, projetId, fournisseurId, onSaved]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditing(false);
      setLocalValue(value);
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type={inputType}
          step={field === "montantOffre" ? "0.01" : undefined}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full px-1.5 py-0.5 text-xs border border-[#004489] rounded focus:outline-none focus:ring-1 focus:ring-[#004489] bg-white"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleStartEdit}
      className="text-left w-full px-1.5 py-0.5 rounded hover:bg-[#E5EFF8] transition-colors cursor-pointer group"
      title="Cliquer pour modifier"
    >
      <span className="group-hover:underline">{value || "-"}</span>
    </button>
  );
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

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

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
      for (const n of f.notations) {
        if (n.estNonConformiteMajeure) hasNC = true;
      }
      const scoreNormalise = scoreMax > 0 ? (score / scoreMax) * 100 : 0;
      return { ...f, score, scoreMax, scoreNormalise, hasNC };
    });

    data.sort((a, b) => b.scoreNormalise - a.scoreNormalise);
    return data;
  }, [criteres, fournisseurs]);

  // Best offer = first GO
  const bestOffer = results.find((r) => r.decision === "go");

  // Montant retenu = montantOffre of the #1 GO fournisseur
  const montantRetenu = bestOffer?.montantOffre ?? null;

  async function handleRecalculate() {
    setLoading(true);
    await calculerResultats(matriceId);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#F0F0F0] rounded-lg p-4">
          <div className="text-xs text-[#5A5A5A]">Matrice</div>
          <div className="font-bold text-sm text-[#004489]">{matrice.titre}</div>
        </div>
        <div className="bg-[#F0F0F0] rounded-lg p-4">
          <div className="text-xs text-[#5A5A5A]">Date de creation</div>
          <div className="font-bold text-sm">{formatDateFR(new Date(matrice.createdAt))}</div>
        </div>
        <div className="bg-[#E5EFF8] rounded-lg p-4 border border-[#004489]">
          <div className="text-xs text-[#5A5A5A]">Budget theorique</div>
          <div className="font-bold text-sm text-[#004489]">
            {matrice.budgetTheorique != null
              ? formatMontant(matrice.budgetTheorique)
              : "-"}
          </div>
        </div>
        <div className="bg-[#E8EFDA] rounded-lg p-4 border border-[#5E8019]">
          <div className="text-xs text-[#5A5A5A]">Montant retenu</div>
          <div className="font-bold text-sm text-[#5E8019]">
            {montantRetenu != null ? formatMontant(montantRetenu) : "-"}
          </div>
          {bestOffer && (
            <div className="text-xs text-[#5A5A5A] mt-0.5">
              {bestOffer.nom}
            </div>
          )}
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
              <th className="px-4 py-2 text-left text-white font-bold">Ref. offre</th>
              <th className="px-4 py-2 text-center text-white font-bold">Date offre</th>
              <th className="px-4 py-2 text-right text-white font-bold">Montant offre</th>
              <th className="px-4 py-2 text-right text-white font-bold">Ecart / Budget</th>
              <th className="px-4 py-2 text-center text-white font-bold">Score</th>
              <th className="px-4 py-2 text-center text-white font-bold">Score (%)</th>
              <th className="px-4 py-2 text-center text-white font-bold">Decision</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, idx) => {
              const style = getDecisionStyle(r.decision, r.couleurDecision);
              const ecart =
                r.montantOffre != null && matrice.budgetTheorique != null
                  ? r.montantOffre - matrice.budgetTheorique
                  : null;

              // Format dateOffre for input value (YYYY-MM-DD)
              const dateStr = r.dateOffre
                ? new Date(r.dateOffre).toISOString().split("T")[0]
                : "";

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
                  <td className="px-4 py-2 font-medium">
                    <InlineEdit
                      value={r.nom}
                      field="nom"
                      fournisseurId={r.id}
                      projetId={projetId}
                      onSaved={handleRefresh}
                    />
                  </td>
                  <td className="px-4 py-2 text-[#5A5A5A]">
                    <InlineEdit
                      value={r.refOffre ?? ""}
                      field="refOffre"
                      fournisseurId={r.id}
                      projetId={projetId}
                      onSaved={handleRefresh}
                    />
                  </td>
                  <td className="px-4 py-2 text-center text-[#5A5A5A]">
                    <InlineEdit
                      value={dateStr}
                      field="dateOffre"
                      fournisseurId={r.id}
                      projetId={projetId}
                      onSaved={handleRefresh}
                    />
                  </td>
                  <td className="px-4 py-2 text-right font-medium">
                    <InlineEdit
                      value={r.montantOffre != null ? String(r.montantOffre) : ""}
                      field="montantOffre"
                      fournisseurId={r.id}
                      projetId={projetId}
                      onSaved={handleRefresh}
                    />
                    {r.montantOffre != null && (
                      <div className="text-xs text-[#5A5A5A] px-1.5">
                        {formatMontant(r.montantOffre)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right font-bold">
                    {ecart != null ? (
                      <span
                        className={cn(
                          ecart < 0 ? "text-[#5E8019]" : ecart > 0 ? "text-[#E20025]" : "text-[#5A5A5A]"
                        )}
                      >
                        {ecart < 0 ? "" : ecart > 0 ? "+" : ""}
                        {formatMontant(ecart)}
                      </span>
                    ) : (
                      <span className="text-[#5A5A5A]">-</span>
                    )}
                  </td>
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
                </tr>
              );
            })}
            {results.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-[#5A5A5A]">
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
                <td colSpan={3} className="px-4 py-2 text-white text-center text-xs">
                  {matrice.budgetTheorique != null && (
                    <>Budget : {formatMontant(matrice.budgetTheorique)}</>
                  )}
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
