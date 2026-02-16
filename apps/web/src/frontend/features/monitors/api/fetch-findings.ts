export type FindingSeverity =
  | "healthy"
  | "watch"
  | "warning"
  | "critical"
  | "predicted";

export interface AnalystFinding {
  id: string;
  createdAt: number;
  severity: FindingSeverity;
  anomalies: Array<{
    type: string;
    description: string;
  }>;
  prediction: Record<string, unknown> | null;
  summary: string | null;
  notified: boolean;
}

export default async function fetchFindings(
  teamId: string,
  monitorId: string,
  limit: number = 30,
): Promise<AnalystFinding[]> {
  const response = await fetch(
    `/api/monitors/${teamId}/${monitorId}/findings?limit=${limit}`,
  );

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}
