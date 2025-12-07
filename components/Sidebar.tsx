"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Layers, Globe, Languages, Settings, Sun, Moon, Zap, FolderKanban } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { ProjectSelector } from "@/components/ProjectSelector";
import { useProject } from "@/contexts/ProjectContext";

export function SidebarContent() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { selectedProjectId } = useProject();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, requiresProject: false },
    { href: "/projects", label: "Projects", icon: FolderKanban, requiresProject: false },
    { href: "/features", label: "Features", icon: Layers, requiresProject: true },
    { href: "/translations", label: "Translations", icon: Globe, requiresProject: true },
    { href: "/languages", label: "Languages", icon: Languages, requiresProject: true },
    { href: "/focus", label: "Focus Mode", icon: Zap, requiresProject: true },
  ];

  // Filter links based on whether a specific project is selected
  const visibleLinks = links.filter(link => !link.requiresProject || selectedProjectId);

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Globe className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">MioLocales</span>
        </div>
        
        {/* Project Selector */}
        <div className="mb-6">
          <ProjectSelector />
        </div>
        
        <nav className="space-y-1.5">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t bg-muted/10">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-muted border flex items-center justify-center">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Settings</span>
              <span className="text-xs text-muted-foreground">Manage preferences</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9 rounded-full"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <div className="hidden md:flex w-72 border-r bg-card h-screen flex-col sticky top-0">
      <SidebarContent />
    </div>
  );
}
