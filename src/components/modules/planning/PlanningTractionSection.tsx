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
import { addTractionLink, removeTractionLink } from "@/actions/planning";

interface TractionLink {
  id: string;
  heureArrivee: Date;
  heureDepart: Date;
  label: string | null;
  composition: {
    id: string;
    titre: string | null;
    date: Date | null;
    sens: string;
    vehicules: unknown;
  };
}

interface CompositionOption {
  id: string;
  titre: string | null;
  date: Date | null;
  sens: string;
}

interface PlanningTractionSectionProps {
  projetId: string;
  ocpId: string;
  links: TractionLink[];
  compositions: CompositionOption[];
  slotCount: number;
  colWidth: number;
  startMs: number;
  stepMs: number;
}

export function PlanningTractionSection({
  projetId,
  ocpId,
  links,
  compositions,
  slotCount,
  colWidth,
  startMs,
  stepMs,
}: PlanningTractionSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<TractionLink | null>(null);

  // Add form state
  const [formCompositionId, setFormCompositionId] = useState("");
  const [formArrivee, setFormArrivee] = useState("");
  const [formDepart, setFormDepart] = useState("");
  const [formLabel, setFormLabel] = useState("");

  const handleAdd = useCallback(() => {
    if (!formCompositionId || !formArrivee || !formDepart) return;
    startTransition(async () => {
      await addTractionLink(projetId, ocpId, {
        compositionId: formCompositionId,
        heureArrivee: formArrivee,
        heureDepart: formDepart,
        label: formLabel || undefined,
      });
      setAddDialogOpen(false);
      setFormCompositionId("");
      setFormArrivee("");
      setFormDepart("");
      setFormLabel("");
      router.refresh();
    });
  }, [projetId, ocpId, formCompositionId, formArrivee, formDepart, formLabel, router]);

  const handleRemove = useCallback(
    (linkId: string) => {
      startTransition(async () => {
        await removeTractionLink(projetId, linkId);
        router.refresh();
      });
    },
    [projetId, router]
  );

  const handleBarClick = useCallback((link: TractionLink) => {
    setSelectedLink(link);
    setViewDialogOpen(true);
  }, []);

  // Parse vehicules for display
  const renderVehicules = (vehicules: unknown) => {
    if (!Array.isArray(vehicules) || vehicules.length === 0) {
      return <p className="italic" style={{ color: "#5A5A5A" }}>Aucun véhicule</p>;
    }
    return (
      <div className="space-y-1">
        {(vehicules as Array<{ designation?: string; type?: string; nombre?: number }>).map((v, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-xs px-2 py-1 rounded"
            style={{ backgroundColor: "#F0F0F0" }}
          >
            <span className="font-medium">{v.designation || v.type || "Véhicule"}</span>
            {v.nombre && v.nombre > 1 && (
              <span
                className="text-[10px] px-1 rounded"
                style={{ backgroundColor: "#FF8F00", color: "#FFFFFF" }}
              >
                x{v.nombre}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

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
            backgroundColor: "#FF8F00",
            borderColor: "#E07D00",
            color: "#FFFFFF",
          }}
        >
          <span>TRACTION</span>
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
                backgroundColor: "#FFF7D1",
              }}
            />
          ))}
        </div>
      </div>

      {/* Traction link rows */}
      {links.map((link) => {
        const arriveeMs = new Date(link.heureArrivee).getTime();
        const departMs = new Date(link.heureDepart).getTime();
        const startSlot = Math.max(0, Math.floor((arriveeMs - startMs) / stepMs));
        const endSlot = Math.min(slotCount, Math.ceil((departMs - startMs) / stepMs));
        const barLeftPx = startSlot * colWidth;
        const barWidthPx = Math.max(0, (endSlot - startSlot) * colWidth);

        const displayLabel = link.label || link.composition.titre || "Train";

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
              title={displayLabel}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5 shrink-0"
                style={{ backgroundColor: "#FF8F00" }}
              />
              <span className="truncate flex-1">{displayLabel}</span>
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
                    backgroundColor: "#FF8F00",
                  }}
                  onClick={() => handleBarClick(link)}
                  title={`${displayLabel} — cliquer pour voir`}
                >
                  <span className="text-[9px] text-white font-medium truncate px-1">
                    {displayLabel}
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
            Aucune composition liée
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
            <DialogTitle>Lier une Composition TTx</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Composition TTx</Label>
              <Select value={formCompositionId} onValueChange={setFormCompositionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {compositions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.titre || "Sans titre"}
                      {c.date ? ` — ${new Date(c.date).toLocaleDateString("fr-FR")}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Heure arrivée</Label>
                <Input
                  type="datetime-local"
                  value={formArrivee}
                  onChange={(e) => setFormArrivee(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Heure départ</Label>
                <Input
                  type="datetime-local"
                  value={formDepart}
                  onChange={(e) => setFormDepart(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Label (optionnel)</Label>
              <Input
                placeholder="Ex: BML 108-32"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
              />
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
                disabled={isPending || !formCompositionId || !formArrivee || !formDepart}
                style={{ backgroundColor: "#FF8F00" }}
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
              {selectedLink?.label || selectedLink?.composition.titre || "Composition TTx"}
            </DialogTitle>
          </DialogHeader>
          {selectedLink && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium" style={{ color: "#5A5A5A" }}>Composition</span>
                  <p>{selectedLink.composition.titre || "Sans titre"}</p>
                </div>
                <div>
                  <span className="font-medium" style={{ color: "#5A5A5A" }}>Sens</span>
                  <p>{selectedLink.composition.sens}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium" style={{ color: "#5A5A5A" }}>Arrivée</span>
                  <p>{new Date(selectedLink.heureArrivee).toLocaleString("fr-FR")}</p>
                </div>
                <div>
                  <span className="font-medium" style={{ color: "#5A5A5A" }}>Départ</span>
                  <p>{new Date(selectedLink.heureDepart).toLocaleString("fr-FR")}</p>
                </div>
              </div>
              <div>
                <span className="font-medium" style={{ color: "#5A5A5A" }}>Véhicules</span>
                <div className="mt-1">
                  {renderVehicules(selectedLink.composition.vehicules)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
