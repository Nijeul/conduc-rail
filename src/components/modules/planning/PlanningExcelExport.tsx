"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { VINCI } from "@/lib/design-tokens";
import { formatDateFR } from "@/lib/utils";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface Creneau {
  id: string;
  debut: Date | string;
  fin: Date | string;
  effectif: number;
  statut: string;
}

interface ChantierElementaire {
  id: string;
  libelle: string;
  categorie: string | null;
  couleur?: string | null;
  dureePlanifieeMinutes: number;
  ordreAffichage: number;
  estGroupe: boolean;
  creneaux: Creneau[];
}

interface OCP {
  id: string;
  nom: string;
  dateDebut: Date | string;
  dateFin: Date | string;
  version: string;
  dfvTotalMinutes: number;
  chantiersElementaires: ChantierElementaire[];
}

interface PersonnelLink {
  id: string;
  debut: Date | string;
  fin: Date | string;
  tableauService: {
    id: string;
    titre: string;
    entreprise: string | null;
    semaine: number;
    annee: number;
    colonnes: any; // JSON
    lignes: any;   // JSON
    cellules: any; // JSON
  };
}

interface TractionLink {
  id: string;
  heureArrivee: Date | string;
  heureDepart: Date | string;
  label: string | null;
  composition: {
    id: string;
    titre: string | null;
    sens: string;
    vehicules: any; // JSON
  };
}

interface PlanningExcelExportProps {
  ocp: OCP;
  nomProjet: string;
  personnelLinks?: PersonnelLink[];
  tractionLinks?: TractionLink[];
}

// ──────────────────────────────────────────────
// Couleurs catégories (palette secondaire VINCI)
// ──────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  voie: "#7AA536",
  caténaire: "#307BFF",
  signalisation: "#F2AB1B",
  telecom: "#80B4FF",
  energie: "#C26A32",
  genie_civil: "#A152E5",
  soudure: "#F25799",
  default: "#B5ABA1",
};

function getCategoryColor(categorie: string | null): string {
  if (!categorie) return CATEGORY_COLORS.default;
  const key = categorie.toLowerCase().replace(/[éè]/g, "e").replace(/\s+/g, "_");
  return CATEGORY_COLORS[key] ?? CATEGORY_COLORS.default;
}

// ──────────────────────────────────────────────
// Helper : time slot generation (30-min intervals)
// ──────────────────────────────────────────────

interface TimeSlot {
  date: Date;
  label: string; // "10h00", "10h30"
  dayLabel: string; // "Lun 01/04"
}

function generateTimeSlots(dateDebut: Date, dateFin: Date): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const current = new Date(dateDebut);
  current.setMinutes(0, 0, 0);

  const end = new Date(dateFin);

  while (current <= end) {
    const hh = current.getHours().toString().padStart(2, "0");
    const mm = current.getMinutes().toString().padStart(2, "0");
    const joursSemaine = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const dayLabel = `${joursSemaine[current.getDay()]} ${formatDateFR(current)}`;

    slots.push({
      date: new Date(current),
      label: `${hh}h${mm}`,
      dayLabel,
    });

    current.setMinutes(current.getMinutes() + 30);
  }

  return slots;
}

function isCreneauActive(creneau: Creneau, slotStart: Date): boolean {
  const debut = new Date(creneau.debut);
  const fin = new Date(creneau.fin);
  const slotEnd = new Date(slotStart.getTime() + 30 * 60000);
  return (
    debut < slotEnd &&
    fin > slotStart &&
    (creneau.statut === "planifie" || creneau.statut === "realise")
  );
}

// ──────────────────────────────────────────────
// Export function
// ──────────────────────────────────────────────

export async function generateExcel(
  ocp: OCP,
  nomProjet: string,
  personnelLinks: PersonnelLink[] = [],
  tractionLinks: TractionLink[] = [],
): Promise<void> {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();

  const sheetName =
    ocp.version === "VARIANTE" ? "OCP VARIANTE" : "OCP BASE";
  const worksheet = workbook.addWorksheet(sheetName);

  const dateDebut = new Date(ocp.dateDebut);
  const dateFin = new Date(ocp.dateFin);
  const slots = generateTimeSlots(dateDebut, dateFin);

  const totalCols = 2 + slots.length; // A=libellé, B=durée, C+= créneaux

  // ── Ligne 1 : Titre ──
  const row1 = worksheet.getRow(1);
  worksheet.mergeCells(1, 1, 1, totalCols);
  const titleCell = row1.getCell(1);
  titleCell.value = `${ocp.nom} — ${formatDateFR(dateDebut)} au ${formatDateFR(dateFin)}`;
  titleCell.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF004489" },
  };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  row1.height = 28;

  // ── Ligne 2 : DFV ──
  const row2 = worksheet.getRow(2);
  worksheet.mergeCells(2, 1, 2, totalCols);
  const dfvH = Math.floor(ocp.dfvTotalMinutes / 60);
  const dfvM = ocp.dfvTotalMinutes % 60;
  const dfvCell = row2.getCell(1);
  dfvCell.value = `DFV calculée : ${dfvH}h${dfvM.toString().padStart(2, "0")}`;
  dfvCell.font = { bold: true, size: 11, color: { argb: "FF004489" } };
  dfvCell.alignment = { horizontal: "left", vertical: "middle" };

  // ── Ligne 3 : vide ──
  // (already empty)

  // ── Ligne 4 : en-têtes temporels ──
  const headerRow = worksheet.getRow(4);

  // Colonne A header
  const cellA = headerRow.getCell(1);
  cellA.value = "Chantier élémentaire";
  cellA.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
  cellA.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF004489" },
  };
  cellA.alignment = { horizontal: "center", vertical: "middle" };

  // Colonne B header
  const cellB = headerRow.getCell(2);
  cellB.value = "Durée";
  cellB.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
  cellB.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF004489" },
  };
  cellB.alignment = { horizontal: "center", vertical: "middle" };

  // Day merge tracking for row 4
  let currentDay = "";
  let dayStartCol = 3;

  // We need a sub-header row for hours
  const subHeaderRow = worksheet.getRow(5);

  // First apply day headers and hour sub-headers
  const dayMerges: { start: number; end: number; label: string }[] = [];

  for (let i = 0; i < slots.length; i++) {
    const col = i + 3;
    const slot = slots[i];

    if (slot.dayLabel !== currentDay) {
      if (currentDay !== "") {
        dayMerges.push({ start: dayStartCol, end: col - 1, label: currentDay });
      }
      currentDay = slot.dayLabel;
      dayStartCol = col;
    }

    // Hour sub-header (row 5)
    const hourCell = subHeaderRow.getCell(col);
    hourCell.value = slot.label;
    hourCell.font = { bold: true, size: 8, color: { argb: "FFFFFFFF" } };
    hourCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF003370" },
    };
    hourCell.alignment = {
      horizontal: "center",
      vertical: "middle",
      textRotation: 90,
    };
  }
  // Last day group
  if (currentDay !== "") {
    dayMerges.push({
      start: dayStartCol,
      end: 2 + slots.length,
      label: currentDay,
    });
  }

  // Apply day merges on row 4
  for (const merge of dayMerges) {
    if (merge.start <= merge.end) {
      if (merge.start < merge.end) {
        worksheet.mergeCells(4, merge.start, 4, merge.end);
      }
      const dayCell = headerRow.getCell(merge.start);
      dayCell.value = merge.label;
      dayCell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
      dayCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF004489" },
      };
      dayCell.alignment = { horizontal: "center", vertical: "middle" };
    }
  }

  // Sub-header row 5 : col A and B
  const subA = subHeaderRow.getCell(1);
  subA.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF003370" },
  };
  const subB = subHeaderRow.getCell(2);
  subB.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF003370" },
  };

  headerRow.height = 22;
  subHeaderRow.height = 40;

  // ── Lignes 6+ : chantiers élémentaires ──
  const sortedChantiers = [...ocp.chantiersElementaires].sort(
    (a, b) => a.ordreAffichage - b.ordreAffichage
  );

  let rowIndex = 6;
  for (const chantier of sortedChantiers) {
    const row = worksheet.getRow(rowIndex);
    const isGroup = chantier.estGroupe;

    // Colonne A : libellé
    const libCell = row.getCell(1);
    libCell.value = chantier.libelle;
    libCell.font = {
      bold: isGroup,
      size: isGroup ? 11 : 10,
      color: { argb: "FF000000" },
    };
    if (isGroup) {
      libCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF0F0F0" },
      };
    }

    // Colonne B : durée en créneaux (30 min chacun)
    const nbCreneaux = Math.ceil(chantier.dureePlanifieeMinutes / 30);
    const durCell = row.getCell(2);
    durCell.value = nbCreneaux;
    durCell.alignment = { horizontal: "center" };
    if (isGroup) {
      durCell.font = { bold: true };
      durCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF0F0F0" },
      };
    }

    // Colonnes C+ : 1 si actif
    const rowColor = chantier.couleur ?? "#004489";
    const argbColor =
      "FF" + rowColor.replace("#", "");

    for (let i = 0; i < slots.length; i++) {
      const col = i + 3;
      const cell = row.getCell(col);
      const active = chantier.creneaux.some((c) =>
        isCreneauActive(c, slots[i].date)
      );

      if (active) {
        cell.value = 1;
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: argbColor },
        };
        cell.font = { size: 8, color: { argb: "FFFFFFFF" } };
      }

      cell.alignment = { horizontal: "center" };
    }

    // Group row styling
    if (isGroup) {
      for (let c = 3; c <= totalCols; c++) {
        const gc = row.getCell(c);
        if (!gc.value) {
          gc.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF0F0F0" },
          };
        }
      }
    }

    rowIndex++;
  }

  // ── Mise en forme globale ──

  // Largeur colonnes
  worksheet.getColumn(1).width = 32;
  worksheet.getColumn(2).width = 8;
  for (let c = 3; c <= totalCols; c++) {
    worksheet.getColumn(c).width = 4;
  }

  // Bordures fines sur toutes les cellules de données
  for (let r = 4; r < rowIndex; r++) {
    const row = worksheet.getRow(r);
    for (let c = 1; c <= totalCols; c++) {
      const cell = row.getCell(c);
      cell.border = {
        top: { style: "thin", color: { argb: "FFDCDCDC" } },
        left: { style: "thin", color: { argb: "FFDCDCDC" } },
        bottom: { style: "thin", color: { argb: "FFDCDCDC" } },
        right: { style: "thin", color: { argb: "FFDCDCDC" } },
      };
    }
  }

  // ── Onglets Personnel (Tableaux de Service) ──
  for (const link of personnelLinks) {
    const ts = link.tableauService;
    const colonnes = Array.isArray(ts.colonnes) ? ts.colonnes : [];
    const lignes = Array.isArray(ts.lignes) ? ts.lignes : [];
    if (colonnes.length === 0 && lignes.length === 0) continue;

    const sheetTitle = `TS Semaine ${String(ts.semaine).padStart(2, "0")}`;
    // Excel sheet names max 31 chars, no special chars
    const safeName = sheetTitle.substring(0, 31);
    const tsSheet = workbook.addWorksheet(safeName);

    // Ligne 1 : Titre
    const totalTsCols = 1 + colonnes.length; // col A = Poste, col B+ = colonnes activités
    const tsRow1 = tsSheet.getRow(1);
    if (totalTsCols > 1) {
      tsSheet.mergeCells(1, 1, 1, totalTsCols);
    }
    const tsTitleCell = tsRow1.getCell(1);
    tsTitleCell.value = ts.titre;
    tsTitleCell.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
    tsTitleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF004489" },
    };
    tsTitleCell.alignment = { horizontal: "center", vertical: "middle" };
    tsRow1.height = 28;

    // Ligne 2 : Entreprise, Semaine, Année
    const tsRow2 = tsSheet.getRow(2);
    if (totalTsCols > 1) {
      tsSheet.mergeCells(2, 1, 2, totalTsCols);
    }
    const tsInfoCell = tsRow2.getCell(1);
    tsInfoCell.value = `${ts.entreprise ?? "—"} | Semaine ${ts.semaine} | ${ts.annee}`;
    tsInfoCell.font = { size: 11, color: { argb: "FF004489" } };
    tsInfoCell.alignment = { horizontal: "left", vertical: "middle" };

    // Ligne 3 : vide

    // Ligne 4 : en-têtes colonnes
    const tsHeaderRow = tsSheet.getRow(4);
    const posteHeaderCell = tsHeaderRow.getCell(1);
    posteHeaderCell.value = "Poste";
    posteHeaderCell.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
    posteHeaderCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF004489" },
    };
    posteHeaderCell.alignment = { horizontal: "center", vertical: "middle" };

    for (let ci = 0; ci < colonnes.length; ci++) {
      const col = colonnes[ci];
      const colCell = tsHeaderRow.getCell(ci + 2);
      colCell.value = col.titre ?? col.label ?? `Col ${ci + 1}`;
      colCell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
      const colColor = col.couleur
        ? "FF" + String(col.couleur).replace("#", "")
        : "FF004489";
      colCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colColor },
      };
      colCell.alignment = { horizontal: "center", vertical: "middle" };
    }
    tsHeaderRow.height = 24;

    // Ligne 5+ : données lignes
    const cellules = Array.isArray(ts.cellules) ? ts.cellules : [];
    // Index cellules par ligneId+colonneId
    const celluleMap = new Map<string, any>();
    for (const c of cellules) {
      if (c.ligneId && c.colonneId) {
        celluleMap.set(`${c.ligneId}_${c.colonneId}`, c);
      }
    }

    let tsRowIdx = 5;
    for (const ligne of lignes) {
      const row = tsSheet.getRow(tsRowIdx);

      // Colonne A : libellé du poste avec couleur du type
      const posteCell = row.getCell(1);
      posteCell.value = ligne.libelle ?? ligne.titre ?? "—";
      const ligneBg = ligne.bgColor ?? ligne.couleurFond ?? null;
      const ligneFg = ligne.fgColor ?? ligne.couleurTexte ?? null;
      if (ligneBg) {
        posteCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF" + String(ligneBg).replace("#", "") },
        };
      }
      posteCell.font = {
        bold: true,
        size: 10,
        color: { argb: ligneFg ? "FF" + String(ligneFg).replace("#", "") : "FF000000" },
      };

      // Colonnes B+ : cellules (nom personnel + téléphone)
      for (let ci = 0; ci < colonnes.length; ci++) {
        const colDef = colonnes[ci];
        const cellKey = `${ligne.id}_${colDef.id}`;
        const cellData = celluleMap.get(cellKey);
        const dataCell = row.getCell(ci + 2);

        if (cellData) {
          const parts: string[] = [];
          if (cellData.nom || cellData.prenom) {
            parts.push([cellData.prenom, cellData.nom].filter(Boolean).join(" "));
          }
          if (cellData.valeur) parts.push(String(cellData.valeur));
          if (cellData.telephone) parts.push(cellData.telephone);
          dataCell.value = parts.join("\n");
          dataCell.alignment = { wrapText: true, vertical: "top" };
        }

        dataCell.border = {
          top: { style: "thin", color: { argb: "FFDCDCDC" } },
          left: { style: "thin", color: { argb: "FFDCDCDC" } },
          bottom: { style: "thin", color: { argb: "FFDCDCDC" } },
          right: { style: "thin", color: { argb: "FFDCDCDC" } },
        };
      }

      // Border on poste cell too
      posteCell.border = {
        top: { style: "thin", color: { argb: "FFDCDCDC" } },
        left: { style: "thin", color: { argb: "FFDCDCDC" } },
        bottom: { style: "thin", color: { argb: "FFDCDCDC" } },
        right: { style: "thin", color: { argb: "FFDCDCDC" } },
      };

      tsRowIdx++;
    }

    // Largeur colonnes
    tsSheet.getColumn(1).width = 28;
    for (let ci = 0; ci < colonnes.length; ci++) {
      tsSheet.getColumn(ci + 2).width = 22;
    }
  }

  // ── Onglet Traction (Compositions) ──
  if (tractionLinks.length > 0) {
    const tractionSheet = workbook.addWorksheet("Traction");
    const trCols = 6; // Type | Désignation | Nombre | P.Entrant | P.Sortant | Longueur
    let trRowIdx = 1;

    for (const link of tractionLinks) {
      const comp = link.composition;
      const vehicules = Array.isArray(comp.vehicules) ? comp.vehicules : [];

      // Ligne titre : label + arrivée → départ
      const titleRow = tractionSheet.getRow(trRowIdx);
      tractionSheet.mergeCells(trRowIdx, 1, trRowIdx, trCols);
      const arrStr = link.heureArrivee
        ? new Date(link.heureArrivee).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        : "—";
      const depStr = link.heureDepart
        ? new Date(link.heureDepart).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        : "—";
      const trTitleCell = titleRow.getCell(1);
      trTitleCell.value = `${link.label ?? comp.titre ?? "Composition"} — ${arrStr} → ${depStr}`;
      trTitleCell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
      trTitleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF8F00" },
      };
      trTitleCell.alignment = { horizontal: "left", vertical: "middle" };
      titleRow.height = 26;
      trRowIdx++;

      // Sous-titre : sens
      const sensRow = tractionSheet.getRow(trRowIdx);
      tractionSheet.mergeCells(trRowIdx, 1, trRowIdx, trCols);
      const sensCell = sensRow.getCell(1);
      sensCell.value = `Sens : ${comp.sens}`;
      sensCell.font = { italic: true, size: 10, color: { argb: "FF5A5A5A" } };
      trRowIdx++;

      // En-têtes véhicules
      const vehHeaders = ["Type", "Désignation", "Nombre", "P.Entrant", "P.Sortant", "Longueur"];
      const vehHeaderRow = tractionSheet.getRow(trRowIdx);
      for (let hi = 0; hi < vehHeaders.length; hi++) {
        const hCell = vehHeaderRow.getCell(hi + 1);
        hCell.value = vehHeaders[hi];
        hCell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
        hCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF004489" },
        };
        hCell.alignment = { horizontal: "center", vertical: "middle" };
      }
      trRowIdx++;

      // Données véhicules
      for (const v of vehicules) {
        const vRow = tractionSheet.getRow(trRowIdx);
        vRow.getCell(1).value = v.type ?? v.typeEngin ?? "—";
        vRow.getCell(2).value = v.designation ?? v.nom ?? "—";
        vRow.getCell(3).value = v.nombre ?? v.quantite ?? 1;
        vRow.getCell(3).alignment = { horizontal: "center" };
        vRow.getCell(4).value = v.pkEntrant ?? v.pEntrant ?? "—";
        vRow.getCell(5).value = v.pkSortant ?? v.pSortant ?? "—";
        vRow.getCell(6).value = v.longueur ?? "—";

        // Bordures
        for (let ci = 1; ci <= trCols; ci++) {
          vRow.getCell(ci).border = {
            top: { style: "thin", color: { argb: "FFDCDCDC" } },
            left: { style: "thin", color: { argb: "FFDCDCDC" } },
            bottom: { style: "thin", color: { argb: "FFDCDCDC" } },
            right: { style: "thin", color: { argb: "FFDCDCDC" } },
          };
        }

        trRowIdx++;
      }

      // Ligne vide de séparation
      trRowIdx++;
    }

    // Largeur colonnes traction
    tractionSheet.getColumn(1).width = 20;
    tractionSheet.getColumn(2).width = 24;
    tractionSheet.getColumn(3).width = 10;
    tractionSheet.getColumn(4).width = 14;
    tractionSheet.getColumn(5).width = 14;
    tractionSheet.getColumn(6).width = 12;
  }

  // ── Téléchargement ──
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeNomProjet = nomProjet.replace(/[^a-zA-Z0-9àâéèêëîïôùûüçÀÂÉÈÊËÎÏÔÙÛÜÇ _-]/g, "").replace(/\s+/g, "_");
  const safeNomOCP = ocp.nom.replace(/[^a-zA-Z0-9àâéèêëîïôùûüçÀÂÉÈÊËÎÏÔÙÛÜÇ _-]/g, "").replace(/\s+/g, "_");
  a.href = url;
  a.download = `Planning_Minute_${safeNomProjet}_${safeNomOCP}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function PlanningExcelExport({
  ocp,
  nomProjet,
  personnelLinks = [],
  tractionLinks = [],
}: PlanningExcelExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await generateExcel(ocp, nomProjet, personnelLinks, tractionLinks);
    } catch (err) {
      console.error("Export Excel error:", err);
    } finally {
      setIsExporting(false);
    }
  }, [ocp, nomProjet, personnelLinks, tractionLinks, isExporting]);

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
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
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      {isExporting ? "Export en cours..." : "Exporter Excel"}
    </Button>
  );
}
