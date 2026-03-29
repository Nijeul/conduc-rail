'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { ActionResult } from '@/types'

const PersonnelSchema = z.object({
  prenom: z.string().min(1, 'Le prenom est requis').max(100),
  nom: z.string().min(1, 'Le nom est requis').max(100),
  poste: z.string().min(1, 'Le poste est requis'),
  telephone: z.string().max(20).optional().nullable(),
  entreprise: z.string().max(200).optional().nullable(),
})

async function getAuthUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Non authentifie')
  }
  return session.user
}

export async function getPersonnelList() {
  await getAuthUser()

  return prisma.personnel.findMany({
    orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
  })
}

export async function createPersonnel(data: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await getAuthUser()

    const parsed = PersonnelSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const personnel = await prisma.personnel.create({
      data: {
        prenom: parsed.data.prenom,
        nom: parsed.data.nom,
        poste: parsed.data.poste,
        telephone: parsed.data.telephone || null,
        entreprise: parsed.data.entreprise || null,
      },
    })

    revalidatePath('/personnel')
    return { success: true, data: { id: personnel.id } }
  } catch (error) {
    console.error('createPersonnel error:', error)
    return { success: false, error: 'Erreur lors de la creation' }
  }
}

export async function updatePersonnel(
  id: string,
  data: unknown
): Promise<ActionResult> {
  try {
    await getAuthUser()

    const parsed = PersonnelSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    await prisma.personnel.update({
      where: { id },
      data: {
        prenom: parsed.data.prenom,
        nom: parsed.data.nom,
        poste: parsed.data.poste,
        telephone: parsed.data.telephone || null,
        entreprise: parsed.data.entreprise || null,
      },
    })

    revalidatePath('/personnel')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('updatePersonnel error:', error)
    return { success: false, error: 'Erreur lors de la mise a jour' }
  }
}

export async function deletePersonnel(id: string): Promise<ActionResult> {
  try {
    await getAuthUser()

    await prisma.personnel.delete({ where: { id } })

    revalidatePath('/personnel')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deletePersonnel error:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}
