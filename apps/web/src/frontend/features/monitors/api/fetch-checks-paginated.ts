export interface CheckResult {
  id: number;
  location: string;
  result: string;
  responseTime: number;
  statusCode: number | null;
  errorMessage: string | null;
  checkedAt: number;
}

export interface ChecksResponse {
  checks: CheckResult[];
  hasMore: boolean;
  total: number;
}

export interface FetchChecksParams {
  teamId: string;
  monitorId: string;
  limit?: number;
  offset?: number;
  days?: number;
  result?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default async function fetchChecksPaginated({
  teamId,
  monitorId,
  limit = 50,
  offset = 0,
  days = 14,
  result,
  location,
  dateFrom,
  dateTo,
}: FetchChecksParams): Promise<ChecksResponse> {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  params.set("days", String(days));

  if (result) params.set("result", result);
  if (location) params.set("location", location);
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);

  const response = await fetch(
    `/api/monitors/${teamId}/${monitorId}/checks?${params.toString()}`,
  );

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }

  return response.json();
}
