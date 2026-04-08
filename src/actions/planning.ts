"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ActionResult } from "@/types";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

async function getAuthUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");
  return session.user;
}

async function checkMembership(projetId: string, userId: string) {
  const member = await prisma.projetMember.findUnique({
    where: { userId_projetId: { userId, projetId } },
  });
  if (!member) throw new Error("Accès refusé");
  return member;
}

// ──────────────────────────────────────────────
// Schemas Zod
// ──────────────────────────────────────────────

const CreateOCPSchema = z.object({
  nom: z.string().min(1, "Le nom est requis").max(200),
  dateDebut: z.coerce.date(),
  dateFin: z.coerce.date(),
  version: z.enum(["BASE", "VARIANTE"]).default("BASE"),
  indice: z.string().max(50).optional().nullable(),
  ocpBaseId: z.string().optional().nullable(),
});

const UpdateOCPSchema = z.object({
  nom: z.string().min(1).max(200).optional(),
  dateDebut: z.coerce.date().optional(),
  dateFin: z.coerce.date().optional(),
  version: z.enum(["BASE", "VARIANTE"]).optional(),
  indice: z.string().max(50).optional().nullable(),
  statut: z.enum(["brouillon", "validé", "archivé"]).optional(),
});

const CreateChantierSchema = z.object({
  libelle: z.string().min(1, "Le libellé est requis").max(300),
  categorie: z.string().max(100).optional().nullable(),
  dureePlanifieeMinutes: z.number().int().min(0).default(0),
  ordreAffichage: z.number().int().min(0).default(0),
  estGroupe: z.boolean().default(false),
});

const UpdateChantierSchema = z.object({
  libelle: z.string().min(1).max(300).optional(),
  categorie: z.string().max(100).optional().nullable(),
  dureePlanifieeMinutes: z.number().int().min(0).optional(),
  ordreAffichage: z.number().int().min(0).optional(),
  estGroupe: z.boolean().optional(),
});

const CreneauSchema = z.object({
  id: z.string().optional(),
  debut: z.coerce.date(),
  fin: z.coerce.date(),
  effectif: z.number().int().min(1).default(1),
  statut: z.enum(["planifie", "realise", "annule"]).default("planifie"),
});

// ──────────────────────────────────────────────
// OCP CRUD
// ──────────────────────────────────────────────

export async function getOCPs(projetId: string) {
  const user = await getAuthUser();
  await checkMembership(projetId, user.id);

  return prisma.oCP.findMany({
    where: { projetId },
    include: {
      _count: { select: { chantiersElementaires: true, variantes: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOCP(projetId: string, ocpId: string) {
  const user = await getAuthUser();
  await checkMembership(projetId, user.id);

  const ocp = await prisma.oCP.findFirst({
    where: { id: ocpId, projetId },
    include: {
      chantiersElementaires: {
        orderBy: { ordreAffichage: "asc" },
        include: {
          creneaux: { orderBy: { debut: "asc" } },
        },
      },
      variantes: {
        select: { id: true, nom: true, indice: true, statut: true },
      },
      ocpBase: {
        select: { id: true, nom: true },
      },
    },
  });

  if (!ocp) throw new Error("OCP introuvable");
  return ocp;
}

export async function createOCP(
  projetId: string,
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser();
    await checkMembership(projetId, user.id);

    const parsed = CreateOCPSchema.parse(data);

    const ocp = await prisma.oCP.create({
      data: {
        projetId,
        nom: parsed.nom,
        dateDebut: parsed.dateDebut,
        dateFin: parsed.dateFin,
        version: parsed.version,
        indice: parsed.indice ?? null,
        ocpBaseId: parsed.ocpBaseId ?? null,
      },
    });

    revalidatePath(`/projets/${projetId}/planning`);
    return { success: true, data: { id: ocp.id } };
  } catch (error) {
    console.error("createOCP error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la création",
    };
  }
}

export async function updateOCP(
  projetId: string,
  ocpId: string,
  data: unknown
): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    await checkMembership(projetId, user.id);

    const parsed = UpdateOCPSchema.parse(data);

    // Verify OCP belongs to project
    const existing = await prisma.oCP.findFirst({
      where: { id: ocpId, projetId },
    });
    if (!existing) throw new Error("OCP introuvable");

    await prisma.oCP.update({
      where: { id: ocpId },
      data: parsed,
    });

    revalidatePath(`/projets/${projetId}/planning`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("updateOCP error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la mise à jour",
    };
  }
}

export async function deleteOCP(
  projetId: string,
  ocpId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    await checkMembership(projetId, user.id);

    const existing = await prisma.oCP.findFirst({
      where: { id: ocpId, projetId },
    });
    if (!existing) throw new Error("OCP introuvable");

    await prisma.oCP.delete({ where: { id: ocpId } });

    revalidatePath(`/projets/${projetId}/planning`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteOCP error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la suppression",
    };
  }
}

// ──────────────────────────────────────────────
// Chantier Élémentaire CRUD
// ──────────────────────────────────────────────

export async function createChantierElementaire(
  projetId: string,
  ocpId: string,
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser();
    await checkMembership(projetId, user.id);

    // Verify OCP belongs to project
    const ocp = await prisma.oCP.findFirst({
      where: { id: ocpId, projetId },
    });
    if (!ocp) throw new Error("OCP introuvable");

    const parsed = CreateChantierSchema.parse(data);

    const chantier = await prisma.chantierElementaire.create({
      data: {
        ocpId,
        libelle: parsed.libelle,
        categorie: parsed.categorie ?? null,
        dureePlanifieeMinutes: parsed.dureePlanifieeMinutes,
        ordreAffichage: parsed.ordreAffichage,
        estGroupe: parsed.estGroupe,
      },
    });

    revalidatePath(`/projets/${projetId}/planning`);
    return { success: true, data: { id: chantier.id } };
  } catch (error) {
    console.error("createChantierElementaire error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la création",
    };
  }
}

export async function updateChantierElementaire(
  projetId: string,
  chantierElId: string,
  data: unknown
): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    await checkMembership(projetId, user.id);

    const parsed = UpdateChantierSchema.parse(data);

    // Verify chantier belongs to project via OCP
    const chantier = await prisma.chantierElementaire.findFirst({
      where: { id: chantierElId, ocp: { projetId } },
    });
    if (!chantier) throw new Error("Chantier élémentaire introuvable");

    await prisma.chantierElementaire.update({
      where: { id: chantierElId },
      data: parsed,
    });

    revalidatePath(`/projets/${projetId}/planning`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("updateChantierElementaire error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la mise à jour",
    };
  }
}

export async function deleteChantierElementaire(
  projetId: string,
  chantierElId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    await checkMembership(projetId, user.id);

    const chantier = await prisma.chantierElementaire.findFirst({
      where: { id: chantierElId, ocp: { projetId } },
    });
    if (!chantier) throw new Error("Chantier élémentaire introuvable");

    await prisma.chantierElementaire.delete({ where: { id: chantierElId } });

    revalidatePath(`/projets/${projetId}/planning`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteChantierElementaire error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la suppression",
    };
  }
}

// ──────────────────────────────────────────────
// Créneaux — batch update
// ──────────────────────────────────────────────

export async function updateCreneaux(
  projetId: string,
  chantierElId: string,
  creneaux: unknown
): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    await checkMembership(projetId, user.id);

    const chantier = await prisma.chantierElementaire.findFirst({
      where: { id: chantierElId, ocp: { projetId } },
    });
    if (!chantier) throw new Error("Chantier élémentaire introuvable");

    const parsed = z.array(CreneauSchema).parse(creneaux);

    await prisma.$transaction(async (tx) => {
      // Delete existing creneaux not in the new list
      const existingIds = parsed.filter((c) => c.id).map((c) => c.id as string);
      await tx.creneauActivite.deleteMany({
        where: {
          chantierElementaireId: chantierElId,
          id: { notIn: existingIds },
        },
      });

      // Upsert each creneau
      for (const creneau of parsed) {
        if (creneau.id) {
          await tx.creneauActivite.update({
            where: { id: creneau.id },
            data: {
              debut: creneau.debut,
              fin: creneau.fin,
              effectif: creneau.effectif,
              statut: creneau.statut,
            },
          });
        } else {
          await tx.creneauActivite.create({
            data: {
              chantierElementaireId: chantierElId,
              debut: creneau.debut,
              fin: creneau.fin,
              effectif: creneau.effectif,
              statut: creneau.statut,
            },
          });
        }
      }
    });

    revalidatePath(`/projets/${projetId}/planning`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("updateCreneaux error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la mise à jour des créneaux",
    };
  }
}

// ──────────────────────────────────────────────
// Dupliquer OCP
// ──────────────────────────────────────────────

export async function dupliquerOCP(
  projetId: string,
  ocpId: string,
  version: "BASE" | "VARIANTE"
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser();
    await checkMembership(projetId, user.id);

    const source = await prisma.oCP.findFirst({
      where: { id: ocpId, projetId },
      include: {
        chantiersElementaires: {
          include: { creneaux: true },
        },
      },
    });
    if (!source) throw new Error("OCP introuvable");

    const newOCP = await prisma.$transaction(async (tx) => {
      const copie = await tx.oCP.create({
        data: {
          projetId,
          nom: `${source.nom} (copie)`,
          dateDebut: source.dateDebut,
          dateFin: source.dateFin,
          version,
          indice: null,
          ocpBaseId: version === "VARIANTE" ? ocpId : null,
        },
      });

      for (const chantier of source.chantiersElementaires) {
        const newChantier = await tx.chantierElementaire.create({
          data: {
            ocpId: copie.id,
            libelle: chantier.libelle,
            categorie: chantier.categorie,
            dureePlanifieeMinutes: chantier.dureePlanifieeMinutes,
            ordreAffichage: chantier.ordreAffichage,
            estGroupe: chantier.estGroupe,
          },
        });

        if (chantier.creneaux.length > 0) {
          await tx.creneauActivite.createMany({
            data: chantier.creneaux.map((c) => ({
              chantierElementaireId: newChantier.id,
              debut: c.debut,
              fin: c.fin,
              effectif: c.effectif,
              statut: "planifie" as const,
            })),
          });
        }
      }

      return copie;
    });

    revalidatePath(`/projets/${projetId}/planning`);
    return { success: true, data: { id: newOCP.id } };
  } catch (error) {
    console.error("dupliquerOCP error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la duplication",
    };
  }
}

// ──────────────────────────────────────────────
// Calculer DFV (Durée Fermeture de Voie)
// Union des créneaux actifs (planifie + realise)
// ──────────────────────────────────────────────

export async function calculerDFV(
  ocpId: string
): Promise<ActionResult<{ dfvTotalMinutes: number }>> {
  try {
    const user = await getAuthUser();

    // Get OCP and check membership
    const ocp = await prisma.oCP.findUnique({
      where: { id: ocpId },
      select: { projetId: true },
    });
    if (!ocp) throw new Error("OCP introuvable");
    await checkMembership(ocp.projetId, user.id);

    // Fetch all active creneaux
    const creneaux = await prisma.creneauActivite.findMany({
      where: {
        chantierElementaire: { ocpId },
        statut: { in: ["planifie", "realise"] },
      },
      select: { debut: true, fin: true },
      orderBy: { debut: "asc" },
    });

    // Union of time intervals
    if (creneaux.length === 0) {
      await prisma.oCP.update({
        where: { id: ocpId },
        data: { dfvTotalMinutes: 0 },
      });
      return { success: true, data: { dfvTotalMinutes: 0 } };
    }

    // Sort by start time and merge overlapping intervals
    const sorted = creneaux
      .map((c) => ({
        debut: c.debut.getTime(),
        fin: c.fin.getTime(),
      }))
      .sort((a, b) => a.debut - b.debut);

    const merged: { debut: number; fin: number }[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const last = merged[merged.length - 1];
      if (sorted[i].debut <= last.fin) {
        last.fin = Math.max(last.fin, sorted[i].fin);
      } else {
        merged.push(sorted[i]);
      }
    }

    const totalMs = merged.reduce((sum, interval) => sum + (interval.fin - interval.debut), 0);
    const dfvTotalMinutes = Math.round(totalMs / 60000);

    await prisma.oCP.update({
      where: { id: ocpId },
      data: { dfvTotalMinutes },
    });

    revalidatePath(`/projets/${ocp.projetId}/planning`);
    return { success: true, data: { dfvTotalMinutes } };
  } catch (error) {
    console.error("calculerDFV error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors du calcul DFV",
    };
  }
}
