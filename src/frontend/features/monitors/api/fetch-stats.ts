export interface LocationStat {
  location: string;
  status: string;
  responseTime: number;
  lastCheckAt: number;
}

export interface MonitorStats {
  uptimePercentage: number;
  avgResponseTime: number;
  totalChecks: number;
  successfulChecks: number;
  lastCheckAt: number | null;
  locationStats: LocationStat[];
}

export default async function fetchStats(
  teamId: string,
  monitorId: string
): Promise<MonitorStats> {
  const response = await fetch(`/api/monitors/${teamId}/${monitorId}/stats`);

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}
