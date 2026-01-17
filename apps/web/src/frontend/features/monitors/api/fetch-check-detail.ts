export interface CheckDetail {
  id: number;
  monitorId: number;
  location: string;
  result: string;
  responseTime: number;
  statusCode: number | null;
  errorMessage: string | null;
  responseHeaders: Record<string, string> | null;
  responseBody: string | null;
  retryCount: number;
  checkedAt: number;
}

export async function fetchCheckDetail(
  teamId: string,
  monitorId: string,
  checkId: string,
): Promise<CheckDetail> {
  const response = await fetch(
    `/api/monitors/${teamId}/${monitorId}/checks/${checkId}`,
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      errorData.error || `Failed to fetch check: ${response.statusText}`,
    );
  }

  return response.json();
}
