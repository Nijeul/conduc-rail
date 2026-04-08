"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BidCompTable } from "@/components/modules/matrice/BidCompTable";
import { SelectionRMSTable } from "@/components/modules/matrice/SelectionRMSTable";
import { MatriceDashboard } from "@/components/modules/matrice/MatriceDashboard";
import { ArrowLeft } from "lucide-react";

type Notation = {
  id: string;
  critereId: string;
  fournisseurId: string;
  valeurTexte: string | null;
  note: number | null;
  valeurBool: boolean | null;
  commentaire: string | null;
  estNonConformiteMajeure: boolean;
  estNonConformiteNegociable: boolean;
  createdAt: Date;
};

type Critere = {
  id: string;
  matriceId: string;
  famille: string;
  libelle: string;
  coefficient: number;
  ordreAffichage: number;
  type: string;
  createdAt: Date;
  notations: Notation[];
};

type Fournisseur = {
  id: string;
  matriceId: string;
  nom: string;
  rang: number;
  refOffre: string | null;
  dateOffre: Date | null;
  paysFabrication: string | null;
  incoterm: string | null;
  decision: string;
  couleurDecision: string;
  createdAt: Date;
  notations: Notation[];
};

type Matrice = {
  id: string;
  projetId: string;
  titre: string;
  acheteur: string | null;
  site: string | null;
  familleAchats: string | null;
  budgetTheorique: number | null;
  devise: string;
  seuilGo: number;
  statut: string;
  createdAt: Date;
  updatedAt: Date;
  fournisseurs: Fournisseur[];
  criteres: Critere[];
};

interface MatriceDetailClientProps {
  projetId: string;
  matrice: Matrice;
}

export function MatriceDetailClient({
  projetId,
  matrice,
}: MatriceDetailClientProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/projets/${projetId}/matrice`}
          className="text-[#5A5A5A] hover:text-[#004489] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-semibold text-[#004489]">
          {matrice.titre}
        </h1>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bidcomp" className="w-full">
        <TabsList className="bg-[#F0F0F0] border border-[#DCDCDC]">
          <TabsTrigger
            value="bidcomp"
            className="data-[state=active]:bg-[#E5EFF8] data-[state=active]:text-[#004489] data-[state=active]:font-bold"
          >
            Bid Comp
          </TabsTrigger>
          <TabsTrigger
            value="rms"
            className="data-[state=active]:bg-[#E5EFF8] data-[state=active]:text-[#004489] data-[state=active]:font-bold"
          >
            Selection RMS
          </TabsTrigger>
          <TabsTrigger
            value="dashboard"
            className="data-[state=active]:bg-[#E5EFF8] data-[state=active]:text-[#004489] data-[state=active]:font-bold"
          >
            Tableau de bord
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bidcomp" className="mt-4">
          <BidCompTable
            projetId={projetId}
            matriceId={matrice.id}
            matrice={{
              acheteur: matrice.acheteur,
              site: matrice.site,
              familleAchats: matrice.familleAchats,
              budgetTheorique: matrice.budgetTheorique,
              devise: matrice.devise,
              seuilGo: matrice.seuilGo,
            }}
            criteres={matrice.criteres}
            fournisseurs={matrice.fournisseurs}
          />
        </TabsContent>

        <TabsContent value="rms" className="mt-4">
          <SelectionRMSTable
            projetId={projetId}
            criteres={matrice.criteres}
            fournisseurs={matrice.fournisseurs}
          />
        </TabsContent>

        <TabsContent value="dashboard" className="mt-4">
          <MatriceDashboard
            projetId={projetId}
            matriceId={matrice.id}
            matrice={{
              titre: matrice.titre,
              budgetTheorique: matrice.budgetTheorique,
              devise: matrice.devise,
              seuilGo: matrice.seuilGo,
              createdAt: matrice.createdAt,
            }}
            criteres={matrice.criteres}
            fournisseurs={matrice.fournisseurs}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
