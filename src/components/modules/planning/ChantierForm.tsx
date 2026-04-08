"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createChantierElementaire } from "@/actions/planning";

interface ChantierFormProps {
  projetId: string;
  ocpId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nextOrdre: number;
}

export function ChantierForm({
  projetId,
  ocpId,
  open,
  onOpenChange,
  nextOrdre,
}: ChantierFormProps) {
  const [libelle, setLibelle] = useState("");
  const [estGroupe, setEstGroupe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await createChantierElementaire(projetId, ocpId, {
        libelle,
        categorie: null,
        estGroupe,
        ordreAffichage: nextOrdre,
        dureePlanifieeMinutes: 0,
      });

      if (!result.success) {
        setError(result.error);
      } else {
        setLibelle("");
        setEstGroupe(false);
        onOpenChange(false);
      }
    } catch {
      setError("Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Ajouter un chantier elementaire</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="libelle">Libelle</Label>
            <Input
              id="libelle"
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              required
              placeholder="Depose catenaire V1"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="estGroupe"
              checked={estGroupe}
              onChange={(e) => setEstGroupe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
              style={{ accentColor: "#004489" }}
            />
            <Label htmlFor="estGroupe" className="cursor-pointer">
              Ligne de groupe (titre / separateur)
            </Label>
          </div>
          {error && <p className="text-sm" style={{ color: "#E20025" }}>{error}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              style={{ borderColor: "#004489", color: "#004489" }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: "#004489" }}
              className="text-white hover:opacity-90"
            >
              {loading ? "..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
