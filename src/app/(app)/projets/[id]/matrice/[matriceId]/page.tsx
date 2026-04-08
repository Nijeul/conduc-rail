import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getMatrice } from "@/actions/matrice";
import { MatriceDetailClient } from "./MatriceDetailClient";

interface Props {
  params: { id: string; matriceId: string };
}

export default async function MatriceDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let matrice;
  try {
    matrice = await getMatrice(params.id, params.matriceId);
  } catch {
    notFound();
  }

  return (
    <div className="p-6">
      <MatriceDetailClient
        projetId={params.id}
        matrice={matrice}
      />
    </div>
  );
}
