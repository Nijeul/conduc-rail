"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMatrice, dupliquerMatrice } from "@/actions/matrice";
import { MatriceForm } from "./MatriceForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatMontant, formatDateFR } from "@/lib/utils";
import { Plus, Copy, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type MatriceItem = {
  id: string;
  titre: string;
  acheteur: string | null;
  site: string | null;
  familleAchats: string | null;
  budgetTheorique: number | null;
  devise: string;
  seuilGo: number;
  statut: string;
  createdAt: Date;
  _count: {
    fournisseurs: number;
    criteres: number;
  };
};

interface MatriceListProps {
  projetId: string;
  matrices: MatriceItem[];
}

const STATUT_STYLES: Record<string, { bg: string; text: string }> = {
  brouillon: { bg: "bg-[#FFF7D1]", text: "text-[#DD9412]" },
  en_cours: { bg: "bg-[#E5EFF8]", text: "text-[#004489]" },
  finalise: { bg: "bg-[#E8EFDA]", text: "text-[#5E8019]" },
};

export function MatriceList({ projetId, matrices }: MatriceListProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteId) return;
    await deleteMatrice(projetId, deleteId);
    setDeleteId(null);
    router.refresh();
  }

  async function handleDuplicate(matriceId: string) {
    setDuplicating(matriceId);
    await dupliquerMatrice(projetId, matriceId);
    setDuplicating(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#004489]">
          Matrices decisionnelles
        </h2>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-[#004489] text-white hover:bg-[#003370]"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle matrice
        </Button>
      </div>

      {/* Table */}
      <div className="border border-[#DCDCDC] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#004489]">
              <th className="px-4 py-2 text-left text-white font-bold">
                Titre
              </th>
              <th className="px-4 py-2 text-left text-white font-bold">
                Acheteur
              </th>
              <th className="px-4 py-2 text-right text-white font-bold">
                Budget
              </th>
              <th className="px-4 py-2 text-center text-white font-bold">
                Fournisseurs
              </th>
              <th className="px-4 py-2 text-center text-white font-bold">
                Statut
              </th>
              <th className="px-4 py-2 text-center text-white font-bold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {matrices.map((m, idx) => {
              const statut = STATUT_STYLES[m.statut] ?? STATUT_STYLES.brouillon;
              return (
                <tr
                  key={m.id}
                  className={cn(
                    "border-b border-[#DCDCDC] cursor-pointer hover:bg-[#E5EFF8] transition-colors",
                    idx % 2 === 1 ? "bg-[#F0F0F0]" : "bg-white"
                  )}
                  onDoubleClick={() =>
                    router.push(`/projets/${projetId}/matrice/${m.id}`)
                  }
                >
                  <td className="px-4 py-2 font-medium">{m.titre}</td>
                  <td className="px-4 py-2 text-[#5A5A5A]">
                    {m.acheteur ?? "-"}
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-[#004489]">
                    {m.budgetTheorique != null
                      ? formatMontant(m.budgetTheorique)
                      : "-"}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {m._count.fournisseurs}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Badge
                      className={cn(
                        "text-xs font-medium",
                        statut.bg,
                        statut.text
                      )}
                      variant="secondary"
                    >
                      {m.statut === "brouillon"
                        ? "Brouillon"
                        : m.statut === "en_cours"
                        ? "En cours"
                        : "Finalise"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-[#004489] hover:bg-[#E5EFF8]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(m.id);
                        }}
                        disabled={duplicating === m.id}
                        title="Dupliquer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-[#E20025] hover:bg-[#FDEAED]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(m.id);
                        }}
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {matrices.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-[#5A5A5A]"
                >
                  Aucune matrice decisionnelle. Cliquez sur &quot;Nouvelle
                  matrice&quot; pour commencer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create dialog */}
      <MatriceForm
        projetId={projetId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette matrice ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irreversible. Toutes les notations et fournisseurs
              associes seront supprimees.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#004489] text-[#004489]">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-[#E20025] text-white hover:bg-[#B8001E]"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
