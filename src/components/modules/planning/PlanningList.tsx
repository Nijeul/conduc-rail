"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, Trash2 } from "lucide-react";
import { deleteOCP, dupliquerOCP } from "@/actions/planning";
import { OcpForm } from "./OcpForm";
import { formatDateFR } from "@/lib/utils";

interface OcpItem {
  id: string;
  nom: string;
  version: string;
  dateDebut: Date;
  dateFin: Date;
  dfvTotalMinutes: number;
  statut: string;
  indice: string | null;
  _count: { chantiersElementaires: number; variantes: number };
}

interface PlanningListProps {
  projetId: string;
  ocps: OcpItem[];
}

function formatDFV(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

export function PlanningList({ projetId, ocps }: PlanningListProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(ocpId: string) {
    if (!confirm("Supprimer ce planning et tous ses chantiers ?")) return;
    setDeleting(ocpId);
    try {
      await deleteOCP(projetId, ocpId);
    } finally {
      setDeleting(null);
    }
  }

  async function handleDuplicate(ocpId: string) {
    const result = await dupliquerOCP(projetId, ocpId, "BASE");
    if (result.success) {
      router.push(`/projets/${projetId}/planning/${result.data.id}`);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: "#E5EFF8", color: "#003370" }}>
        Le planning minuté permet de planifier des interventions sur des fenêtres de travaux (week-end, nuit). Chaque case = 30 minutes.
      </div>

      <div className="flex items-center gap-3 flex-wrap mb-4">
        <Button
          onClick={() => setFormOpen(true)}
          style={{ backgroundColor: "#004489" }}
          className="text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-1" />
          Nouveau planning
        </Button>
        <h1 className="text-lg font-bold">Planning Minuté (OCP)</h1>
      </div>

      <div className="border rounded-lg overflow-hidden" style={{ borderColor: "#DCDCDC" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "#004489" }}>
              <th className="text-left text-white font-bold px-4 py-2">Nom</th>
              <th className="text-left text-white font-bold px-4 py-2">Version</th>
              <th className="text-left text-white font-bold px-4 py-2">Date début</th>
              <th className="text-left text-white font-bold px-4 py-2">Date fin</th>
              <th className="text-left text-white font-bold px-4 py-2">DFV</th>
              <th className="text-left text-white font-bold px-4 py-2">Statut</th>
              <th className="text-right text-white font-bold px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ocps.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8" style={{ color: "#5A5A5A" }}>
                  Aucun planning. Cliquez sur &quot;Nouveau planning&quot; pour commencer.
                </td>
              </tr>
            )}
            {ocps.map((ocp, idx) => (
              <tr
                key={ocp.id}
                className="border-b cursor-pointer hover:bg-[#E5EFF8] transition-colors"
                style={{
                  borderColor: "#DCDCDC",
                  backgroundColor: idx % 2 === 1 ? "#F0F0F0" : "white",
                }}
                onDoubleClick={() =>
                  router.push(`/projets/${projetId}/planning/${ocp.id}`)
                }
              >
                <td className="px-4 py-2 font-medium">{ocp.nom}</td>
                <td className="px-4 py-2">
                  <Badge
                    className="text-white text-xs font-bold px-2 py-0.5"
                    style={{
                      backgroundColor: ocp.version === "BASE" ? "#004489" : "#FF8F00",
                    }}
                  >
                    {ocp.version}
                  </Badge>
                </td>
                <td className="px-4 py-2">{formatDateFR(new Date(ocp.dateDebut))}</td>
                <td className="px-4 py-2">{formatDateFR(new Date(ocp.dateFin))}</td>
                <td className="px-4 py-2 font-medium" style={{ color: "#004489" }}>
                  {formatDFV(ocp.dfvTotalMinutes)}
                </td>
                <td className="px-4 py-2 capitalize">{ocp.statut}</td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(ocp.id);
                      }}
                      title="Dupliquer"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(ocp.id);
                      }}
                      disabled={deleting === ocp.id}
                      title="Supprimer"
                      className="hover:text-[#E20025]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <OcpForm projetId={projetId} open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
