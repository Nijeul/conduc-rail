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
    <aside className="w-60 bg-surface-dark text-white flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/10">
        <h1 className="text-lg font-bold tracking-tight">Conduc Rail</h1>
        <p className="text-xs text-blue-200/60 mt-0.5">Gestion de chantiers</p>
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
                  ? "bg-primary-light text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <Link
          href="/profil"
          className="block px-3 mb-3 rounded-md hover:bg-white/10 transition-colors py-1"
        >
          <p className="text-sm font-medium truncate">{userName}</p>
          <p className="text-xs text-gray-400 truncate">{userEmail}</p>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-300
                     hover:bg-white/10 hover:text-white transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Deconnexion
        </button>
      </div>
    </aside>
  );
}
