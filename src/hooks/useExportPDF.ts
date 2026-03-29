import { useRef, useState } from 'react'

export function useExportPDF() {
  const isExportingRef = useRef(false)
  const [isExporting, setIsExporting] = useState(false)

  const exportAvecGuard = async (fn: () => Promise<void>) => {
    if (isExportingRef.current) return
    isExportingRef.current = true
    setIsExporting(true)
    try {
      await fn()
    } finally {
      setTimeout(() => {
        isExportingRef.current = false
        setIsExporting(false)
      }, 1000)
    }
  }

  return { exportAvecGuard, isExporting }
}
