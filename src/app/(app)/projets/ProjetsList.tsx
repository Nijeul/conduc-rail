"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateFR } from "@/lib/utils";
import { createProjet, deleteProjet } from "@/actions/projets";
import type { ProjetWithMembers, ProjetPartage } from "@/types";
import { Plus, Users, FileText, MoreVertical, Trash2, FolderOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface ProjetsListProps {
  mesProjets: ProjetWithMembers[];
  projetsPartages: ProjetPartage[];
  currentUserId: string;
}

export function ProjetsList({ mesProjets, projetsPartages, currentUserId }: ProjetsListProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<ProjetWithMembers | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleCreate(formData: FormData) {
    setCreating(true);
    setError("");
    const result = await createProjet(formData);
    if (result.success) {
      setDialogOpen(false);
      router.push(`/projets/${result.data.id}/suivi/rapports`);
    } else {
      setError(result.error);
    }
    setCreating(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteProjet(deleteTarget.id);
    if (result.success) {
      setDeleteTarget(null);
      setDeleteConfirmName("");
      router.refresh();
    } else {
      setError(result.error);
    }
    setDeleting(false);
  }

  function ProjetCard({ projet, showMenu }: { projet: ProjetWithMembers; showMenu: boolean }) {
    return (
      <div
        className="relative bg-white rounded-lg border border-border p-5 text-left
                   hover:shadow-md hover:border-primary/30 transition-all group cursor-pointer"
        onClick={() => router.push(`/projets/${projet.id}/suivi/rapports`)}
      >
        {showMenu && (
          <div className="absolute top-3 right-3 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded-md hover:bg-gray-100 text-text-secondary
                             hover:text-text-main transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(projet);
                    setDeleteConfirmName("");
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer ce projet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <h3 className="font-semibold text-text-main group-hover:text-primary transition-colors pr-8">
          {projet.name}
        </h3>
        {projet.description && (
          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
            {projet.description}
          </p>
        )}
        <div className="flex items-center gap-4 mt-4 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {projet._count?.members ?? projet.members.length} membre
            {(projet._count?.members ?? projet.members.length) !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {projet._count?.rapports ?? 0} rapport
            {(projet._count?.rapports ?? 0) !== 1 ? "s" : ""}
          </span>
          <span className="ml-auto">
            {formatDateFR(new Date(projet.createdAt))}
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Section : Mes projets ── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-[#004489]" />
            <h2 className="text-base font-semibold text-[#004489]">Mes projets</h2>
            <span className="text-sm text-text-secondary ml-1">
              ({mesProjets.length})
            </span>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="btn-action flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouveau projet
          </button>
        </div>

        {mesProjets.length === 0 ? (
          <div className="text-center py-12 text-text-secondary bg-white rounded-lg border border-border">
            <p className="text-base mb-2">Aucun projet</p>
            <p className="text-sm">Creez votre premier projet pour commencer.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {mesProjets.map((projet) => (
              <ProjetCard key={projet.id} projet={projet} showMenu={true} />
            ))}
          </div>
        )}
      </div>

      {/* ── Section : Partages avec moi ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-[#004489]" />
          <h2 className="text-base font-semibold text-[#004489]">Partages avec moi</h2>
          <span className="text-sm text-text-secondary ml-1">
            ({projetsPartages.length})
          </span>
        </div>

        {projetsPartages.length === 0 ? (
          <div className="text-center py-8 text-text-secondary text-sm">
            Aucun projet partage avec vous
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projetsPartages.map((projet) => (
              <div key={projet.id} className="relative">
                <ProjetCard projet={projet} showMenu={false} />
                <div className="absolute top-3 right-3 z-10">
                  <span className="inline-flex items-center gap-1 text-xs bg-[#F0F0F0] text-[#5A5A5A] px-2 py-0.5 rounded-full">
                    <Users className="h-3 w-3" />
                    {projet.ownerName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteConfirmName("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce projet ?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Cette action est <strong className="text-red-600">irreversible</strong>.
                  Toutes les donnees associees seront definitivement supprimees :
                  rapports, soudures, courriers, evenements, compositions, fiches ecart, etc.
                </p>
                <p>
                  Pour confirmer, tapez le nom du projet :{" "}
                  <strong className="text-text-main">{deleteTarget?.name}</strong>
                </p>
                <input
                  type="text"
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder="Nom du projet"
                  className="w-full px-3 py-2 border border-border rounded-md text-sm
                             focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  autoFocus
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteConfirmName !== deleteTarget?.name || deleting}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? "Suppression..." : "Supprimer definitivement"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDialogOpen(false)}
          />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-text-main mb-4">
              Nouveau projet
            </h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-danger rounded-md px-3 py-2 text-sm mb-4">
                {error}
              </div>
            )}

            <form action={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">
                    Nom du projet
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Ex : Chantier LGV Nord"
                    className="w-full px-3 py-2 border border-border rounded-md text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Description du chantier..."
                    className="w-full px-3 py-2 border border-border rounded-md text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="px-4 py-2 text-sm text-text-secondary hover:text-text-main transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-action disabled:opacity-50"
                >
                  {creating ? "Creation..." : "Creer le projet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
