import { getUserProjets } from "@/actions/projets";
import { auth } from "@/lib/auth";
import { Topbar } from "@/components/layout";
import { ProjetsList } from "./ProjetsList";
import { redirect } from "next/navigation";

export default async function ProjetsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const projets = await getUserProjets();

  return (
    <>
      <Topbar title="Mes projets" />
      <div className="flex-1 p-6">
        <ProjetsList projets={projets} currentUserId={session.user.id} />
      </div>
    </>
  );
}
