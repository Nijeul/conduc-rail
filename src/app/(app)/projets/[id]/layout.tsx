import { notFound } from "next/navigation";
import { getProjet } from "@/actions/projets";
import { ProjetNav } from "./ProjetNav";

interface ProjetLayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

export default async function ProjetLayout({
  children,
  params,
}: ProjetLayoutProps) {
  const projet = await getProjet(params.id);

  if (!projet) {
    notFound();
  }

  return (
    <div className="flex flex-col flex-1">
      <ProjetNav projetId={params.id} projetName={projet.name} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
