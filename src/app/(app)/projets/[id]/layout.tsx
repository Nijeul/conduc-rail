import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
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
  const [projet, session] = await Promise.all([getProjet(params.id), auth()]);

  if (!projet) {
    notFound();
  }

  const modulesMasques = Array.isArray(projet.modulesMasques)
    ? (projet.modulesMasques as string[])
    : [];
  const role = (session?.user as { role?: string } | undefined)?.role;

  return (
    <div className="flex flex-col flex-1">
      <ProjetNav
        projetId={params.id}
        projetName={projet.name}
        modulesMasques={modulesMasques}
        role={role}
      />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
