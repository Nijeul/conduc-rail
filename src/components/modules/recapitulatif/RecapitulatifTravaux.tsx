'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { formatNombreFR, formatDateFR } from '@/lib/utils'
import { Search, Download, FileText, BarChart3, FileCheck, CheckCircle2, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface LigneDEData {
  id: string
  code: string
  designation: string
  unite: string
  quantite: number
}

interface RapportData {
  id: string
  date: string
  titre: string | null
}

interface RecapitulatifTravauxProps {
  projetId: string
  projetName: string
  lignesDE: LigneDEData[]
  rapports: RapportData[]
  matrice: Record<string, Record<string, number>>
}

type FilterType = 'tous' | 'en_cours' | 'termines'

function getAvancementStyle(pct: number): { bg: string; text: string } {
  if (pct >= 100) return { bg: '#E8EFDA', text: '#5E8019' }
  if (pct >= 75) return { bg: '#FFF7D1', text: '#DD9412' }
  if (pct >= 50) return { bg: '#F9E9D9', text: '#C26A32' }
  return { bg: '#FDEAED', text: '#E20025' }
}

function formatShortDate(iso: string): string {
  const d = new Date(iso)
  return formatDateFR(d)
}

export function RecapitulatifTravaux({
  projetId,
  projetName,
  lignesDE,
  rapports,
  matrice,
}: RecapitulatifTravauxProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('tous')
  const tableRef = useRef<HTMLDivElement>(null)

  // Compute totals per ligne
  const ligneTotals = useMemo(() => {
    const result: Record<string, number> = {}
    for (const ligne of lignesDE) {
      let total = 0
      const rapportMap = matrice[ligne.id] || {}
      for (const qty of Object.values(rapportMap)) {
        total += qty
      }
      result[ligne.id] = total
    }
    return result
  }, [lignesDE, matrice])

  // Filter lignes
  const filteredLignes = useMemo(() => {
    let result = lignesDE

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        l => l.code.toLowerCase().includes(q) || l.designation.toLowerCase().includes(q)
      )
    }

    if (filter === 'termines') {
      result = result.filter(l => l.quantite > 0 && ligneTotals[l.id] >= l.quantite)
    } else if (filter === 'en_cours') {
      result = result.filter(l => l.quantite <= 0 || ligneTotals[l.id] < l.quantite)
    }

    return result
  }, [lignesDE, searchQuery, filter, ligneTotals])

  // Synthesis cards
  const stats = useMemo(() => {
    const totalLignes = lignesDE.length
    const rapportsLies = rapports.length
    const terminees = lignesDE.filter(l => l.quantite > 0 && ligneTotals[l.id] >= l.quantite).length
    const totalPrevu = lignesDE.reduce((s, l) => s + l.quantite, 0)
    const totalRealise = Object.values(ligneTotals).reduce((s, v) => s + v, 0)
    const avancementGlobal = totalPrevu > 0 ? (totalRealise / totalPrevu) * 100 : 0
    return { totalLignes, rapportsLies, terminees, avancementGlobal }
  }, [lignesDE, rapports, ligneTotals])

  // Grand total row
  const grandTotalByRapport = useMemo(() => {
    const result: Record<string, number> = {}
    for (const r of rapports) {
      let total = 0
      for (const ligne of filteredLignes) {
        total += (matrice[ligne.id]?.[r.id] || 0)
      }
      result[r.id] = total
    }
    return result
  }, [rapports, filteredLignes, matrice])

  const grandTotal = useMemo(() => {
    return filteredLignes.reduce((s, l) => s + (ligneTotals[l.id] || 0), 0)
  }, [filteredLignes, ligneTotals])

  const grandTotalPrevu = useMemo(() => {
    return filteredLignes.reduce((s, l) => s + l.quantite, 0)
  }, [filteredLignes])

  // CSV Export
  const exportCSV = useCallback(() => {
    const BOM = '\uFEFF'
    const sep = ';'
    const headers = [
      'N\u00B0',
      'D\u00E9signation',
      'Unit\u00E9',
      'Pr\u00E9vu',
      ...rapports.map(r => `RJ ${formatShortDate(r.date)}`),
      'Total',
      '% Avancement',
    ]

    const rows = filteredLignes.map(l => {
      const total = ligneTotals[l.id] || 0
      const pct = l.quantite > 0 ? (total / l.quantite) * 100 : 0
      return [
        l.code,
        `"${l.designation.replace(/"/g, '""')}"`,
        l.unite,
        formatNombreFR(l.quantite),
        ...rapports.map(r => {
          const val = matrice[l.id]?.[r.id] || 0
          return val > 0 ? formatNombreFR(val) : ''
        }),
        formatNombreFR(total),
        formatNombreFR(pct, 1) + '%',
      ]
    })

    const csv = BOM + [headers.join(sep), ...rows.map(r => r.join(sep))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recapitulatif_${projetName.replace(/\s+/g, '_')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [filteredLignes, rapports, matrice, ligneTotals, projetName])

  // PDF Export
  const exportPDF = useCallback(async () => {
    const html2canvas = (await import('html2canvas')).default
    const { jsPDF } = await import('jspdf')

    if (!tableRef.current) return

    const canvas = await html2canvas(tableRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FFFFFF',
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('landscape', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // Header band
    pdf.setFillColor(0, 68, 137) // #004489
    pdf.rect(0, 0, pageWidth, 18, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('CONDUC RAIL', 10, 12)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`${projetName} - R\u00E9capitulatif Travaux`, pageWidth - 10, 12, { align: 'right' })

    // Image
    const margin = 10
    const headerH = 22
    const footerH = 12
    const availW = pageWidth - 2 * margin
    const availH = pageHeight - headerH - footerH
    const imgW = canvas.width
    const imgH = canvas.height
    const ratio = Math.min(availW / imgW, availH / imgH)
    const drawW = imgW * ratio
    const drawH = imgH * ratio

    if (drawH <= availH) {
      pdf.addImage(imgData, 'PNG', margin, headerH, drawW, drawH)
    } else {
      // Multi-page: scale to fit width, split vertically
      const scaleW = availW / imgW
      const fullDrawH = imgH * scaleW
      let yOffset = 0
      let page = 0
      while (yOffset < fullDrawH) {
        if (page > 0) {
          pdf.addPage()
          pdf.setFillColor(0, 68, 137)
          pdf.rect(0, 0, pageWidth, 18, 'F')
          pdf.setTextColor(255, 255, 255)
          pdf.setFontSize(10)
          pdf.setFont('helvetica', 'normal')
          pdf.text(`${projetName} - R\u00E9capitulatif Travaux (suite)`, pageWidth - 10, 12, { align: 'right' })
        }
        pdf.addImage(imgData, 'PNG', margin, headerH - yOffset, availW, fullDrawH)
        yOffset += availH
        page++
      }
    }

    // Footer
    const totalPages = pdf.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setDrawColor(220, 220, 220)
      pdf.line(margin, pageHeight - footerH, pageWidth - margin, pageHeight - footerH)
      pdf.setTextColor(181, 171, 161)
      pdf.setFontSize(8)
      pdf.text(`Page ${i} / ${totalPages}`, pageWidth - margin, pageHeight - 4, { align: 'right' })
    }

    pdf.save(`recapitulatif_${projetName.replace(/\s+/g, '_')}.pdf`)
  }, [projetName])

  const avancementGlobalStyle = getAvancementStyle(stats.avancementGlobal)

  return (
    <div className="p-6 space-y-6">
      {/* Synthesis cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SynthCard
          icon={<FileText className="h-5 w-5 text-[#004489]" />}
          label="Lignes DE"
          value={String(stats.totalLignes)}
        />
        <SynthCard
          icon={<BarChart3 className="h-5 w-5 text-[#004489]" />}
          label="Rapports lies"
          value={String(stats.rapportsLies)}
        />
        <SynthCard
          icon={<CheckCircle2 className="h-5 w-5 text-[#5E8019]" />}
          label="Lignes terminees"
          value={String(stats.terminees)}
        />
        <div
          className="flex items-center gap-3 rounded-lg border p-4"
          style={{ borderColor: '#DCDCDC', backgroundColor: avancementGlobalStyle.bg }}
        >
          <TrendingUp className="h-5 w-5" style={{ color: avancementGlobalStyle.text }} />
          <div>
            <div className="text-xs text-[#5A5A5A]">Avancement global</div>
            <div className="text-lg font-bold" style={{ color: avancementGlobalStyle.text }}>
              {formatNombreFR(stats.avancementGlobal, 1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A5A5A]" />
          <Input
            placeholder="Rechercher une ligne..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {([
            ['tous', 'Tous'],
            ['en_cours', 'En cours'],
            ['termines', 'Termin\u00E9s'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="px-3 py-1.5 text-sm rounded-md transition-colors"
              style={
                filter === key
                  ? { backgroundColor: '#004489', color: '#FFFFFF' }
                  : { backgroundColor: '#F0F0F0', color: '#000000', border: '1px solid #DCDCDC' }
              }
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          <Button
            onClick={exportCSV}
            variant="outline"
            className="text-sm border-[#004489] text-[#004489]"
          >
            <Download className="h-4 w-4 mr-1" />
            CSV
          </Button>
          <Button
            onClick={exportPDF}
            className="text-sm bg-[#004489] hover:bg-[#003370] text-white"
          >
            <FileCheck className="h-4 w-4 mr-1" />
            PDF
          </Button>
        </div>
      </div>

      {/* Table */}
      <div ref={tableRef} className="overflow-x-auto border border-[#DCDCDC] rounded-lg">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr style={{ backgroundColor: '#004489' }}>
              <th className="text-left px-2 py-2 text-white font-bold border-r border-white/20 whitespace-nowrap sticky left-0 z-10" style={{ backgroundColor: '#004489', minWidth: 50 }}>
                N°
              </th>
              <th className="text-left px-2 py-2 text-white font-bold border-r border-white/20 whitespace-nowrap" style={{ minWidth: 200 }}>
                Designation
              </th>
              <th className="text-center px-2 py-2 text-white font-bold border-r border-white/20 whitespace-nowrap" style={{ minWidth: 50 }}>
                Unite
              </th>
              <th className="text-right px-2 py-2 text-white font-bold border-r border-white/20 whitespace-nowrap" style={{ minWidth: 70 }}>
                Prevu
              </th>
              {rapports.map(r => (
                <th
                  key={r.id}
                  className="text-center px-2 py-2 text-white font-bold border-r border-white/20 whitespace-nowrap"
                  style={{ minWidth: 70 }}
                  title={r.titre || undefined}
                >
                  RJ {formatShortDate(r.date)}
                </th>
              ))}
              <th className="text-right px-2 py-2 text-white font-bold border-r border-white/20 whitespace-nowrap" style={{ minWidth: 70 }}>
                Total
              </th>
              <th className="text-center px-2 py-2 text-white font-bold whitespace-nowrap" style={{ minWidth: 80 }}>
                % Avancement
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLignes.length === 0 ? (
              <tr>
                <td
                  colSpan={4 + rapports.length + 2}
                  className="text-center py-8 text-[#5A5A5A]"
                >
                  Aucune ligne trouvee
                </td>
              </tr>
            ) : (
              filteredLignes.map((ligne, idx) => {
                const total = ligneTotals[ligne.id] || 0
                const pct = ligne.quantite > 0 ? (total / ligne.quantite) * 100 : 0
                const avStyle = getAvancementStyle(pct)
                const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#F0F0F0'

                return (
                  <tr key={ligne.id} style={{ backgroundColor: rowBg }}>
                    <td
                      className="px-2 py-1.5 border-r border-[#DCDCDC] font-mono sticky left-0 z-10"
                      style={{ backgroundColor: rowBg }}
                    >
                      {ligne.code}
                    </td>
                    <td className="px-2 py-1.5 border-r border-[#DCDCDC]">
                      {ligne.designation}
                    </td>
                    <td className="px-2 py-1.5 border-r border-[#DCDCDC] text-center">
                      {ligne.unite}
                    </td>
                    <td className="px-2 py-1.5 border-r border-[#DCDCDC] text-right">
                      {formatNombreFR(ligne.quantite)}
                    </td>
                    {rapports.map(r => {
                      const val = matrice[ligne.id]?.[r.id] || 0
                      return (
                        <td
                          key={r.id}
                          className="px-2 py-1.5 border-r border-[#DCDCDC] text-center"
                          style={
                            val > 0
                              ? { backgroundColor: '#E5EFF8', color: '#004489', fontWeight: 700 }
                              : undefined
                          }
                        >
                          {val > 0 ? formatNombreFR(val) : ''}
                        </td>
                      )
                    })}
                    <td className="px-2 py-1.5 border-r border-[#DCDCDC] text-right font-bold">
                      {formatNombreFR(total)}
                    </td>
                    <td
                      className="px-2 py-1.5 text-center font-bold"
                      style={{ backgroundColor: avStyle.bg, color: avStyle.text }}
                    >
                      {formatNombreFR(pct, 1)}%
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
          {/* Total row */}
          {filteredLignes.length > 0 && (
            <tfoot>
              <tr style={{ backgroundColor: '#003370' }}>
                <td
                  colSpan={3}
                  className="px-2 py-2 text-white font-bold text-right sticky left-0 z-10"
                  style={{ backgroundColor: '#003370' }}
                >
                  TOTAL
                </td>
                <td className="px-2 py-2 text-white font-bold text-right border-r border-white/20">
                  {formatNombreFR(grandTotalPrevu)}
                </td>
                {rapports.map(r => (
                  <td
                    key={r.id}
                    className="px-2 py-2 text-white font-bold text-center border-r border-white/20"
                  >
                    {grandTotalByRapport[r.id] > 0 ? formatNombreFR(grandTotalByRapport[r.id]) : ''}
                  </td>
                ))}
                <td className="px-2 py-2 text-white font-bold text-right border-r border-white/20">
                  {formatNombreFR(grandTotal)}
                </td>
                <td className="px-2 py-2 text-white font-bold text-center">
                  {grandTotalPrevu > 0
                    ? formatNombreFR((grandTotal / grandTotalPrevu) * 100, 1) + '%'
                    : '-'}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}

function SynthCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-lg border border-[#DCDCDC] p-4">
      {icon}
      <div>
        <div className="text-xs text-[#5A5A5A]">{label}</div>
        <div className="text-lg font-bold text-[#000000]">{value}</div>
      </div>
    </div>
  )
}
