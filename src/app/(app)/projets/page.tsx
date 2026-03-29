import { getUserProjets } from "@/actions/projets";
import { Topbar } from "@/components/layout";
import { ProjetsList } from "./ProjetsList";

export default async function ProjetsPage() {
  const projets = await getUserProjets();

  return (
    <>
      <Topbar title="Mes projets" />
      <div className="flex-1 p-6">
        <ProjetsList projets={projets} />
      </div>
    </>
  );
}
