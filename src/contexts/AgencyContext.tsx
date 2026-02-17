import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type AgencyMode = "shared" | "isolated";

export interface AgencyTheme {
  primary: string;
  accent?: string;
  chartStart?: string;
  chartEnd?: string;
  glow?: string;
}

export interface AgencyConfig {
  id: string;
  name: string;
  description?: string;
  mode: AgencyMode;
  theme: AgencyTheme;
}

interface AgencyContextType {
  agencies: AgencyConfig[];
  currentAgency: AgencyConfig;
  switchAgency: (id: string) => void;
  isIsolated: boolean;
}

const agencies: AgencyConfig[] = [
  {
    id: "corps",
    name: "CORPS LAB",
    description: "Ambiente isolado, paleta laranja CORPS",
    mode: "isolated",
    theme: {
      primary: "24 95% 55%", // laranja
      accent: "24 95% 55%",
      chartStart: "24 95% 55%",
      chartEnd: "24 90% 48%",
      glow: "24 95% 55% / 0.22",
    },
  },
];

const AgencyContext = createContext<AgencyContextType | undefined>(undefined);

const STORAGE_KEY = "crm_current_agency_corps";

function applyTheme(config: AgencyConfig) {
  const root = document.documentElement;
  root.dataset.agency = config.id;
  root.style.setProperty("--primary", config.theme.primary);
  if (config.theme.accent) root.style.setProperty("--accent", config.theme.accent);
  if (config.theme.chartStart) root.style.setProperty("--chart-primary", config.theme.chartStart);
  if (config.theme.chartStart) root.style.setProperty("--chart-gradient-start", config.theme.chartStart);
  if (config.theme.chartEnd) root.style.setProperty("--chart-gradient-end", config.theme.chartEnd);
  if (config.theme.glow) root.style.setProperty("--glow-primary", config.theme.glow);
}

export function AgencyProvider({ children }: { children: ReactNode }) {
  const [currentId, setCurrentId] = useState<string>(() => agencies[0].id);

  const currentAgency = useMemo(
    () => agencies.find((a) => a.id === currentId) || agencies[0],
    [currentId]
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currentAgency.id);
    applyTheme(currentAgency);
  }, [currentAgency]);

  const switchAgency = (id: string) => {
    if (agencies.some((a) => a.id === id)) {
      setCurrentId(id);
    }
  };

  return (
    <AgencyContext.Provider
      value={{
        agencies,
        currentAgency,
        switchAgency,
        isIsolated: currentAgency.mode === "isolated",
      }}
    >
      {children}
    </AgencyContext.Provider>
  );
}

export function useAgency() {
  const ctx = useContext(AgencyContext);
  if (!ctx) throw new Error("useAgency must be used within an AgencyProvider");
  return ctx;
}
