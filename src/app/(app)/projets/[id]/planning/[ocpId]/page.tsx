import { notFound } from "next/navigation";
import { getOCP } from "@/actions/planning";
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

  return (
    <div className="flex flex-col h-full">
      <PlanningMinuteGrid projetId={params.id} ocp={ocp} />
    </div>
  );
}
