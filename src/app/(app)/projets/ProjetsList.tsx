"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateFR } from "@/lib/utils";
import { createProjet } from "@/actions/projets";
import type { ProjetWithMembers } from "@/types";
import { Plus, Users, FileText } from "lucide-react";

interface ProjetsListProps {
  projets: ProjetWithMembers[];
}

export function ProjetsList({ projets }: ProjetsListProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <>
      {/* Header with create button */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-text-secondary text-sm">
          {projets.length} projet{projets.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setDialogOpen(true)}
          className="btn-action flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouveau projet
        </button>
      </div>

      {/* Grid */}
      {projets.length === 0 ? (
        <div className="text-center py-20 text-text-secondary">
          <p className="text-lg mb-2">Aucun projet</p>
          <p className="text-sm">
            Creez votre premier projet pour commencer.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projets.map((projet) => (
            <button
              key={projet.id}
              onClick={() =>
                router.push(`/projets/${projet.id}/suivi/rapports`)
              }
              className="bg-white rounded-lg border border-border p-5 text-left
                         hover:shadow-md hover:border-primary/30 transition-all group"
            >
              <h3 className="font-semibold text-text-main group-hover:text-primary transition-colors">
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
                  {(projet._count?.members ?? projet.members.length) !== 1
                    ? "s"
                    : ""}
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
            </button>
          ))}
        </div>
      )}

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
