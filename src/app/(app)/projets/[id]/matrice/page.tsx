import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMatrices } from "@/actions/matrice";
import { MatriceList } from "@/components/modules/matrice/MatriceList";

interface Props {
  params: { id: string };
}

export default async function MatriceListPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const matrices = await getMatrices(params.id);

  return (
    <div className="p-6">
      <MatriceList projetId={params.id} matrices={matrices} />
    </div>
  );
}
