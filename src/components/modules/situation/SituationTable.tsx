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

function getAvancementBg(avancement: number): string {
  if (avancement >= 100) return 'bg-[#E8F5E9]'
  if (avancement >= 50) return 'bg-[#FFF8E1]'
  return 'bg-[#FFEBEE]'
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
          className="bg-[#1565C0] hover:bg-[#1256A1] text-white"
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
            className="bg-[#37474F] hover:bg-[#455A64] text-[#ECEFF1]"
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
          <div className="overflow-x-auto rounded-lg border border-[#ECEFF1]">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[#263238] text-white font-bold">
                  <th className="px-3 py-2 text-left">N° prix</th>
                  <th className="px-3 py-2 text-left">Intitule</th>
                  <th className="px-3 py-2 text-center">Unite</th>
                  <th className="px-3 py-2 text-right">Qte marche</th>
                  <th className="px-3 py-2 text-right">Qte realisee</th>
                  <th className="px-3 py-2 text-right">Avancement %</th>
                </tr>
              </thead>
              <tbody>
                {result.lignes.map((l, i) => (
                  <tr
                    key={l.id}
                    className={`border-b border-[#ECEFF1] ${
                      i % 2 === 0 ? 'bg-white' : 'bg-[#F5F7FA]'
                    }`}
                  >
                    <td className="px-3 py-2 font-mono">{l.code}</td>
                    <td className="px-3 py-2">{l.designation}</td>
                    <td className="px-3 py-2 text-center">{l.unite}</td>
                    <td className="px-3 py-2 text-right">
                      {formatNombreFR(l.quantiteMarche)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatNombreFR(l.quantiteRealisee)}
                    </td>
                    <td
                      className={`px-3 py-2 text-right font-semibold ${getAvancementBg(
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
                      colSpan={6}
                      className="px-3 py-8 text-center text-gray-400"
                    >
                      Aucune ligne dans le Detail Estimatif
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-[#F5F7FA] font-bold border-t-2 border-[#263238]">
                  <td colSpan={5} className="px-3 py-3 text-right">
                    Montant realise HT :
                  </td>
                  <td className="px-3 py-3 text-right text-[#1565C0]">
                    {formatMontant(result.totalMontantRealise)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

    </div>
  )
}
