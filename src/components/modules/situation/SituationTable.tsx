'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { calculerSituation, type SituationResult } from '@/actions/situation'
import { formatNombreFR, formatMontant } from '@/lib/utils'
import { Calculator, FileText } from 'lucide-react'
import { useExportPDF } from '@/hooks/useExportPDF'
import { useProfilStore } from '@/stores/profil'

interface Props {
  projetId: string
  projetName: string
}

function getAvancementStyle(avancement: number): string {
  if (avancement >= 100) return 'bg-[#E8EFDA] text-[#5E8019]'
  if (avancement >= 50) return 'bg-[#FFF7D1] text-[#DD9412]'
  return 'bg-[#FDEAED] text-[#E20025]'
}

export function SituationTable({ projetId, projetName }: Props) {
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [result, setResult] = useState<SituationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { exportAvecGuard, isExporting } = useExportPDF()
  const userLogo = useProfilStore((s) => s.logoSociete)
  const nomSociete = useProfilStore((s) => s.nomSociete)

  async function handleCalculer() {
    if (!dateDebut || !dateFin) {
      setError('Veuillez saisir les deux dates')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await calculerSituation(projetId, dateDebut, dateFin)
      if (res.success) {
        setResult(res.data)
      } else {
        setError(res.error)
      }
    } catch {
      setError('Erreur lors du calcul')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Du :</label>
          <Input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="w-44"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Au :</label>
          <Input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="w-44"
          />
        </div>
        <Button
          onClick={handleCalculer}
          disabled={loading}
          className="bg-[#004489] hover:bg-[#003370] text-white"
        >
          <Calculator className="h-4 w-4 mr-1" />
          {loading ? 'Calcul...' : 'Calculer'}
        </Button>
        {result && (
          <Button
            onClick={() => {
              if (!result) return
              exportAvecGuard(async () => {
                try {
                  const { generateSituationPDF } = await import('./SituationPDFDownload')
                  await generateSituationPDF(projetName, result, userLogo ?? undefined, nomSociete ?? undefined)
                } catch (err) {
                  console.error('PDF generation error:', err)
                }
              })
            }}
            disabled={isExporting}
            className="bg-[#F0F0F0] hover:bg-[#E0E0E0] text-[#000000] border border-[#DCDCDC]"
          >
            <FileText className="h-4 w-4 mr-1" />
            {isExporting ? 'Generation...' : 'Export PDF'}
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      {result && (
        <>
          <div className="overflow-x-auto rounded-lg border border-[#DCDCDC]">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[#004489] text-white font-bold text-[12px]">
                  <th className="px-2 py-2 text-left">N° prix</th>
                  <th className="px-2 py-2 text-left">Intitulé</th>
                  <th className="px-2 py-2 text-center">Unité</th>
                  <th className="px-2 py-2 text-right">PU HT</th>
                  <th className="px-2 py-2 text-right">Qté marché</th>
                  <th className="px-2 py-2 text-right">Qté réalisée</th>
                  <th className="px-2 py-2 text-right">Montant réalisé</th>
                  <th className="px-2 py-2 text-right">Avancement %</th>
                </tr>
              </thead>
              <tbody>
                {result.lignes.map((l, i) => (
                  <tr
                    key={l.id}
                    className={`border-b border-[#DCDCDC] ${
                      i % 2 === 0 ? 'bg-white' : 'bg-[#F0F0F0]'
                    }`}
                  >
                    <td className="px-2 py-2 font-mono text-[12px]">{l.code}</td>
                    <td className="px-2 py-2 text-[12px]">{l.designation}</td>
                    <td className="px-2 py-2 text-center text-[12px]">{l.unite}</td>
                    <td className="px-2 py-2 text-right text-[12px]">
                      {formatMontant(l.prixUnitaire)}
                    </td>
                    <td className="px-2 py-2 text-right text-[12px]">
                      {formatNombreFR(l.quantiteMarche)}
                    </td>
                    <td className="px-2 py-2 text-right text-[12px]">
                      {formatNombreFR(l.quantiteRealisee)}
                    </td>
                    <td className="px-2 py-2 text-right text-[12px] font-medium">
                      {formatMontant(l.montantRealise)}
                    </td>
                    <td
                      className={`px-2 py-2 text-right font-semibold text-[12px] ${getAvancementStyle(
                        l.avancement
                      )}`}
                    >
                      {formatNombreFR(l.avancement, 1)} %
                    </td>
                  </tr>
                ))}
                {result.lignes.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-8 text-center text-gray-400"
                    >
                      Aucune ligne dans le Détail Estimatif
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-[#003370] font-bold border-t-2 border-[#004489]">
                  <td colSpan={6} className="px-2 py-3 text-right text-white text-[12px]">
                    MONTANT RÉALISÉ HT :
                  </td>
                  <td className="px-2 py-3 text-right text-white text-[14px]">
                    {formatMontant(result.totalMontantRealise)}
                  </td>
                  <td className="px-2 py-3 text-white" />
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

    </div>
  )
}
