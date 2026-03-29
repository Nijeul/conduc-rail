import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "./AppShell";
import { QueryProvider } from "@/lib/query-provider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch user profil data for logo/societe store
  const userProfil = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { logoSociete: true, nomSociete: true },
  });

  return (
    <QueryProvider>
      <AppShell
        userName={session.user.name ?? ""}
        userEmail={session.user.email ?? ""}
        logoSociete={userProfil?.logoSociete ?? null}
        nomSociete={userProfil?.nomSociete ?? null}
      >
        {children}
      </AppShell>
    </QueryProvider>
  );
}
