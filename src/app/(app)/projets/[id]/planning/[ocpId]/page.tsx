import { notFound } from "next/navigation";
import {
  getOCP,
  getPersonnelLinks,
  getTractionLinks,
  getTableauxServiceProjet,
  getCompositionsProjet,
} from "@/actions/planning";
import { prisma } from "@/lib/prisma";
import { PlanningMinuteGrid } from "@/components/modules/planning/PlanningMinuteGrid";

interface Props {
  params: { id: string; ocpId: string };
}

export default async function PlanningGridPage({ params }: Props) {
  let ocp;
  try {
    ocp = await getOCP(params.id, params.ocpId);
  } catch {
    notFound();
  }

  // Parallel fetch: project name, personnel/traction links, select options
  const [projet, personnelLinks, tractionLinks, tableaux, compositions] =
    await Promise.all([
      prisma.projet.findUnique({
        where: { id: params.id },
        select: { name: true },
      }),
      getPersonnelLinks(params.ocpId),
      getTractionLinks(params.ocpId),
      getTableauxServiceProjet(params.id),
      getCompositionsProjet(params.id),
    ]);

  return (
    <div className="flex flex-col h-full">
      <PlanningMinuteGrid
        projetId={params.id}
        ocp={ocp}
        nomProjet={projet?.name ?? "Projet"}
        personnelLinks={personnelLinks}
        tractionLinks={tractionLinks}
        tableaux={tableaux}
        compositions={compositions}
      />
    </div>
  );
}
