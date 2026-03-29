import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate un nombre au format français (espace comme séparateur de milliers, virgule décimale)
 */
export function formatNombreFR(n: number, decimales = 2): string {
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

/**
 * Formate un montant en euros au format français
 */
export function formatMontant(n: number): string {
  return n.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Parse une heure au format HH:MM. Retourne null si invalide.
 */
export function parseHeure(input: string): string | null {
  const match = input.trim().match(/^(\d{1,2})[h:.](\d{2})$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Calcule la durée en minutes entre deux heures HH:MM.
 * Si posteNuit=true et fin < debut, on considère que fin est le lendemain.
 */
export function calcDureeMinutes(
  debut: string,
  fin: string,
  posteNuit: boolean
): number {
  const [dH, dM] = debut.split(":").map(Number);
  const [fH, fM] = fin.split(":").map(Number);
  let debutMin = dH * 60 + dM;
  let finMin = fH * 60 + fM;

  if (posteNuit && finMin <= debutMin) {
    finMin += 24 * 60;
  }

  return finMin - debutMin;
}

/**
 * Formate une durée en minutes en "Xh YYmin"
 */
export function formatDuree(minutes: number): string {
  const h = Math.floor(Math.abs(minutes) / 60);
  const m = Math.abs(minutes) % 60;
  const sign = minutes < 0 ? "-" : "";
  if (h === 0) return `${sign}${m}min`;
  if (m === 0) return `${sign}${h}h`;
  return `${sign}${h}h${m.toString().padStart(2, "0")}`;
}

/**
 * Formate une date au format français JJ/MM/AAAA
 */
export function formatDateFR(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
