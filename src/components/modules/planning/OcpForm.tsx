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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createOCP, updateOCP } from "@/actions/planning";

interface OcpFormProps {
  projetId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    id: string;
    nom: string;
    dateDebut: Date;
    dateFin: Date;
    version: string;
    indice: string | null;
  };
}

function toLocalDatetimeString(d: Date): string {
  const dt = new Date(d);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

export function OcpForm({ projetId, open, onOpenChange, initialData }: OcpFormProps) {
  const isEdit = !!initialData;
  const [nom, setNom] = useState(initialData?.nom ?? "");
  const [dateDebut, setDateDebut] = useState(
    initialData ? toLocalDatetimeString(initialData.dateDebut) : ""
  );
  const [dateFin, setDateFin] = useState(
    initialData ? toLocalDatetimeString(initialData.dateFin) : ""
  );
  const [version, setVersion] = useState(initialData?.version ?? "BASE");
  const [indice, setIndice] = useState(initialData?.indice ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      nom,
      dateDebut: new Date(dateDebut),
      dateFin: new Date(dateFin),
      version,
      indice: indice || null,
    };

    try {
      const result = isEdit
        ? await updateOCP(projetId, initialData!.id, payload)
        : await createOCP(projetId, payload);

      if (!result.success) {
        setError(result.error);
      } else {
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
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le planning" : "Nouveau planning OCP"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom</Label>
            <Input
              id="nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              placeholder="OCP Nuit 08/05 - 10/05"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateDebut">Date et heure de début</Label>
              <Input
                id="dateDebut"
                type="datetime-local"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFin">Date et heure de fin</Label>
              <Input
                id="dateFin"
                type="datetime-local"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Version</Label>
              <Select value={version} onValueChange={setVersion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BASE">BASE</SelectItem>
                  <SelectItem value="VARIANTE">VARIANTE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="indice">Indice (optionnel)</Label>
              <Input
                id="indice"
                value={indice}
                onChange={(e) => setIndice(e.target.value)}
                placeholder="A, B, C..."
              />
            </div>
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
              {loading ? "..." : isEdit ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
