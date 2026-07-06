"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { ongletsVisibles } from "@/lib/modules-projet";

interface ProjetNavProps {
  projetId: string;
  projetName: string;
  modulesMasques?: string[];
}

export function ProjetNav({ projetId, projetName, modulesMasques = [] }: ProjetNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const base = `/projets/${projetId}`;

  const onglets = ongletsVisibles(modulesMasques);

  // Determine active top-level tab (fallback: last visible tab, comme avant)
  const activeOnglet =
    onglets.find((o) =>
      o.modules.some((m) => pathname.startsWith(`${base}/${m.href}`))
    ) ?? onglets[onglets.length - 1];

  const handleOngletClick = (onglet: (typeof onglets)[number]) => {
    // Navigate to the first visible module of the clicked tab
    router.push(`${base}/${onglet.modules[0].href}`);
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
        {onglets.map((onglet) => {
          const isActive = onglet.id === activeOnglet?.id;
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
        {activeOnglet?.modules.map((item) => {
          const href = `${base}/${item.href}`;
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={item.key}
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
