"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout";
import { useProfilStore } from "@/stores/profil";

interface AppShellProps {
  userName: string;
  userEmail: string;
  logoSociete: string | null;
  nomSociete: string | null;
  children: React.ReactNode;
}

export function AppShell({ userName, userEmail, logoSociete, nomSociete, children }: AppShellProps) {
  const setLogo = useProfilStore((s) => s.setLogo);
  const setNomSociete = useProfilStore((s) => s.setNomSociete);

  useEffect(() => {
    setLogo(logoSociete);
    setNomSociete(nomSociete);
  }, [logoSociete, nomSociete, setLogo, setNomSociete]);

  return (
    <div className="flex min-h-screen">
      <Sidebar userName={userName} userEmail={userEmail} />
      <main className="flex-1 ml-60 flex flex-col">{children}</main>
    </div>
  );
}
