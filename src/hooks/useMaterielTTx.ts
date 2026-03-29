'use client'

import { useQuery } from '@tanstack/react-query'
import { getMaterielList } from '@/actions/materiel'
import type { MaterielTTx } from '@prisma/client'
import { useCallback } from 'react'

export function useMaterielTTx() {
  const { data: materiels = [], isLoading, error } = useQuery<MaterielTTx[]>({
    queryKey: ['materiel-ttx'],
    queryFn: () => getMaterielList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const getByType = useCallback(
    (type: string) => materiels.filter((m) => m.type === type),
    [materiels]
  )

  const getById = useCallback(
    (id: string) => materiels.find((m) => m.id === id) ?? null,
    [materiels]
  )

  return { materiels, isLoading, error, getByType, getById }
}
