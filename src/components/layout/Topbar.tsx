"use client";

interface TopbarProps {
  title: string;
  children?: React.ReactNode;
}

export function Topbar({ title, children }: TopbarProps) {
  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-6 shrink-0">
      <h2 className="text-lg font-semibold text-text-main">{title}</h2>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </header>
  );
}
