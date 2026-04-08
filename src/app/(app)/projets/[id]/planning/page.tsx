import { getOCPs } from "@/actions/planning";
import { PlanningList } from "@/components/modules/planning/PlanningList";

interface Props {
  params: { id: string };
}

export default async function PlanningPage({ params }: Props) {
  const ocps = await getOCPs(params.id);

  return <PlanningList projetId={params.id} ocps={ocps} />;
}
