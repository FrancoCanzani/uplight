import { useQuery } from "@tanstack/react-query";

interface LandingStats {
  checks: number;
  uptime: string;
  avgResponseTime: number;
  regions: number;
}

async function fetchLandingStats(): Promise<LandingStats> {
  const response = await fetch("/api/public/stats");
  if (!response.ok) throw new Error("Failed to fetch stats");
  return response.json();
}

export function useLandingStats() {
  return useQuery({
    queryKey: ["landing-stats"],
    queryFn: fetchLandingStats,
    staleTime: 5 * 60 * 1000,
  });
}
