"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/features", label: "Features" },
    { href: "/translations", label: "Translations (All)" },
    { href: "/languages", label: "Languages" },
  ];

  return (
    <div className="w-64 border-r bg-muted/10 h-screen p-4 flex flex-col">
      <div className="font-bold text-xl mb-8 px-4">Localization</div>
      <nav className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-muted",
              pathname === link.href
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
