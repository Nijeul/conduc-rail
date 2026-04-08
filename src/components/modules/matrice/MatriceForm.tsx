"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMatrice, updateMatrice } from "@/actions/matrice";
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

interface MatriceFormProps {
  projetId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matrice?: {
    id: string;
    titre: string;
    acheteur: string | null;
    site: string | null;
    familleAchats: string | null;
    budgetTheorique: number | null;
    devise: string;
    seuilGo: number;
  };
}

export function MatriceForm({
  projetId,
  open,
  onOpenChange,
  matrice,
}: MatriceFormProps) {
  const router = useRouter();
  const isEdit = !!matrice;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [titre, setTitre] = useState(matrice?.titre ?? "");
  const [acheteur, setAcheteur] = useState(matrice?.acheteur ?? "");
  const [site, setSite] = useState(matrice?.site ?? "");
  const [familleAchats, setFamilleAchats] = useState(
    matrice?.familleAchats ?? ""
  );
  const [budgetTheorique, setBudgetTheorique] = useState(
    matrice?.budgetTheorique?.toString() ?? ""
  );
  const [devise, setDevise] = useState(matrice?.devise ?? "EUR");
  const [seuilGo, setSeuilGo] = useState(
    matrice?.seuilGo?.toString() ?? "60"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      titre,
      acheteur: acheteur || null,
      site: site || null,
      familleAchats: familleAchats || null,
      budgetTheorique: budgetTheorique ? parseFloat(budgetTheorique) : null,
      devise,
      seuilGo: parseFloat(seuilGo) || 60,
    };

    const result = isEdit
      ? await updateMatrice(projetId, matrice!.id, payload)
      : await createMatrice(projetId, payload);

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onOpenChange(false);
    if (!isEdit && result.success && "data" in result && result.data) {
      router.push(`/projets/${projetId}/matrice/${result.data.id}`);
    } else {
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#004489]">
            {isEdit ? "Modifier la matrice" : "Nouvelle matrice decisionnelle"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-[#E20025] bg-[#FDEAED] px-3 py-2 rounded">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="titre">Titre *</Label>
            <Input
              id="titre"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex: Matrice rails UIC60"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="acheteur">Acheteur</Label>
              <Input
                id="acheteur"
                value={acheteur}
                onChange={(e) => setAcheteur(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site">Site</Label>
              <Input
                id="site"
                value={site}
                onChange={(e) => setSite(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="familleAchats">Famille d&apos;achats</Label>
            <Input
              id="familleAchats"
              value={familleAchats}
              onChange={(e) => setFamilleAchats(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget theorique</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="0"
                value={budgetTheorique}
                onChange={(e) => setBudgetTheorique(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="devise">Devise</Label>
              <Input
                id="devise"
                value={devise}
                onChange={(e) => setDevise(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seuil">Seuil Go (%)</Label>
              <Input
                id="seuil"
                type="number"
                min="0"
                max="100"
                value={seuilGo}
                onChange={(e) => setSeuilGo(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#004489] text-[#004489]"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#004489] text-white hover:bg-[#003370]"
            >
              {loading ? "..." : isEdit ? "Enregistrer" : "Creer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
