"use client";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type CritereType = "texte" | "note_1_3" | "booleen" | "date" | "montant";

interface Notation {
  valeurTexte?: string | null;
  note?: number | null;
  valeurBool?: boolean | null;
  estNonConformiteMajeure: boolean;
  estNonConformiteNegociable: boolean;
}

interface CritereRowProps {
  critereId: string;
  libelle: string;
  type: CritereType;
  coefficient: number;
  fournisseurNotations: Record<
    string,
    Notation
  >;
  fournisseurIds: string[];
  onNotationChange: (
    fournisseurId: string,
    critereId: string,
    data: Partial<Notation>
  ) => void;
  showCoefficient?: boolean;
}

function getCellBg(notation: Notation | undefined): string {
  if (!notation) return "";
  if (notation.estNonConformiteMajeure) return "bg-[#FDEAED]";
  if (notation.estNonConformiteNegociable) return "bg-[#FFF7D1]";
  return "";
}

export function CritereRow({
  critereId,
  libelle,
  type,
  coefficient,
  fournisseurNotations,
  fournisseurIds,
  onNotationChange,
  showCoefficient = false,
}: CritereRowProps) {
  function renderCell(fournisseurId: string) {
    const notation = fournisseurNotations[fournisseurId] ?? {
      valeurTexte: null,
      note: null,
      valeurBool: null,
      estNonConformiteMajeure: false,
      estNonConformiteNegociable: false,
    };

    const cellBg = getCellBg(notation);

    switch (type) {
      case "texte":
        return (
          <div className={cn("px-1", cellBg)}>
            <Input
              className="h-7 text-xs border-[#DCDCDC] focus:border-[#004489]"
              value={notation.valeurTexte ?? ""}
              onChange={(e) =>
                onNotationChange(fournisseurId, critereId, {
                  valeurTexte: e.target.value,
                })
              }
            />
          </div>
        );

      case "note_1_3":
        return (
          <div className={cn("px-1 space-y-1", cellBg)}>
            <div className="flex gap-1 justify-center">
              {[1, 2, 3].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() =>
                    onNotationChange(fournisseurId, critereId, { note: v })
                  }
                  className={cn(
                    "w-7 h-7 rounded text-xs font-bold border transition-colors",
                    notation.note === v
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
            <div className="flex gap-2 justify-center text-[10px]">
              <label className="flex items-center gap-1 cursor-pointer">
                <Checkbox
                  checked={notation.estNonConformiteMajeure}
                  onCheckedChange={(checked) =>
                    onNotationChange(fournisseurId, critereId, {
                      estNonConformiteMajeure: !!checked,
                    })
                  }
                  className="h-3 w-3"
                />
                <span className="text-[#E20025]">NC maj.</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <Checkbox
                  checked={notation.estNonConformiteNegociable}
                  onCheckedChange={(checked) =>
                    onNotationChange(fournisseurId, critereId, {
                      estNonConformiteNegociable: !!checked,
                    })
                  }
                  className="h-3 w-3"
                />
                <span className="text-[#DD9412]">NC neg.</span>
              </label>
            </div>
          </div>
        );

      case "booleen":
        return (
          <div className={cn("px-1 flex justify-center items-center h-full", cellBg)}>
            <Checkbox
              checked={notation.valeurBool ?? false}
              onCheckedChange={(checked) =>
                onNotationChange(fournisseurId, critereId, {
                  valeurBool: !!checked,
                })
              }
            />
          </div>
        );

      case "date":
        return (
          <div className={cn("px-1", cellBg)}>
            <Input
              type="date"
              className="h-7 text-xs border-[#DCDCDC] focus:border-[#004489]"
              value={notation.valeurTexte ?? ""}
              onChange={(e) =>
                onNotationChange(fournisseurId, critereId, {
                  valeurTexte: e.target.value,
                })
              }
            />
          </div>
        );

      case "montant":
        return (
          <div className={cn("px-1", cellBg)}>
            <Input
              type="number"
              step="0.01"
              className="h-7 text-xs border-[#DCDCDC] focus:border-[#004489] text-right"
              value={notation.valeurTexte ?? ""}
              onChange={(e) =>
                onNotationChange(fournisseurId, critereId, {
                  valeurTexte: e.target.value,
                })
              }
            />
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <tr className="border-b border-[#DCDCDC] hover:bg-[#E5EFF8]/30">
      <td className="px-3 py-2 text-xs text-left text-[#000000] whitespace-nowrap">
        {libelle}
      </td>
      {showCoefficient && (
        <td className="px-2 py-2 text-xs text-center font-medium text-[#004489]">
          {coefficient}
        </td>
      )}
      {fournisseurIds.map((fId) => (
        <td key={fId} className="px-1 py-1 min-w-[140px]">
          {renderCell(fId)}
        </td>
      ))}
    </tr>
  );
}
