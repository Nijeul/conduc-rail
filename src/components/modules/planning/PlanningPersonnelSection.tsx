"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addPersonnelLink, removePersonnelLink } from "@/actions/planning";

interface PersonnelLink {
  id: string;
  debut: Date;
  fin: Date;
  tableauService: {
    id: string;
    titre: string;
    entreprise: string | null;
    semaine: number;
    annee: number;
  };
}

interface TableauServiceOption {
  id: string;
  titre: string;
  entreprise: string | null;
  semaine: number;
  annee: number;
}

interface PlanningPersonnelSectionProps {
  projetId: string;
  ocpId: string;
  links: PersonnelLink[];
  tableaux: TableauServiceOption[];
  slotCount: number;
  colWidth: number;
  startMs: number;
  stepMs: number;
}

export function PlanningPersonnelSection({
  projetId,
  ocpId,
  links,
  tableaux,
  slotCount,
  colWidth,
  startMs,
  stepMs,
}: PlanningPersonnelSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<PersonnelLink | null>(null);

  // Add form state
  const [formTableauId, setFormTableauId] = useState("");
  const [formDebut, setFormDebut] = useState("");
  const [formFin, setFormFin] = useState("");

  const handleAdd = useCallback(() => {
    if (!formTableauId || !formDebut || !formFin) return;
    startTransition(async () => {
      await addPersonnelLink(projetId, ocpId, {
        tableauServiceId: formTableauId,
        debut: formDebut,
        fin: formFin,
      });
      setAddDialogOpen(false);
      setFormTableauId("");
      setFormDebut("");
      setFormFin("");
      router.refresh();
    });
  }, [projetId, ocpId, formTableauId, formDebut, formFin, router]);

  const handleRemove = useCallback(
    (linkId: string) => {
      startTransition(async () => {
        await removePersonnelLink(projetId, linkId);
        router.refresh();
      });
    },
    [projetId, router]
  );

  const handleBarClick = useCallback((link: PersonnelLink) => {
    setSelectedLink(link);
    setViewDialogOpen(true);
  }, []);

  return (
    <>
      {/* Section header */}
      <div className="flex">
        <div
          className="sticky left-0 z-10 flex items-center justify-between px-2 text-xs font-bold border-r border-b"
          style={{
            width: 180,
            minWidth: 180,
            height: 32,
            backgroundColor: "#004489",
            borderColor: "#003370",
            color: "#FFFFFF",
          }}
        >
          <span>PERSONNEL</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1 text-[10px] text-white hover:bg-white/20"
            onClick={() => setAddDialogOpen(true)}
          >
            + Ajouter
          </Button>
        </div>
        <div className="flex">
          {Array.from({ length: slotCount }).map((_, i) => (
            <div
              key={i}
              className="border-r border-b shrink-0"
              style={{
                width: colWidth,
                minWidth: colWidth,
                height: 32,
                borderColor: "#DCDCDC",
                backgroundColor: "#E5EFF8",
              }}
            />
          ))}
        </div>
      </div>

      {/* Personnel link rows */}
      {links.map((link) => {
        const debutMs = new Date(link.debut).getTime();
        const finMs = new Date(link.fin).getTime();
        const startSlot = Math.max(0, Math.floor((debutMs - startMs) / stepMs));
        const endSlot = Math.min(slotCount, Math.ceil((finMs - startMs) / stepMs));
        const barLeftPx = startSlot * colWidth;
        const barWidthPx = Math.max(0, (endSlot - startSlot) * colWidth);

        const label = link.tableauService.titre
          || `S${link.tableauService.semaine} ${link.tableauService.annee}`;

        return (
          <div key={link.id} className="flex">
            <div
              className="sticky left-0 z-10 flex items-center px-2 text-xs border-r border-b truncate bg-white"
              style={{
                width: 180,
                minWidth: 180,
                borderColor: "#DCDCDC",
                height: 28,
              }}
              title={label}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5 shrink-0"
                style={{ backgroundColor: "#004489" }}
              />
              <span className="truncate flex-1">{label}</span>
              <button
                className="ml-1 text-[10px] text-red-600 hover:text-red-800 shrink-0"
                onClick={() => handleRemove(link.id)}
                disabled={isPending}
                title="Supprimer"
              >
                ✕
              </button>
            </div>
            <div className="flex relative">
              {Array.from({ length: slotCount }).map((_, i) => (
                <div
                  key={i}
                  className="border-r border-b shrink-0"
                  style={{
                    width: colWidth,
                    minWidth: colWidth,
                    height: 28,
                    borderColor: "#DCDCDC",
                  }}
                />
              ))}
              {/* Bar overlay */}
              {barWidthPx > 0 && (
                <div
                  className="absolute top-1 cursor-pointer rounded-sm flex items-center justify-center overflow-hidden"
                  style={{
                    left: barLeftPx,
                    width: barWidthPx,
                    height: 20,
                    backgroundColor: "#004489",
                  }}
                  onClick={() => handleBarClick(link)}
                  title={`${label} — cliquer pour voir`}
                >
                  <span className="text-[9px] text-white font-medium truncate px-1">
                    {label}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {links.length === 0 && (
        <div className="flex">
          <div
            className="sticky left-0 z-10 flex items-center px-2 text-xs border-r border-b bg-white italic"
            style={{
              width: 180,
              minWidth: 180,
              borderColor: "#DCDCDC",
              height: 28,
              color: "#5A5A5A",
            }}
          >
            Aucun tableau lié
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
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lier un Tableau de Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Tableau de Service</Label>
              <Select value={formTableauId} onValueChange={setFormTableauId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {tableaux.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.titre || `S${t.semaine} ${t.annee}`}
                      {t.entreprise ? ` — ${t.entreprise}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Début</Label>
                <Input
                  type="datetime-local"
                  value={formDebut}
                  onChange={(e) => setFormDebut(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Fin</Label>
                <Input
                  type="datetime-local"
                  value={formFin}
                  onChange={(e) => setFormFin(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setAddDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={handleAdd}
                disabled={isPending || !formTableauId || !formDebut || !formFin}
                style={{ backgroundColor: "#004489" }}
              >
                {isPending ? "..." : "Ajouter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedLink?.tableauService.titre || "Tableau de Service"}
            </DialogTitle>
          </DialogHeader>
          {selectedLink && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium" style={{ color: "#5A5A5A" }}>Entreprise</span>
                  <p>{selectedLink.tableauService.entreprise || "—"}</p>
                </div>
                <div>
                  <span className="font-medium" style={{ color: "#5A5A5A" }}>Semaine</span>
                  <p>S{selectedLink.tableauService.semaine} / {selectedLink.tableauService.annee}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium" style={{ color: "#5A5A5A" }}>Début</span>
                  <p>{new Date(selectedLink.debut).toLocaleString("fr-FR")}</p>
                </div>
                <div>
                  <span className="font-medium" style={{ color: "#5A5A5A" }}>Fin</span>
                  <p>{new Date(selectedLink.fin).toLocaleString("fr-FR")}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
