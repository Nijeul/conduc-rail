"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addFournisseur } from "@/actions/matrice";
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

interface AddFournisseurDialogProps {
  projetId: string;
  matriceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCount: number;
}

export function AddFournisseurDialog({
  projetId,
  matriceId,
  open,
  onOpenChange,
  currentCount,
}: AddFournisseurDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [nom, setNom] = useState("");
  const [refOffre, setRefOffre] = useState("");
  const [dateOffre, setDateOffre] = useState("");
  const [paysFabrication, setPaysFabrication] = useState("");
  const [incoterm, setIncoterm] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await addFournisseur(projetId, matriceId, {
      nom,
      rang: currentCount + 1,
      refOffre: refOffre || null,
      dateOffre: dateOffre || null,
      paysFabrication: paysFabrication || null,
      incoterm: incoterm || null,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setNom("");
    setRefOffre("");
    setDateOffre("");
    setPaysFabrication("");
    setIncoterm("");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#004489]">
            Ajouter un fournisseur
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-[#E20025] bg-[#FDEAED] px-3 py-2 rounded">
              {error}
            </p>
          )}
          {currentCount >= 5 && (
            <p className="text-sm text-[#DD9412] bg-[#FFF7D1] px-3 py-2 rounded">
              Maximum 5 fournisseurs par matrice.
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="nom">Nom du fournisseur *</Label>
            <Input
              id="nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Acme SAS"
              required
              disabled={currentCount >= 5}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="refOffre">Ref. offre</Label>
              <Input
                id="refOffre"
                value={refOffre}
                onChange={(e) => setRefOffre(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOffre">Date offre</Label>
              <Input
                id="dateOffre"
                type="date"
                value={dateOffre}
                onChange={(e) => setDateOffre(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pays">Pays fabrication</Label>
              <Input
                id="pays"
                value={paysFabrication}
                onChange={(e) => setPaysFabrication(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="incoterm">Incoterm</Label>
              <Input
                id="incoterm"
                value={incoterm}
                onChange={(e) => setIncoterm(e.target.value)}
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
              disabled={loading || currentCount >= 5}
              className="bg-[#004489] text-white hover:bg-[#003370]"
            >
              {loading ? "..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
