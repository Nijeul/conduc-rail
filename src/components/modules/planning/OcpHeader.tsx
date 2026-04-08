"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, ZoomIn, ZoomOut, HelpCircle } from "lucide-react";
import { useState, useCallback } from "react";
import { PlanningPDFExport } from "./PlanningPDFExport";

const COULEURS_CATEGORIE: Record<string, { label: string; couleur: string }> = {
  catenaire: { label: "Caténaire", couleur: "#004489" },
  voie: { label: "Voie", couleur: "#FF8F00" },
  procedure_sncf: { label: "Procédure SNCF", couleur: "#E20025" },
  essais: { label: "Essais", couleur: "#7AA536" },
  signalisation: { label: "Signalisation", couleur: "#F2AB1B" },
  telecom: { label: "Télécom", couleur: "#80B4FF" },
  energie: { label: "Énergie", couleur: "#C26A32" },
  genie_civil: { label: "Génie civil", couleur: "#A152E5" },
  autre: { label: "Autre", couleur: "#5A5A5A" },
};

interface Creneau {
  id: string;
  debut: Date;
  fin: Date;
  effectif: number;
  statut: string;
}

interface ChantierEl {
  id: string;
  libelle: string;
  categorie: string | null;
  estGroupe: boolean;
  ordreAffichage: number;
  dureePlanifieeMinutes: number;
  creneaux: Creneau[];
  couleur?: string | null;
}

interface OCPForExport {
  id: string;
  nom: string;
  version: string;
  dateDebut: Date;
  dateFin: Date;
  dfvTotalMinutes: number;
  statut: string;
  chantiersElementaires: ChantierEl[];
}

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
  ocp?: OCPForExport;
  nomProjet?: string;
  personnelLinks?: PersonnelLink[];
  tractionLinks?: TractionLink[];
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
  ocp,
  nomProjet,
  personnelLinks = [],
  tractionLinks = [],
}: OcpHeaderProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = useCallback(async () => {
    if (isExporting || !ocp || !nomProjet) return;
    setIsExporting(true);
    try {
      const { generateExcel } = await import("./PlanningExcelExport");
      await generateExcel(ocp, nomProjet);
    } catch (err) {
      console.error("Export Excel error:", err);
    } finally {
      setIsExporting(false);
    }
  }, [ocp, nomProjet, isExporting]);

  return (
    <div className="flex flex-col border-b" style={{ borderColor: "#DCDCDC" }}>
      {/* Main header row */}
      <div className="flex items-center justify-between px-6 py-3">
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md"
                  style={{ backgroundColor: "#E5EFF8", border: "1px solid #004489" }}
                >
                  <span className="text-sm font-bold" style={{ color: "#004489" }}>
                    DFV : {formatDFV(dfvTotalMinutes)}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>DFV (Duree de Fermeture de Voie) : temps total pendant lequel au moins un chantier est actif.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  style={{ borderColor: "#DCDCDC", backgroundColor: "#F0F0F0" }}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p>Cliquez sur une case pour activer/desactiver un creneau de 30min. Glissez pour selectionner plusieurs cases.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
          {ocp && nomProjet && (
            <PlanningPDFExport
              ocp={ocp}
              nomProjet={nomProjet}
              personnelLinks={personnelLinks}
              tractionLinks={tractionLinks}
            />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={isExporting || !ocp}
            style={{ borderColor: "#DCDCDC", backgroundColor: "#F0F0F0" }}
          >
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {isExporting ? "Export..." : "Export Excel"}
          </Button>
        </div>
      </div>

      {/* Color legend row */}
      <div className="flex items-center gap-3 px-6 pb-2">
        <span className="text-xs font-medium" style={{ color: "#5A5A5A" }}>
          Legende :
        </span>
        {Object.entries(COULEURS_CATEGORIE).map(([key, { label, couleur }]) => (
          <div key={key} className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: couleur }}
            />
            <span className="text-xs" style={{ color: "#5A5A5A" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
