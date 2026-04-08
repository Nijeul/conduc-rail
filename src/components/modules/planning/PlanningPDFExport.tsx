"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useProfilStore } from "@/stores/profil";

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
  couleur?: string | null;
  estGroupe: boolean;
  ordreAffichage: number;
  dureePlanifieeMinutes: number;
  creneaux: Creneau[];
}

interface OCPData {
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

interface PlanningPDFExportProps {
  ocp: OCPData;
  nomProjet: string;
  personnelLinks: PersonnelLink[];
  tractionLinks: TractionLink[];
}

export function PlanningPDFExport({
  ocp,
  nomProjet,
  personnelLinks,
  tractionLinks,
}: PlanningPDFExportProps) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const { logoSociete, nomSociete } = useProfilStore();

  const handleExportPDF = useCallback(async () => {
    if (isExportingPDF) return;
    setIsExportingPDF(true);
    try {
      const { generatePlanningPDF } = await import("@/lib/pdf/planning");
      await generatePlanningPDF({
        ocp,
        nomProjet,
        personnelLinks,
        tractionLinks,
        logoSociete,
        nomSociete,
      });
    } catch (err) {
      console.error("Export PDF error:", err);
    } finally {
      setIsExportingPDF(false);
    }
  }, [ocp, nomProjet, personnelLinks, tractionLinks, logoSociete, nomSociete, isExportingPDF]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExportPDF}
      disabled={isExportingPDF}
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
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 13h6m-3-3v6"
        />
      </svg>
      {isExportingPDF ? "Export..." : "PDF"}
    </Button>
  );
}
