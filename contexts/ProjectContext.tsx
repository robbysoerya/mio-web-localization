"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ProjectContextType {
  selectedProjectId: string | undefined;
  setSelectedProjectId: (projectId: string | undefined) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const PROJECT_STORAGE_KEY = "mio-selected-project-id";

// Helper to get initial value from localStorage
function getInitialProjectId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const stored = localStorage.getItem(PROJECT_STORAGE_KEY);
  return stored && stored !== "null" ? stored : undefined;
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  // Use lazy initialization to read from localStorage only once
  const [selectedProjectId, setSelectedProjectIdState] = useState<string | undefined>(
    getInitialProjectId
  );

  // Save to localStorage when changed
  const setSelectedProjectId = (projectId: string | undefined) => {
    setSelectedProjectIdState(projectId);
    if (projectId) {
      localStorage.setItem(PROJECT_STORAGE_KEY, projectId);
    } else {
      localStorage.removeItem(PROJECT_STORAGE_KEY);
    }
  };

  return (
    <ProjectContext.Provider value={{ selectedProjectId, setSelectedProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
