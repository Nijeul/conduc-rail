"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Train,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  {
    label: "Projets",
    href: "/projets",
    icon: LayoutDashboard,
  },
  {
    label: "Personnel",
    href: "/personnel",
    icon: Users,
  },
  {
    label: "Materiel",
    href: "/materiel",
    icon: Train,
  },
];

interface SidebarProps {
  userName: string;
  userEmail: string;
}

export function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex flex-col h-screen fixed left-0 top-0 z-40"
           style={{ backgroundColor: '#004489' }}>
      {/* Logo */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <h1 className="text-lg font-bold tracking-tight text-white">CONDUC RAIL</h1>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.50)' }}>Gestion de chantiers</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "text-white"
                  : "hover:text-white"
              )}
              style={
                isActive
                  ? { borderLeft: '4px solid #E20025', backgroundColor: 'rgba(255,255,255,0.08)' }
                  : { borderLeft: '4px solid transparent', color: 'rgba(255,255,255,0.70)' }
              }
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = '#003370';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
        <Link
          href="/profil"
          className="block px-3 mb-3 rounded-md transition-colors py-1"
          style={{ color: 'rgba(255,255,255,0.80)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#003370'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <p className="text-sm font-medium truncate">{userName}</p>
          <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.50)' }}>{userEmail}</p>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors w-full"
          style={{ color: 'rgba(255,255,255,0.70)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#003370'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.70)'; }}
        >
          <LogOut className="h-4 w-4" />
          Deconnexion
        </button>
        <Link
          href="/politique-confidentialite"
          className="block px-3 mt-2 text-xs underline transition-colors"
          style={{ color: 'rgba(255,255,255,0.40)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.80)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.40)'; }}
        >
          Politique de confidentialite
        </Link>
      </div>
    </aside>
  );
}
