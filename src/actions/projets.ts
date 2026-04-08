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

const CATEGORIES_SYSTEME = [
  { nom: 'Contrat',         couleurBg: '#E8EFDA', couleurBorder: '#7AA536', couleurText: '#5E8019', couleurPoint: '#7AA536' },
  { nom: 'Groupement',      couleurBg: '#E5F1F9', couleurBorder: '#307BFF', couleurText: '#0041B7', couleurPoint: '#307BFF' },
  { nom: 'Alerte',          couleurBg: '#F9E9D9', couleurBorder: '#C26A32', couleurText: '#B24E25', couleurPoint: '#C26A32' },
  { nom: 'EBGC',            couleurBg: '#FCE8FF', couleurBorder: '#A152E5', couleurText: '#7D18D6', couleurPoint: '#A152E5' },
  { nom: 'SOS Terrain',     couleurBg: '#FFF7D1', couleurBorder: '#F2AB1B', couleurText: '#DD9412', couleurPoint: '#F2AB1B' },
  { nom: 'Étude diffusion', couleurBg: '#C9E39E', couleurBorder: '#7AA536', couleurText: '#5E8019', couleurPoint: '#A9D461' },
  { nom: 'VISA Étude',      couleurBg: '#FFE8E8', couleurBorder: '#F25799', couleurText: '#C4007D', couleurPoint: '#F25799' },
  { nom: 'Suivi/Impact',    couleurBg: '#B2D4FC', couleurBorder: '#80B4FF', couleurText: '#0041B7', couleurPoint: '#307BFF' },
  { nom: 'Courrier',        couleurBg: '#F0F0F0', couleurBorder: '#B5ABA1', couleurText: '#5A5A5A', couleurPoint: '#B5ABA1' },
  { nom: 'Autre',           couleurBg: '#F0F0F0', couleurBorder: '#DCDCDC', couleurText: '#5A5A5A', couleurPoint: '#A0A0A0' },
] as const;

async function creerCategoriesSysteme(projetId: string) {
  for (const cat of CATEGORIES_SYSTEME) {
    await prisma.categorieEvenement.upsert({
      where: { projetId_nom: { projetId, nom: cat.nom } },
      update: {},
      create: {
        projetId,
        nom: cat.nom,
        couleurBg: cat.couleurBg,
        couleurBorder: cat.couleurBorder,
        couleurText: cat.couleurText,
        couleurPoint: cat.couleurPoint,
        estSysteme: true,
      },
    });
  }
}

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

  const memberships = await prisma.projetMember.findMany({
    where: { userId: user.id },
    include: {
      projet: {
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
      },
    },
  });

  const mesProjets = memberships
    .filter((m) => m.role === "owner")
    .map((m) => m.projet)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const projetsPartages = memberships
    .filter((m) => m.role === "member")
    .map((m) => {
      const owner = m.projet.members.find((pm) => pm.role === "owner");
      return {
        ...m.projet,
        ownerName: owner?.user?.name || owner?.user?.email || "Inconnu",
      };
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return { mesProjets, projetsPartages };
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

    // Créer les catégories système par défaut
    await creerCategoriesSysteme(projet.id);

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

    if (member.role !== "owner") {
      return { success: false, error: "Seul le proprietaire peut supprimer le projet" };
    }

    await prisma.$transaction(async (tx) => {
      // 0a. Module Planning Minuté (OCP) — cascade manuelle
      const ocps = await tx.oCP.findMany({
        where: { projetId: id },
        select: { id: true },
      });
      if (ocps.length > 0) {
        const ocpIds = ocps.map((o) => o.id);
        const chantiers = await tx.chantierElementaire.findMany({
          where: { ocpId: { in: ocpIds } },
          select: { id: true },
        });
        if (chantiers.length > 0) {
          await tx.creneauActivite.deleteMany({
            where: { chantierElementaireId: { in: chantiers.map((c) => c.id) } },
          });
        }
        await tx.chantierElementaire.deleteMany({
          where: { ocpId: { in: ocpIds } },
        });
        // Planning personnel & traction links
        await tx.planningPersonnelLink.deleteMany({
          where: { ocpId: { in: ocpIds } },
        });
        await tx.planningTractionLink.deleteMany({
          where: { ocpId: { in: ocpIds } },
        });
        // Nullify variante references before deleting OCPs
        await tx.oCP.updateMany({
          where: { ocpBaseId: { in: ocpIds } },
          data: { ocpBaseId: null },
        });
        await tx.oCP.deleteMany({ where: { projetId: id } });
      }

      // 0b. Module Matrice Décisionnelle — cascade manuelle
      const matrices = await tx.matriceDecisionnelle.findMany({
        where: { projetId: id },
        select: { id: true },
      });
      if (matrices.length > 0) {
        const matriceIds = matrices.map((m) => m.id);
        await tx.notationCritere.deleteMany({
          where: { critere: { matriceId: { in: matriceIds } } },
        });
        await tx.critere.deleteMany({
          where: { matriceId: { in: matriceIds } },
        });
        await tx.fournisseurCandidat.deleteMany({
          where: { matriceId: { in: matriceIds } },
        });
        await tx.matriceDecisionnelle.deleteMany({ where: { projetId: id } });
      }

      // 1. Fichiers liés aux événements
      const evenements = await tx.evenementChantier.findMany({
        where: { projetId: id },
        select: { id: true },
      });
      if (evenements.length > 0) {
        await tx.fichierEvenement.deleteMany({
          where: { evenementId: { in: evenements.map((e) => e.id) } },
        });
      }

      // 2. Lignes fiche écart
      await tx.ligneFicheEcart.deleteMany({ where: { projetId: id } });

      // 3. Événements chantier
      await tx.evenementChantier.deleteMany({ where: { projetId: id } });

      // 3b. Catégories événements
      await tx.categorieEvenement.deleteMany({ where: { projetId: id } });

      // 4. Courriers chantier
      await tx.courrierChantier.deleteMany({ where: { projetId: id } });

      // 5. Soudures aluminothermiques
      await tx.soudureAluminothermique.deleteMany({ where: { projetId: id } });

      // 6. Compositions TTx
      await tx.compositionTTx.deleteMany({ where: { projetId: id } });

      // 7. Lignes ARF manuelles
      await tx.ligneARFManuelle.deleteMany({ where: { projetId: id } });

      // 7b. Lignes avancement (avant rapports et lignesDE)
      const rapportIds = await tx.rapportJournalier.findMany({
        where: { projetId: id },
        select: { id: true },
      });
      if (rapportIds.length > 0) {
        await tx.ligneAvancement.deleteMany({
          where: { rapportId: { in: rapportIds.map(r => r.id) } },
        });
      }

      // 8. Rapports journaliers
      await tx.rapportJournalier.deleteMany({ where: { projetId: id } });

      // 8b. Lignes DE
      await tx.ligneDE.deleteMany({ where: { projetId: id } });

      // 9. Tableaux de service
      await tx.tableauService.deleteMany({ where: { projetId: id } });

      // 10. Membres du projet
      await tx.projetMember.deleteMany({ where: { projetId: id } });

      // 11. Le projet lui-même
      await tx.projet.delete({ where: { id } });
    });

    revalidatePath("/projets");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteProjet error:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

// ---------------------------------------------------------------------------
// Partage de projet
// ---------------------------------------------------------------------------

export async function getProjetMembers(projetId: string) {
  const user = await getAuthUser();
  await checkMembership(projetId, user.id);

  const members = await prisma.projetMember.findMany({
    where: { projetId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { role: "asc" },
  });

  return members;
}

export async function shareProjet(
  projetId: string,
  email: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    const member = await checkMembership(projetId, user.id);

    if (member.role !== "owner") {
      return { success: false, error: "Seul le proprietaire peut partager le projet" };
    }

    const targetUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, name: true, email: true },
    });

    if (!targetUser) {
      return { success: false, error: "Aucun utilisateur avec cet email" };
    }

    const existing = await prisma.projetMember.findUnique({
      where: { userId_projetId: { userId: targetUser.id, projetId } },
    });

    if (existing) {
      return { success: false, error: "Cet utilisateur est deja membre du projet" };
    }

    await prisma.projetMember.create({
      data: {
        userId: targetUser.id,
        projetId,
        role: "member",
      },
    });

    revalidatePath(`/projets/${projetId}/infos`);
    revalidatePath(`/projets/${projetId}`);
    revalidatePath("/projets");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("shareProjet error:", error);
    return { success: false, error: "Erreur lors du partage" };
  }
}

export async function ensureCategoriesSysteme(projetId: string): Promise<void> {
  const existing = await prisma.categorieEvenement.count({ where: { projetId } });
  if (existing === 0) {
    await creerCategoriesSysteme(projetId);
  }
}

export async function removeProjetMember(
  projetId: string,
  memberId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    const callerMember = await checkMembership(projetId, user.id);

    if (callerMember.role !== "owner") {
      return { success: false, error: "Seul le proprietaire peut retirer un membre" };
    }

    const targetMember = await prisma.projetMember.findUnique({
      where: { id: memberId },
    });

    if (!targetMember || targetMember.projetId !== projetId) {
      return { success: false, error: "Membre introuvable" };
    }

    if (targetMember.role === "owner") {
      return { success: false, error: "Impossible de retirer le proprietaire du projet" };
    }

    await prisma.projetMember.delete({
      where: { id: memberId },
    });

    revalidatePath(`/projets/${projetId}/infos`);
    revalidatePath(`/projets/${projetId}`);
    revalidatePath("/projets");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("removeProjetMember error:", error);
    return { success: false, error: "Erreur lors du retrait du membre" };
  }
}
