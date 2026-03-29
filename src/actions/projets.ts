"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ActionResult } from "@/types";

const CreateProjetSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(200),
  description: z.string().max(1000).optional(),
});

const UpdateProjetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Le nom est requis").max(200),
  description: z.string().max(1000).optional(),
});

async function getAuthUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non authentifie");
  }
  return session.user;
}

async function checkMembership(projetId: string, userId: string) {
  const member = await prisma.projetMember.findUnique({
    where: { userId_projetId: { userId, projetId } },
  });
  if (!member) {
    throw new Error("Acces refuse");
  }
  return member;
}

export async function getUserProjets() {
  const user = await getAuthUser();

  const projets = await prisma.projet.findMany({
    where: {
      members: {
        some: { userId: user.id },
      },
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      _count: {
        select: {
          members: true,
          rapports: true,
          lignesDE: true,
          soudures: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return projets;
}

export async function getProjet(id: string) {
  const user = await getAuthUser();
  await checkMembership(id, user.id);

  const projet = await prisma.projet.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      _count: {
        select: {
          members: true,
          rapports: true,
          lignesDE: true,
          soudures: true,
        },
      },
    },
  });

  return projet;
}

export async function createProjet(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser();

    const parsed = CreateProjetSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const projet = await prisma.projet.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        members: {
          create: {
            userId: user.id,
            role: "owner",
          },
        },
      },
    });

    revalidatePath("/projets");
    return { success: true, data: { id: projet.id } };
  } catch (error) {
    console.error("createProjet error:", error);
    return { success: false, error: "Erreur lors de la creation du projet" };
  }
}

export async function updateProjet(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await getAuthUser();

    const parsed = UpdateProjetSchema.safeParse({
      id: formData.get("id"),
      name: formData.get("name"),
      description: formData.get("description"),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const member = await checkMembership(parsed.data.id, user.id);
    if (member.role !== "owner" && (user as { role?: string }).role !== "admin") {
      return { success: false, error: "Seul le proprietaire peut modifier le projet" };
    }

    await prisma.projet.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
      },
    });

    revalidatePath("/projets");
    revalidatePath(`/projets/${parsed.data.id}`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("updateProjet error:", error);
    return { success: false, error: "Erreur lors de la mise a jour" };
  }
}

export async function deleteProjet(id: string): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    const member = await checkMembership(id, user.id);

    if (member.role !== "owner" && (user as { role?: string }).role !== "admin") {
      return { success: false, error: "Seul le proprietaire peut supprimer le projet" };
    }

    await prisma.projet.delete({ where: { id } });

    revalidatePath("/projets");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteProjet error:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}
