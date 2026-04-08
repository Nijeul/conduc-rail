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
// Critères par défaut
// ──────────────────────────────────────────────

const CRITERES_PAR_DEFAUT: {
  famille: string;
  libelle: string;
  coefficient: number;
  type: string;
}[] = [
  // Général
  { famille: "general", libelle: "Conformité au cahier des charges", coefficient: 2, type: "note_1_3" },
  { famille: "general", libelle: "Pays de fabrication", coefficient: 1, type: "texte" },
  { famille: "general", libelle: "Incoterm proposé", coefficient: 1, type: "texte" },
  // Qualité
  { famille: "qualite", libelle: "Certification ISO 9001", coefficient: 2, type: "booleen" },
  { famille: "qualite", libelle: "Références similaires", coefficient: 2, type: "note_1_3" },
  { famille: "qualite", libelle: "Plan qualité proposé", coefficient: 1, type: "note_1_3" },
  // Coûts
  { famille: "couts", libelle: "Prix global", coefficient: 3, type: "montant" },
  { famille: "couts", libelle: "Conditions de paiement", coefficient: 1, type: "note_1_3" },
  { famille: "couts", libelle: "Garantie financière", coefficient: 1, type: "note_1_3" },
  // Délais
  { famille: "delais", libelle: "Délai de livraison", coefficient: 2, type: "note_1_3" },
  { famille: "delais", libelle: "Planning détaillé fourni", coefficient: 1, type: "booleen" },
  // Service
  { famille: "service", libelle: "SAV / maintenance", coefficient: 1, type: "note_1_3" },
  { famille: "service", libelle: "Formation proposée", coefficient: 1, type: "note_1_3" },
  { famille: "service", libelle: "Réactivité aux demandes", coefficient: 1, type: "note_1_3" },
];

// ──────────────────────────────────────────────
// Schemas Zod
// ──────────────────────────────────────────────

const CreateMatriceSchema = z.object({
  titre: z.string().min(1, "Le titre est requis").max(300),
  acheteur: z.string().max(200).optional().nullable(),
  site: z.string().max(200).optional().nullable(),
  familleAchats: z.string().max(200).optional().nullable(),
  budgetTheorique: z.number().min(0).optional().nullable(),
  devise: z.string().max(10).default("EUR"),
  seuilGo: z.number().min(0).max(100).default(60),
});

const UpdateMatriceSchema = z.object({
  titre: z.string().min(1).max(300).optional(),
  acheteur: z.string().max(200).optional().nullable(),
  site: z.string().max(200).optional().nullable(),
  familleAchats: z.string().max(200).optional().nullable(),
  budgetTheorique: z.number().min(0).optional().nullable(),
  devise: z.string().max(10).optional(),
  seuilGo: z.number().min(0).max(100).optional(),
  statut: z.string().optional(),
});

const FournisseurSchema = z.object({
  nom: z.string().min(1, "Le nom est requis").max(200),
  rang: z.number().int().min(1).default(1),
  refOffre: z.string().max(200).optional().nullable(),
  dateOffre: z.coerce.date().optional().nullable(),
  paysFabrication: z.string().max(200).optional().nullable(),
  incoterm: z.string().max(50).optional().nullable(),
});

const UpdateFournisseurSchema = z.object({
  nom: z.string().min(1).max(200).optional(),
  rang: z.number().int().min(1).optional(),
  refOffre: z.string().max(200).optional().nullable(),
  dateOffre: z.coerce.date().optional().nullable(),
  paysFabrication: z.string().max(200).optional().nullable(),
  incoterm: z.string().max(50).optional().nullable(),
  decision: z.enum(["go", "no_go", "en_attente"]).optional(),
  couleurDecision: z.enum(["vert", "jaune", "rouge"]).optional(),
});

const CritereSchema = z.object({
  famille: z.string().min(1),
  libelle: z.string().min(1).max(300),
  coefficient: z.number().min(0).default(1),
  ordreAffichage: z.number().int().min(0).default(0),
  type: z.enum(["texte", "note_1_3", "booleen", "date", "montant"]).default("note_1_3"),
});

const UpdateCritereSchema = z.object({
  famille: z.string().min(1).optional(),
  libelle: z.string().min(1).max(300).optional(),
  coefficient: z.number().min(0).optional(),
  ordreAffichage: z.number().int().min(0).optional(),
  type: z.enum(["texte", "note_1_3", "booleen", "date", "montant"]).optional(),
});

const NotationSchema = z.object({
  critereId: z.string().min(1),
  valeurTexte: z.string().optional().nullable(),
  note: z.number().int().min(1).max(3).optional().nullable(),
  valeurBool: z.boolean().optional().nullable(),
  commentaire: z.string().optional().nullable(),
  estNonConformiteMajeure: z.boolean().default(false),
  estNonConformiteNegociable: z.boolean().default(false),
});

// ──────────────────────────────────────────────
// Matrice CRUD
// ──────────────────────────────────────────────

export async function getMatrices(projetId: string) {
  const user = await getAuthUser();
  await checkMembership(projetId, user.id);

  return prisma.matriceDecisionnelle.findMany({
    where: { projetId },
    include: {
      _count: { select: { fournisseurs: true, criteres: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMatrice(projetId: string, matriceId: string) {
  const user = await getAuthUser();
  await checkMembership(projetId, user.id);

  const matrice = await prisma.matriceDecisionnelle.findFirst({
    where: { id: matriceId, projetId },
    include: {
      fournisseurs: {
        orderBy: { rang: "asc" },
        include: {
          notations: true,
        },
      },
      criteres: {
        orderBy: [{ famille: "asc" }, { ordreAffichage: "asc" }],
        include: {
          notations: true,
        },
      },
    },
  });

  if (!matrice) throw new Error("Matrice introuvable");
  return matrice;
}

export async function createMatrice(
  projetId: string,
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser();
    await checkMembership(projetId, user.id);

    const parsed = CreateMatriceSchema.parse(data);

    const matrice = await prisma.$transaction(async (tx) => {
      const m = await tx.matriceDecisionnelle.create({
        data: {
          projetId,
          titre: parsed.titre,
          acheteur: parsed.acheteur ?? null,
          site: parsed.site ?? null,
          familleAchats: parsed.familleAchats ?? null,
          budgetTheorique: parsed.budgetTheorique ?? null,
          devise: parsed.devise,
          seuilGo: parsed.seuilGo,
        },
      });

      // Create default criteria
      await tx.critere.createMany({
        data: CRITERES_PAR_DEFAUT.map((c, index) => ({
          matriceId: m.id,
          famille: c.famille,
          libelle: c.libelle,
          coefficient: c.coefficient,
          type: c.type,
          ordreAffichage: index,
        })),
      });

      return m;
    });

    revalidatePath(`/projets/${projetId}/matrice`);
    return { success: true, data: { id: matrice.id } };
  } catch (error) {
    console.error("createMatrice error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la création",
    };
  }
}

export async function updateMatrice(
  projetId: string,
  matriceId: string,
  data: unknown
): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    await checkMembership(projetId, user.id);

    const parsed = UpdateMatriceSchema.parse(data);

    const existing = await prisma.matriceDecisionnelle.findFirst({
      where: { id: matriceId, projetId },
    });
    if (!existing) throw new Error("Matrice introuvable");

    await prisma.matriceDecisionnelle.update({
      where: { id: matriceId },
      data: parsed,
    });

    revalidatePath(`/projets/${projetId}/matrice`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("updateMatrice error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la mise à jour",
    };
  }
}

export async function deleteMatrice(
  projetId: string,
  matriceId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    await checkMembership(projetId, user.id);

    const existing = await prisma.matriceDecisionnelle.findFirst({
      where: { id: matriceId, projetId },
    });
    if (!existing) throw new Error("Matrice introuvable");

    await prisma.matriceDecisionnelle.delete({ where: { id: matriceId } });

    revalidatePath(`/projets/${projetId}/matrice`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteMatrice error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la suppression",
    };
  }
}

// ──────────────────────────────────────────────
// Fournisseur CRUD
// ──────────────────────────────────────────────

export async function addFournisseur(
  projetId: string,
  matriceId: string,
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser();
    await checkMembership(projetId, user.id);

    const matrice = await prisma.matriceDecisionnelle.findFirst({
      where: { id: matriceId, projetId },
    });
    if (!matrice) throw new Error("Matrice introuvable");

    const parsed = FournisseurSchema.parse(data);

    const fournisseur = await prisma.fournisseurCandidat.create({
      data: {
        matriceId,
        nom: parsed.nom,
        rang: parsed.rang,
        refOffre: parsed.refOffre ?? null,
        dateOffre: parsed.dateOffre ?? null,
        paysFabrication: parsed.paysFabrication ?? null,
        incoterm: parsed.incoterm ?? null,
      },
    });

    revalidatePath(`/projets/${projetId}/matrice`);
    return { success: true, data: { id: fournisseur.id } };
  } catch (error) {
    console.error("addFournisseur error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de l'ajout du fournisseur",
    };
  }
}

export async function updateFournisseur(
  projetId: string,
  fournisseurId: string,
  data: unknown
): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    await checkMembership(projetId, user.id);

    const parsed = UpdateFournisseurSchema.parse(data);

    const fournisseur = await prisma.fournisseurCandidat.findFirst({
      where: { id: fournisseurId, matrice: { projetId } },
    });
    if (!fournisseur) throw new Error("Fournisseur introuvable");

    await prisma.fournisseurCandidat.update({
      where: { id: fournisseurId },
      data: parsed,
    });

    revalidatePath(`/projets/${projetId}/matrice`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("updateFournisseur error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la mise à jour",
    };
  }
}

export async function removeFournisseur(
  projetId: string,
  fournisseurId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    await checkMembership(projetId, user.id);

    const fournisseur = await prisma.fournisseurCandidat.findFirst({
      where: { id: fournisseurId, matrice: { projetId } },
    });
    if (!fournisseur) throw new Error("Fournisseur introuvable");

    await prisma.fournisseurCandidat.delete({ where: { id: fournisseurId } });

    revalidatePath(`/projets/${projetId}/matrice`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("removeFournisseur error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la suppression",
    };
  }
}

// ──────────────────────────────────────────────
// Critère CRUD
// ──────────────────────────────────────────────

export async function addCritere(
  projetId: string,
  matriceId: string,
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser();
    await checkMembership(projetId, user.id);

    const matrice = await prisma.matriceDecisionnelle.findFirst({
      where: { id: matriceId, projetId },
    });
    if (!matrice) throw new Error("Matrice introuvable");

    const parsed = CritereSchema.parse(data);

    const critere = await prisma.critere.create({
      data: {
        matriceId,
        famille: parsed.famille,
        libelle: parsed.libelle,
        coefficient: parsed.coefficient,
        ordreAffichage: parsed.ordreAffichage,
        type: parsed.type,
      },
    });

    revalidatePath(`/projets/${projetId}/matrice`);
    return { success: true, data: { id: critere.id } };
  } catch (error) {
    console.error("addCritere error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de l'ajout du critère",
    };
  }
}

export async function updateCritere(
  projetId: string,
  critereId: string,
  data: unknown
): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    await checkMembership(projetId, user.id);

    const parsed = UpdateCritereSchema.parse(data);

    const critere = await prisma.critere.findFirst({
      where: { id: critereId, matrice: { projetId } },
    });
    if (!critere) throw new Error("Critère introuvable");

    await prisma.critere.update({
      where: { id: critereId },
      data: parsed,
    });

    revalidatePath(`/projets/${projetId}/matrice`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("updateCritere error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la mise à jour",
    };
  }
}

export async function removeCritere(
  projetId: string,
  critereId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    await checkMembership(projetId, user.id);

    const critere = await prisma.critere.findFirst({
      where: { id: critereId, matrice: { projetId } },
    });
    if (!critere) throw new Error("Critère introuvable");

    await prisma.critere.delete({ where: { id: critereId } });

    revalidatePath(`/projets/${projetId}/matrice`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("removeCritere error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la suppression",
    };
  }
}

// ──────────────────────────────────────────────
// Notations — batch upsert
// ──────────────────────────────────────────────

export async function saveNotations(
  projetId: string,
  fournisseurId: string,
  notations: unknown
): Promise<ActionResult> {
  try {
    const user = await getAuthUser();
    await checkMembership(projetId, user.id);

    const fournisseur = await prisma.fournisseurCandidat.findFirst({
      where: { id: fournisseurId, matrice: { projetId } },
    });
    if (!fournisseur) throw new Error("Fournisseur introuvable");

    const parsed = z.array(NotationSchema).parse(notations);

    await prisma.$transaction(async (tx) => {
      for (const notation of parsed) {
        await tx.notationCritere.upsert({
          where: {
            critereId_fournisseurId: {
              critereId: notation.critereId,
              fournisseurId,
            },
          },
          create: {
            critereId: notation.critereId,
            fournisseurId,
            valeurTexte: notation.valeurTexte ?? null,
            note: notation.note ?? null,
            valeurBool: notation.valeurBool ?? null,
            commentaire: notation.commentaire ?? null,
            estNonConformiteMajeure: notation.estNonConformiteMajeure,
            estNonConformiteNegociable: notation.estNonConformiteNegociable,
          },
          update: {
            valeurTexte: notation.valeurTexte ?? null,
            note: notation.note ?? null,
            valeurBool: notation.valeurBool ?? null,
            commentaire: notation.commentaire ?? null,
            estNonConformiteMajeure: notation.estNonConformiteMajeure,
            estNonConformiteNegociable: notation.estNonConformiteNegociable,
          },
        });
      }
    });

    revalidatePath(`/projets/${projetId}/matrice`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("saveNotations error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la sauvegarde des notations",
    };
  }
}

// ──────────────────────────────────────────────
// Moteur de scoring
// ──────────────────────────────────────────────

type ResultatFournisseur = {
  fournisseurId: string;
  nom: string;
  score: number;
  scoreMax: number;
  scoreNormalise: number;
  hasNonConformiteMajeure: boolean;
  decision: "go" | "no_go" | "en_attente";
  couleurDecision: "vert" | "jaune" | "rouge";
  rang: number;
};

export async function calculerResultats(
  matriceId: string
): Promise<ActionResult<{ resultats: ResultatFournisseur[] }>> {
  try {
    const user = await getAuthUser();

    const matrice = await prisma.matriceDecisionnelle.findUnique({
      where: { id: matriceId },
      include: {
        fournisseurs: {
          include: { notations: true },
        },
        criteres: true,
      },
    });

    if (!matrice) throw new Error("Matrice introuvable");
    await checkMembership(matrice.projetId, user.id);

    const criteresNote = matrice.criteres.filter((c) => c.type === "note_1_3");
    const scoreMax = criteresNote.reduce((sum, c) => sum + 3 * c.coefficient, 0);

    const resultats: ResultatFournisseur[] = matrice.fournisseurs.map((f) => {
      // Calculate score from note_1_3 criteria
      let score = 0;
      let hasNonConformiteMajeure = false;

      for (const critere of criteresNote) {
        const notation = f.notations.find((n) => n.critereId === critere.id);
        if (notation) {
          if (notation.note) {
            score += notation.note * critere.coefficient;
          }
          if (notation.estNonConformiteMajeure) {
            hasNonConformiteMajeure = true;
          }
        }
      }

      // Also check non-conformite on non-note criteria
      for (const notation of f.notations) {
        if (notation.estNonConformiteMajeure) {
          hasNonConformiteMajeure = true;
        }
      }

      const scoreNormalise = scoreMax > 0 ? (score / scoreMax) * 100 : 0;

      let decision: "go" | "no_go" | "en_attente";
      let couleurDecision: "vert" | "jaune" | "rouge";

      if (hasNonConformiteMajeure) {
        decision = "no_go";
        couleurDecision = "rouge";
      } else if (scoreNormalise < matrice.seuilGo) {
        decision = "no_go";
        couleurDecision = "jaune";
      } else {
        decision = "go";
        couleurDecision = "vert";
      }

      return {
        fournisseurId: f.id,
        nom: f.nom,
        score,
        scoreMax,
        scoreNormalise: Math.round(scoreNormalise * 100) / 100,
        hasNonConformiteMajeure,
        decision,
        couleurDecision,
        rang: 0, // Will be set after sorting
      };
    });

    // Sort by score descending and assign ranks
    resultats.sort((a, b) => b.scoreNormalise - a.scoreNormalise);
    resultats.forEach((r, i) => {
      r.rang = i + 1;
    });

    // Update fournisseurs in DB with decisions
    await prisma.$transaction(
      resultats.map((r) =>
        prisma.fournisseurCandidat.update({
          where: { id: r.fournisseurId },
          data: {
            decision: r.decision,
            couleurDecision: r.couleurDecision,
            rang: r.rang,
          },
        })
      )
    );

    revalidatePath(`/projets/${matrice.projetId}/matrice`);
    return { success: true, data: { resultats } };
  } catch (error) {
    console.error("calculerResultats error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors du calcul des résultats",
    };
  }
}

// ──────────────────────────────────────────────
// Dupliquer matrice
// ──────────────────────────────────────────────

export async function dupliquerMatrice(
  projetId: string,
  matriceId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser();
    await checkMembership(projetId, user.id);

    const source = await prisma.matriceDecisionnelle.findFirst({
      where: { id: matriceId, projetId },
      include: {
        criteres: true,
        fournisseurs: {
          include: { notations: true },
        },
      },
    });
    if (!source) throw new Error("Matrice introuvable");

    const newMatrice = await prisma.$transaction(async (tx) => {
      const copie = await tx.matriceDecisionnelle.create({
        data: {
          projetId,
          titre: `${source.titre} (copie)`,
          acheteur: source.acheteur,
          site: source.site,
          familleAchats: source.familleAchats,
          budgetTheorique: source.budgetTheorique,
          devise: source.devise,
          seuilGo: source.seuilGo,
        },
      });

      // Copy criteria and build mapping old -> new ID
      const critereMapping: Record<string, string> = {};
      for (const critere of source.criteres) {
        const newCritere = await tx.critere.create({
          data: {
            matriceId: copie.id,
            famille: critere.famille,
            libelle: critere.libelle,
            coefficient: critere.coefficient,
            ordreAffichage: critere.ordreAffichage,
            type: critere.type,
          },
        });
        critereMapping[critere.id] = newCritere.id;
      }

      // Copy fournisseurs with their notations
      for (const fournisseur of source.fournisseurs) {
        const newFournisseur = await tx.fournisseurCandidat.create({
          data: {
            matriceId: copie.id,
            nom: fournisseur.nom,
            rang: fournisseur.rang,
            refOffre: fournisseur.refOffre,
            dateOffre: fournisseur.dateOffre,
            paysFabrication: fournisseur.paysFabrication,
            incoterm: fournisseur.incoterm,
            decision: "en_attente",
            couleurDecision: "jaune",
          },
        });

        // Copy notations
        const notationsData = fournisseur.notations
          .filter((n) => critereMapping[n.critereId])
          .map((n) => ({
            critereId: critereMapping[n.critereId],
            fournisseurId: newFournisseur.id,
            valeurTexte: n.valeurTexte,
            note: n.note,
            valeurBool: n.valeurBool,
            commentaire: n.commentaire,
            estNonConformiteMajeure: n.estNonConformiteMajeure,
            estNonConformiteNegociable: n.estNonConformiteNegociable,
          }));

        if (notationsData.length > 0) {
          await tx.notationCritere.createMany({ data: notationsData });
        }
      }

      return copie;
    });

    revalidatePath(`/projets/${projetId}/matrice`);
    return { success: true, data: { id: newMatrice.id } };
  } catch (error) {
    console.error("dupliquerMatrice error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la duplication",
    };
  }
}
