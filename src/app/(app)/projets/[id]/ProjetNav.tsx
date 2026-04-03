"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

interface ProjetNavProps {
  projetId: string;
  projetName: string;
}

const ONGLETS = [
  {
    id: 'contractuelle',
    label: 'Gestion Contractuelle',
    routes: ['/infos', '/courriers', '/suivi/journal'],
    sousMenus: [
      { label: 'Infos', href: 'infos' },
      { label: 'Courriers', href: 'courriers' },
      { label: 'Journal', href: 'suivi/journal' },
    ],
  },
  {
    id: 'financiere',
    label: 'Gestion Financière',
    routes: ['/detail-estimatif', '/suivi/situation', '/suivi/arf'],
    sousMenus: [
      { label: 'Détail Estimatif', href: 'detail-estimatif' },
      { label: 'Situation', href: 'suivi/situation' },
      { label: 'Suivi ARF', href: 'suivi/arf' },
    ],
  },
  {
    id: 'chantier',
    label: 'Gestion de Chantier',
    routes: ['/tableau-service', '/suivi/rapports', '/composition', '/suivi/sa', '/suivi/recapitulatif'],
    sousMenus: [
      { label: 'Tableau de Service', href: 'tableau-service' },
      { label: 'Rapports', href: 'suivi/rapports' },
      { label: 'Composition TTx', href: 'composition' },
      { label: 'SA', href: 'suivi/sa' },
      { label: 'Récapitulatif', href: 'suivi/recapitulatif' },
    ],
  },
];

export function ProjetNav({ projetId, projetName }: ProjetNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const base = `/projets/${projetId}`;

  // Determine active top-level tab
  const activeOnglet = ONGLETS.find((o) =>
    o.routes.some((r) => pathname.startsWith(`${base}${r}`))
  ) ?? ONGLETS[2]; // Default to "Gestion de Chantier"

  const handleOngletClick = (onglet: typeof ONGLETS[number]) => {
    // Navigate to the first sub-menu of the clicked tab
    router.push(`${base}/${onglet.sousMenus[0].href}`);
  };

  return (
    <div className="bg-white border-b border-border shrink-0">
      {/* Top bar: breadcrumb */}
      <div className="flex items-center justify-between px-6 h-12">
        <div className="flex items-center gap-3">
          <Link
            href="/projets"
            className="text-text-secondary hover:text-text-main transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/projets"
              className="text-text-secondary hover:text-[#004489] transition-colors"
            >
              Projets
            </Link>
            <span className="text-text-secondary">/</span>
            <span className="font-medium text-text-main">{projetName}</span>
          </div>
        </div>
      </div>

      {/* N1: Main tabs */}
      <div className="flex items-center gap-0 px-6 border-b" style={{ borderColor: '#DCDCDC' }}>
        {ONGLETS.map((onglet) => {
          const isActive = onglet.id === activeOnglet.id;
          return (
            <button
              key={onglet.id}
              onClick={() => handleOngletClick(onglet)}
              className={cn(
                "px-5 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                isActive
                  ? "border-[#004489] text-[#004489]"
                  : "border-transparent text-[#5A5A5A] hover:text-[#004489]"
              )}
              style={isActive ? { backgroundColor: '#E5EFF8' } : undefined}
            >
              {onglet.label}
            </button>
          );
        })}
      </div>

      {/* N2: Sub-menu of active tab */}
      <div className="flex items-center gap-1 px-6" style={{ backgroundColor: '#F0F0F0' }}>
        {activeOnglet.sousMenus.map((item) => {
          const href = `${base}/${item.href}`;
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "px-4 py-2 text-sm border-b-2 transition-colors",
                isActive
                  ? "border-[#E20025] text-[#004489] font-bold"
                  : "border-transparent text-[#5A5A5A] hover:text-[#004489]"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
