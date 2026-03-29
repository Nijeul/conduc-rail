"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { DEButton } from "@/components/layout";
import { useState, useRef, useEffect } from "react";

interface ProjetNavProps {
  projetId: string;
  projetName: string;
}

const suiviSubItems = [
  { label: "Rapports", href: "suivi/rapports" },
  { label: "Situation", href: "suivi/situation" },
  { label: "ARF", href: "suivi/arf" },
  { label: "Journal", href: "suivi/journal" },
  { label: "SA", href: "suivi/sa" },
];

export function ProjetNav({ projetId, projetName }: ProjetNavProps) {
  const pathname = usePathname();
  const base = `/projets/${projetId}`;
  const [suiviOpen, setSuiviOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isInfosActive = pathname.includes(`${base}/infos`);
  const isSuiviActive = pathname.includes(`${base}/suivi`);
  const isTableauActive = pathname.includes(`${base}/tableau-service`);
  const isCompositionActive = pathname.includes(`${base}/composition`);
  const isCourriersActive = pathname.includes(`${base}/courriers`);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setSuiviOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="bg-white border-b border-border shrink-0">
      {/* Top bar: breadcrumb + DE button */}
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
              className="text-text-secondary hover:text-primary transition-colors"
            >
              Projets
            </Link>
            <span className="text-text-secondary">/</span>
            <span className="font-medium text-text-main">{projetName}</span>
          </div>
        </div>
        <DEButton projetId={projetId} projetName={projetName} />
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-1 px-6">
        {/* Infos */}
        <Link
          href={`${base}/infos`}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            isInfosActive
              ? "border-action text-action"
              : "border-transparent text-text-secondary hover:text-text-main hover:border-gray-300"
          )}
        >
          Infos
        </Link>

        {/* Tableau de Service */}
        <Link
          href={`${base}/tableau-service`}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            isTableauActive
              ? "border-action text-action"
              : "border-transparent text-text-secondary hover:text-text-main hover:border-gray-300"
          )}
        >
          Tableau de Service
        </Link>

        {/* Suivi dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setSuiviOpen(!suiviOpen)}
            className={cn(
              "flex items-center gap-1 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
              isSuiviActive
                ? "border-action text-action"
                : "border-transparent text-text-secondary hover:text-text-main hover:border-gray-300"
            )}
          >
            Suivi
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {suiviOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-md shadow-lg py-1 z-30 min-w-[160px]">
              {suiviSubItems.map((item) => {
                const href = `${base}/${item.href}`;
                const isActive = pathname === href;
                return (
                  <Link
                    key={item.href}
                    href={href}
                    onClick={() => setSuiviOpen(false)}
                    className={cn(
                      "block px-4 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-surface-light text-action font-medium"
                        : "text-text-main hover:bg-surface-light"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Composition TTx */}
        <Link
          href={`${base}/composition`}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            isCompositionActive
              ? "border-action text-action"
              : "border-transparent text-text-secondary hover:text-text-main hover:border-gray-300"
          )}
        >
          Composition TTx
        </Link>

        {/* Courriers */}
        <Link
          href={`${base}/courriers`}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            isCourriersActive
              ? "border-action text-action"
              : "border-transparent text-text-secondary hover:text-text-main hover:border-gray-300"
          )}
        >
          Courriers
        </Link>
      </div>
    </div>
  );
}
