"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ZoomIn, ZoomOut, FileSpreadsheet } from "lucide-react";

interface OcpHeaderProps {
  nom: string;
  version: string;
  dateDebut: Date;
  dateFin: Date;
  dfvTotalMinutes: number;
  zoom: "compact" | "normal" | "large";
  onZoomIn: () => void;
  onZoomOut: () => void;
  onAddChantier: () => void;
}

function formatDateRange(debut: Date, fin: Date): string {
  const joursSemaine = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];
  const d = new Date(debut);
  const f = new Date(fin);
  const dJour = joursSemaine[d.getDay()];
  const fJour = joursSemaine[f.getDay()];
  const pad = (n: number) => n.toString().padStart(2, "0");
  const dStr = `${dJour} ${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}h${pad(d.getMinutes())}`;
  const fStr = `${fJour} ${pad(f.getDate())}/${pad(f.getMonth() + 1)} ${pad(f.getHours())}h${pad(f.getMinutes())}`;
  return `${dStr} → ${fStr}`;
}

function formatDFV(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

export function OcpHeader({
  nom,
  version,
  dateDebut,
  dateFin,
  dfvTotalMinutes,
  zoom,
  onZoomIn,
  onZoomOut,
  onAddChantier,
}: OcpHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: "#DCDCDC" }}>
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold">{nom}</h1>
        <Badge
          className="text-white text-xs font-bold px-2 py-0.5"
          style={{
            backgroundColor: version === "BASE" ? "#004489" : "#FF8F00",
          }}
        >
          {version}
        </Badge>
        <span className="text-sm" style={{ color: "#5A5A5A" }}>
          {formatDateRange(dateDebut, dateFin)}
        </span>
        <span className="text-sm font-bold" style={{ color: "#004489" }}>
          DFV : {formatDFV(dfvTotalMinutes)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={onAddChantier}
          style={{ backgroundColor: "#004489" }}
          className="text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-1" />
          Ajouter un chantier
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomIn}
          disabled={zoom === "large"}
          style={{ borderColor: "#DCDCDC", backgroundColor: "#F0F0F0" }}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomOut}
          disabled={zoom === "compact"}
          style={{ borderColor: "#DCDCDC", backgroundColor: "#F0F0F0" }}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          style={{ borderColor: "#DCDCDC", backgroundColor: "#F0F0F0" }}
        >
          <FileSpreadsheet className="h-4 w-4 mr-1" />
          Export Excel
        </Button>
      </div>
    </div>
  );
}
