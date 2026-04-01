'use client'

import { useState } from 'react'
import { shareProjet, removeProjetMember } from '@/actions/projets'
import { X, UserPlus } from 'lucide-react'

interface Member {
  id: string
  role: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface ProjetMembersProps {
  projetId: string
  members: Member[]
  isOwner: boolean
}

export function ProjetMembers({ projetId, members, isOwner }: ProjetMembersProps) {
  const [email, setEmail] = useState('')
  const [sharing, setSharing] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleShare(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setSharing(true)
    setMessage(null)

    const result = await shareProjet(projetId, email.trim())

    if (result.success) {
      setEmail('')
      setMessage({ type: 'success', text: 'Membre ajoute avec succes' })
    } else {
      setMessage({ type: 'error', text: result.error })
    }

    setSharing(false)
  }

  async function handleRemove(memberId: string) {
    setRemovingId(memberId)
    setMessage(null)

    const result = await removeProjetMember(projetId, memberId)

    if (result.success) {
      setMessage({ type: 'success', text: 'Membre retire du projet' })
    } else {
      setMessage({ type: 'error', text: result.error })
    }

    setRemovingId(null)
  }

  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold text-[#004489] border-b border-[#004489]/20 pb-2 w-full">
        Membres du projet
      </legend>

      {/* Members table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#004489] text-white">
              <th className="text-left px-4 py-2.5 font-medium">Nom</th>
              <th className="text-left px-4 py-2.5 font-medium">Email</th>
              <th className="text-left px-4 py-2.5 font-medium">Role</th>
              {isOwner && <th className="w-12 px-4 py-2.5"></th>}
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => (
              <tr
                key={member.id}
                className={index % 2 === 0 ? 'bg-white' : 'bg-[#F0F0F0]'}
              >
                <td className="px-4 py-2.5">{member.user.name}</td>
                <td className="px-4 py-2.5 text-text-secondary">{member.user.email}</td>
                <td className="px-4 py-2.5">
                  {member.role === 'owner' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#E5EFF8] text-[#004489]">
                      Owner
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F0F0F0] text-[#5A5A5A]">
                      Membre
                    </span>
                  )}
                </td>
                {isOwner && (
                  <td className="px-4 py-2.5 text-center">
                    {member.role !== 'owner' && (
                      <button
                        onClick={() => handleRemove(member.id)}
                        disabled={removingId === member.id}
                        className="p-1 rounded-md text-text-secondary hover:text-red-600 hover:bg-red-50
                                   transition-colors disabled:opacity-50"
                        title="Retirer ce membre"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Share form (owner only) */}
      {isOwner && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-[#004489]">Inviter un membre</p>
          <form onSubmit={handleShare} className="flex items-center gap-3">
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemple.fr"
                required
                className="w-full px-3 py-2 border border-border rounded-md text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#004489]/50"
              />
            </div>
            <button
              type="submit"
              disabled={sharing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#004489] text-white text-sm
                         font-medium rounded-md hover:bg-[#004489]/90 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="h-4 w-4" />
              {sharing ? 'Partage...' : 'Partager'}
            </button>
          </form>

          {message && (
            <p
              className={
                message.type === 'success'
                  ? 'text-sm text-green-700'
                  : 'text-sm text-[#E20025]'
              }
            >
              {message.text}
            </p>
          )}
        </div>
      )}
    </fieldset>
  )
}
