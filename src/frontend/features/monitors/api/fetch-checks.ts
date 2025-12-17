export interface CheckResult {
  id: number;
  location: string;
  result: string;
  responseTime: number;
  statusCode: number | null;
  errorMessage: string | null;
  checkedAt: number;
}

export default async function fetchChecks(
  teamId: string,
  monitorId: string,
  hours: number = 24
): Promise<CheckResult[]> {
  const response = await fetch(
    `/api/monitors/${teamId}/${monitorId}/checks?hours=${hours}`
  );

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}
