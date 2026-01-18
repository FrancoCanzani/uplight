export type OverallStatus = "operational" | "degraded" | "outage";

export type PublicMonitor = {
  monitorId: number;
  name: string;
  status: string;
  groupId: number | null;
  displayOrder: number;
  uptime: number;
  lastCheck: {
    checkedAt: string;
    result: string;
    responseTime: number;
  } | null;
};

export type PublicGroup = {
  id: number;
  label: string;
  displayOrder: number;
  monitors: PublicMonitor[];
};

export type PublicStatusPage = {
  page: {
    name: string;
    slug: string;
    description: string | null;
    logoKey: string | null;
    showHistoricalUptime: boolean;
  };
  overallStatus: OverallStatus;
  stats: {
    total: number;
    operational: number;
    degraded: number;
    down: number;
  };
  groups: PublicGroup[];
  ungroupedMonitors: PublicMonitor[];
};
