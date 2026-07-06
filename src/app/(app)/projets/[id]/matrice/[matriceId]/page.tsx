import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getMatrice } from "@/actions/matrice";
import { getProjet } from "@/actions/projets";
import { MatriceDetailClient } from "./MatriceDetailClient";

interface Props {
  params: { id: string; matriceId: string };
}

export default async function MatriceDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let matrice;
  let projet;
  try {
    [matrice, projet] = await Promise.all([
      getMatrice(params.id, params.matriceId),
      getProjet(params.id),
    ]);
  } catch {
    notFound();
  }

  return (
    <div className="p-6">
      <MatriceDetailClient
        projetId={params.id}
        projetName={projet?.name || "Projet"}
        matrice={matrice}
      />
    </div>
  );
}
