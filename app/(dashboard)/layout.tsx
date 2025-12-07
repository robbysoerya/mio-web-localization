"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Sidebar } from "@/components/Sidebar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { Globe } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ProjectProvider>
        <div className="flex min-h-screen flex-col md:flex-row">
          <Sidebar />
          
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl tracking-tight">MioLocales</span>
            </div>
            <MobileSidebar />
          </div>

          <main className="flex-1 p-4 md:p-6 bg-background overflow-x-hidden">{children}</main>
        </div>
      </ProjectProvider>
    </QueryClientProvider>
  );
}
