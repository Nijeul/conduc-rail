"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VINCI } from "@/lib/design-tokens";
import {
  createOCP,
  createChantierElementaire,
  updateCreneaux,
} from "@/actions/planning";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface ImportReport {
  ocpId: string;
  ocpNom: string;
  version: "BASE" | "VARIANTE";
  nbChantiers: number;
  nbCreneaux: number;
  errors: string[];
}

interface PlanningExcelImportProps {
  projetId: string;
  nomProjet: string;
}

// ──────────────────────────────────────────────
// Import logic
// ──────────────────────────────────────────────

interface ParsedChantier {
  libelle: string;
  dureeCreneaux: number;
  slots: boolean[]; // true = actif for each time slot
}

interface ParsedSheet {
  version: "BASE" | "VARIANTE";
  sheetName: string;
  timeSlots: Date[];
  chantiers: ParsedChantier[];
}

async function parseExcelFile(file: File): Promise<ParsedSheet[]> {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  const buffer = await file.arrayBuffer();
  await workbook.xlsx.load(buffer);

  const results: ParsedSheet[] = [];

  workbook.eachSheet((worksheet) => {
    const name = worksheet.name.toUpperCase();
    let version: "BASE" | "VARIANTE" | null = null;

    if (name.includes("BASE")) version = "BASE";
    else if (name.includes("VARIANTE")) version = "VARIANTE";
    else return; // Skip sheets that don't match

    // Find the time header row (look for hours like "10h00", "10h30")
    // Try rows 4 and 5 — the sub-header with time labels
    let timeRow: number | null = null;
    let startCol = 3; // Columns C+

    for (let r = 3; r <= 6; r++) {
      const row = worksheet.getRow(r);
      const testVal = String(row.getCell(3).value ?? "");
      if (/\d{2}h\d{2}/.test(testVal)) {
        timeRow = r;
        break;
      }
    }

    if (!timeRow) {
      // Fallback: look for any row with time patterns
      for (let r = 1; r <= 10; r++) {
        const row = worksheet.getRow(r);
        for (let c = 3; c <= 10; c++) {
          const val = String(row.getCell(c).value ?? "");
          if (/\d{2}h\d{2}/.test(val)) {
            timeRow = r;
            startCol = c;
            break;
          }
        }
        if (timeRow) break;
      }
    }

    if (!timeRow) return;

    // Parse time slots from header
    const headerRow = worksheet.getRow(timeRow);
    const timeSlots: Date[] = [];
    let col = startCol;
    const maxCol = worksheet.columnCount;

    // We need the date context from the title row (row 1)
    // Parse dates from title or use a base date
    let baseDate = new Date();
    const titleVal = String(worksheet.getRow(1).getCell(1).value ?? "");
    const dateMatch = titleVal.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (dateMatch) {
      baseDate = new Date(
        parseInt(dateMatch[3]),
        parseInt(dateMatch[2]) - 1,
        parseInt(dateMatch[1])
      );
    }

    // Also try to read day headers from row 4 (if timeRow is 5)
    const dayRow = timeRow === 5 ? worksheet.getRow(4) : null;
    let currentDate = new Date(baseDate);

    while (col <= maxCol) {
      const val = String(headerRow.getCell(col).value ?? "").trim();
      if (!val) break;

      const timeMatch = val.match(/(\d{2})h(\d{2})/);
      if (timeMatch) {
        const hh = parseInt(timeMatch[1]);
        const mm = parseInt(timeMatch[2]);

        // Check if day row has a date for this column
        if (dayRow) {
          const dayVal = String(dayRow.getCell(col).value ?? "");
          const dayDateMatch = dayVal.match(/(\d{2})\/(\d{2})\/(\d{4})/);
          if (dayDateMatch) {
            currentDate = new Date(
              parseInt(dayDateMatch[3]),
              parseInt(dayDateMatch[2]) - 1,
              parseInt(dayDateMatch[1])
            );
          }
        }

        const slotDate = new Date(currentDate);
        slotDate.setHours(hh, mm, 0, 0);

        // If hour goes back (e.g. 23h -> 00h), advance the day
        if (
          timeSlots.length > 0 &&
          slotDate.getTime() <= timeSlots[timeSlots.length - 1].getTime()
        ) {
          currentDate.setDate(currentDate.getDate() + 1);
          slotDate.setFullYear(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate()
          );
        }

        timeSlots.push(slotDate);
      }
      col++;
    }

    if (timeSlots.length === 0) return;

    // Parse data rows (starting after headers)
    const dataStartRow = timeRow + 1;
    const chantiers: ParsedChantier[] = [];

    for (let r = dataStartRow; r <= worksheet.rowCount; r++) {
      const row = worksheet.getRow(r);
      const libelle = String(row.getCell(1).value ?? "").trim();
      if (!libelle) continue;

      const dureeVal = row.getCell(2).value;
      const dureeCreneaux =
        typeof dureeVal === "number" ? dureeVal : parseInt(String(dureeVal ?? "0")) || 0;

      const slots: boolean[] = [];
      for (let c = startCol; c < startCol + timeSlots.length; c++) {
        const cellVal = row.getCell(c).value;
        const isActive =
          cellVal === 1 ||
          cellVal === "1" ||
          cellVal === true ||
          (typeof cellVal === "number" && cellVal > 0);
        slots.push(isActive);
      }

      chantiers.push({ libelle, dureeCreneaux, slots });
    }

    results.push({
      version,
      sheetName: worksheet.name,
      timeSlots,
      chantiers,
    });
  });

  return results;
}

async function importParsedSheet(
  projetId: string,
  sheet: ParsedSheet,
  onProgress: (pct: number) => void
): Promise<ImportReport> {
  const errors: string[] = [];
  let nbCreneaux = 0;

  // Determine date range from time slots
  const dateDebut = sheet.timeSlots[0];
  const dateFin = new Date(
    sheet.timeSlots[sheet.timeSlots.length - 1].getTime() + 30 * 60000
  );

  // 1. Create OCP
  onProgress(5);
  const ocpResult = await createOCP(projetId, {
    nom: sheet.sheetName,
    dateDebut,
    dateFin,
    version: sheet.version,
  });

  if (!ocpResult.success) {
    return {
      ocpId: "",
      ocpNom: sheet.sheetName,
      version: sheet.version,
      nbChantiers: 0,
      nbCreneaux: 0,
      errors: [`Erreur creation OCP : ${ocpResult.error}`],
    };
  }

  const ocpId = ocpResult.data.id;
  const total = sheet.chantiers.length;

  // 2. Create chantiers + creneaux
  for (let i = 0; i < sheet.chantiers.length; i++) {
    const ch = sheet.chantiers[i];
    const pct = 10 + Math.round((i / total) * 85);
    onProgress(pct);

    const chResult = await createChantierElementaire(projetId, ocpId, {
      libelle: ch.libelle,
      dureePlanifieeMinutes: ch.dureeCreneaux * 30,
      ordreAffichage: i,
      estGroupe: false,
    });

    if (!chResult.success) {
      errors.push(`Chantier "${ch.libelle}" : ${chResult.error}`);
      continue;
    }

    // Build creneaux from active slots (merge consecutive active slots)
    const creneaux: { debut: Date; fin: Date; effectif: number; statut: string }[] =
      [];
    let slotStart: Date | null = null;

    for (let s = 0; s < ch.slots.length; s++) {
      if (ch.slots[s]) {
        if (!slotStart) {
          slotStart = sheet.timeSlots[s];
        }
      } else {
        if (slotStart) {
          // End of active block: fin = slot time (this is the first inactive)
          creneaux.push({
            debut: slotStart,
            fin: sheet.timeSlots[s],
            effectif: 1,
            statut: "planifie",
          });
          slotStart = null;
        }
      }
    }
    // Close trailing active block
    if (slotStart) {
      creneaux.push({
        debut: slotStart,
        fin: new Date(
          sheet.timeSlots[sheet.timeSlots.length - 1].getTime() + 30 * 60000
        ),
        effectif: 1,
        statut: "planifie",
      });
    }

    if (creneaux.length > 0) {
      const cResult = await updateCreneaux(
        projetId,
        chResult.data.id,
        creneaux
      );
      if (!cResult.success) {
        errors.push(
          `Creneaux "${ch.libelle}" : ${cResult.error}`
        );
      } else {
        nbCreneaux += creneaux.length;
      }
    }
  }

  onProgress(100);

  return {
    ocpId,
    ocpNom: sheet.sheetName,
    version: sheet.version,
    nbChantiers: sheet.chantiers.length,
    nbCreneaux,
    errors,
  };
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function PlanningExcelImport({
  projetId,
  nomProjet,
}: PlanningExcelImportProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reports, setReports] = useState<ImportReport[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setFile(null);
    setImporting(false);
    setProgress(0);
    setReports([]);
    setError(null);
  }, []);

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith(".xlsx")) {
      setError("Seuls les fichiers .xlsx sont acceptes.");
      return;
    }
    setFile(f);
    setError(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleImport = useCallback(async () => {
    if (!file) return;
    setImporting(true);
    setProgress(0);
    setError(null);

    try {
      const sheets = await parseExcelFile(file);

      if (sheets.length === 0) {
        setError(
          "Aucun onglet BASE ou VARIANTE detecte dans le fichier."
        );
        setImporting(false);
        return;
      }

      const allReports: ImportReport[] = [];

      for (const sheet of sheets) {
        const report = await importParsedSheet(projetId, sheet, (pct) => {
          setProgress(pct);
        });
        allReports.push(report);
      }

      setReports(allReports);
    } catch (err) {
      console.error("Import error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur inattendue lors de l'import."
      );
    } finally {
      setImporting(false);
    }
  }, [file, projetId]);

  const handleNavigate = useCallback(
    (ocpId: string) => {
      setOpen(false);
      router.push(`/projets/${projetId}/planning/${ocpId}`);
    },
    [router, projetId]
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          style={{
            backgroundColor: VINCI.grisLight,
            borderColor: VINCI.tableBorder,
            color: VINCI.noir,
          }}
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          Importer Excel
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle
            style={{ color: VINCI.bleu, fontWeight: 700, fontSize: 18 }}
          >
            Importer un planning minute
          </DialogTitle>
        </DialogHeader>

        {reports.length === 0 ? (
          <div className="space-y-4">
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => inputRef.current?.click()}
              className="cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors"
              style={{
                borderColor: dragOver ? VINCI.bleu : VINCI.tableBorder,
                backgroundColor: dragOver ? VINCI.bleuXLight : VINCI.blanc,
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx"
                onChange={handleInputChange}
                className="hidden"
              />
              <svg
                className="mx-auto mb-3 h-10 w-10"
                fill="none"
                stroke={dragOver ? VINCI.bleu : VINCI.gris}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm" style={{ color: VINCI.noir }}>
                {file ? (
                  <span className="font-semibold">{file.name}</span>
                ) : (
                  <>
                    Glissez un fichier <strong>.xlsx</strong> ici ou cliquez
                    pour parcourir
                  </>
                )}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                className="rounded-md p-3 text-sm"
                style={{
                  backgroundColor: VINCI.rougeXLight,
                  color: VINCI.rougeDark,
                }}
              >
                {error}
              </div>
            )}

            {/* Progress bar */}
            {importing && (
              <div className="space-y-1">
                <div
                  className="h-2 w-full overflow-hidden rounded-full"
                  style={{ backgroundColor: VINCI.grisLight }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: VINCI.bleu,
                    }}
                  />
                </div>
                <p
                  className="text-xs text-right"
                  style={{ color: VINCI.gris }}
                >
                  {progress}%
                </p>
              </div>
            )}

            {/* Import button */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                style={{
                  borderColor: VINCI.bleu,
                  color: VINCI.bleu,
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={handleImport}
                disabled={!file || importing}
                style={{
                  backgroundColor: VINCI.bleu,
                  color: VINCI.blanc,
                  opacity: !file || importing ? 0.5 : 1,
                }}
              >
                {importing ? "Import en cours..." : "Importer"}
              </Button>
            </div>
          </div>
        ) : (
          /* ── Report view ── */
          <div className="space-y-4">
            {reports.map((report, idx) => (
              <div
                key={idx}
                className="rounded-lg border p-4"
                style={{ borderColor: VINCI.tableBorder }}
              >
                <h3
                  className="mb-2 text-sm font-bold"
                  style={{ color: VINCI.bleu }}
                >
                  {report.ocpNom} ({report.version})
                </h3>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span style={{ color: VINCI.gris }}>Chantiers :</span>{" "}
                    <strong>{report.nbChantiers}</strong>
                  </div>
                  <div>
                    <span style={{ color: VINCI.gris }}>Creneaux :</span>{" "}
                    <strong>{report.nbCreneaux}</strong>
                  </div>
                </div>

                {report.errors.length > 0 && (
                  <div
                    className="mt-2 rounded-md p-2 text-xs"
                    style={{
                      backgroundColor: VINCI.rougeXLight,
                      color: VINCI.rougeDark,
                    }}
                  >
                    <p className="font-semibold mb-1">
                      {report.errors.length} erreur(s) :
                    </p>
                    <ul className="list-disc pl-4">
                      {report.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.ocpId && (
                  <Button
                    className="mt-3 w-full"
                    onClick={() => handleNavigate(report.ocpId)}
                    style={{
                      backgroundColor: VINCI.bleu,
                      color: VINCI.blanc,
                    }}
                  >
                    Voir le planning importe
                  </Button>
                )}
              </div>
            ))}

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                style={{
                  borderColor: VINCI.bleu,
                  color: VINCI.bleu,
                }}
              >
                Fermer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
