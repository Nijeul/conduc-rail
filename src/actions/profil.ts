'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { ActionResult } from '@/types'
import bcrypt from 'bcryptjs'

async function getAuthUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Non authentifie')
  }
  return session.user
}

const ProfilSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  nomSociete: z.string().max(100).optional(),
  logoSociete: z.string().optional().nullable(),
  adresseSociete: z.string().max(500).optional(),
  telSociete: z.string().max(30).optional(),
  faxSociete: z.string().max(30).optional(),
  certifications: z.string().max(200).optional(),
})

const PasswordSchema = z.object({
  ancienMotDePasse: z.string().min(1, "L'ancien mot de passe est requis"),
  nouveauMotDePasse: z.string().min(8, 'Le nouveau mot de passe doit faire au moins 8 caracteres'),
  confirmation: z.string().min(1, 'La confirmation est requise'),
}).refine(data => data.nouveauMotDePasse === data.confirmation, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmation'],
})

export async function getProfil() {
  const sessionUser = await getAuthUser()

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      nomSociete: true,
      logoSociete: true,
      adresseSociete: true,
      telSociete: true,
      faxSociete: true,
      certifications: true,
    },
  })

  if (!user) throw new Error('Utilisateur introuvable')
  return user
}

export async function updateProfil(data: unknown): Promise<ActionResult> {
  try {
    const sessionUser = await getAuthUser()

    const parsed = ProfilSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    // Validate logo size if provided (base64 string ~= 1.37x original size)
    if (parsed.data.logoSociete && parsed.data.logoSociete.length > 2.8 * 1024 * 1024) {
      return { success: false, error: 'Le logo ne doit pas depasser 2 MB' }
    }

    await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        name: parsed.data.name,
        nomSociete: parsed.data.nomSociete || null,
        logoSociete: parsed.data.logoSociete ?? null,
        adresseSociete: parsed.data.adresseSociete || null,
        telSociete: parsed.data.telSociete || null,
        faxSociete: parsed.data.faxSociete || null,
        certifications: parsed.data.certifications || null,
      },
    })

    revalidatePath('/profil')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('updateProfil error:', error)
    return { success: false, error: 'Erreur lors de la mise a jour du profil' }
  }
}

export async function changePassword(data: unknown): Promise<ActionResult> {
  try {
    const sessionUser = await getAuthUser()

    const parsed = PasswordSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, password: true },
    })

    if (!user) {
      return { success: false, error: 'Utilisateur introuvable' }
    }

    const passwordMatch = await bcrypt.compare(parsed.data.ancienMotDePasse, user.password)
    if (!passwordMatch) {
      return { success: false, error: "L'ancien mot de passe est incorrect" }
    }

    const hashedPassword = await bcrypt.hash(parsed.data.nouveauMotDePasse, 12)

    await prisma.user.update({
      where: { id: sessionUser.id },
      data: { password: hashedPassword },
    })

    return { success: true, data: undefined }
  } catch (error) {
    console.error('changePassword error:', error)
    return { success: false, error: 'Erreur lors du changement de mot de passe' }
  }
}
