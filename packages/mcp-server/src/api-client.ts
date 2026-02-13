const UNSAFE_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);
const REQUEST_TIMEOUT_MS = 15_000;

function encodePathSegment(value: string | number): string {
  return encodeURIComponent(String(value));
}

export class UplightApiClient {
  private baseUrl: string;
  private sessionToken: string;
  private defaultTeamId: string | undefined;

  constructor(baseUrl: string, sessionToken: string, defaultTeamId?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.sessionToken = sessionToken;
    this.defaultTeamId = defaultTeamId;
  }

  getDefaultTeamId(): string | undefined {
    return this.defaultTeamId;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}/api${path}`;
    const headers: Record<string, string> = {
      Cookie: `better-auth.session_token=${this.sessionToken}`,
      Accept: "application/json",
    };

    // CSRF: Hono checks Origin on non-safe methods
    if (UNSAFE_METHODS.has(method)) {
      headers["Origin"] = this.baseUrl;
    }

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(
          `API ${method} ${path} timed out after ${REQUEST_TIMEOUT_MS}ms`,
        );
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let message: string;
      try {
        const json = JSON.parse(text);
        message = json.error ?? text;
      } catch {
        message = text || res.statusText;
      }
      throw new Error(`API ${method} ${path} failed (${res.status}): ${message}`);
    }

    return res.json() as Promise<T>;
  }

  // --- Monitors ---

  async listMonitors(teamId: string | number) {
    return this.request<unknown[]>(
      "GET",
      `/monitors/${encodePathSegment(teamId)}`,
    );
  }

  async getMonitor(teamId: string | number, monitorId: string | number) {
    return this.request<unknown>(
      "GET",
      `/monitors/${encodePathSegment(teamId)}/${encodePathSegment(monitorId)}`,
    );
  }

  async getMonitorStats(
    teamId: string | number,
    monitorId: string | number,
    days?: number,
  ) {
    const query = days ? `?days=${days}` : "";
    return this.request<unknown>(
      "GET",
      `/monitors/${encodePathSegment(teamId)}/${encodePathSegment(
        monitorId,
      )}/stats${query}`,
    );
  }

  async getMonitorChecks(
    teamId: string | number,
    monitorId: string | number,
    params?: {
      limit?: number;
      offset?: number;
      days?: number;
      result?: string;
      location?: string;
    },
  ) {
    const searchParams = new URLSearchParams();
    if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));
    if (params?.offset !== undefined) searchParams.set("offset", String(params.offset));
    if (params?.days !== undefined) searchParams.set("days", String(params.days));
    if (params?.result) searchParams.set("result", params.result);
    if (params?.location) searchParams.set("location", params.location);
    const query = searchParams.toString();
    return this.request<unknown>(
      "GET",
      `/monitors/${encodePathSegment(teamId)}/${encodePathSegment(
        monitorId,
      )}/checks${query ? `?${query}` : ""}`,
    );
  }

  // --- Incidents ---

  async listIncidents(
    teamId: string | number,
    params?: {
      limit?: number;
      offset?: number;
      monitorId?: string;
      heartbeatId?: string;
    },
  ) {
    const searchParams = new URLSearchParams();
    if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));
    if (params?.offset !== undefined) searchParams.set("offset", String(params.offset));
    if (params?.monitorId) searchParams.set("monitorId", params.monitorId);
    if (params?.heartbeatId) searchParams.set("heartbeatId", params.heartbeatId);
    const query = searchParams.toString();
    return this.request<unknown>(
      "GET",
      `/incidents/${encodePathSegment(teamId)}${query ? `?${query}` : ""}`,
    );
  }

  async getIncident(teamId: string | number, incidentId: string | number) {
    return this.request<unknown>(
      "GET",
      `/incidents/${encodePathSegment(teamId)}/${encodePathSegment(
        incidentId,
      )}`,
    );
  }

  async getIncidentActivities(
    teamId: string | number,
    incidentId: string | number,
  ) {
    return this.request<unknown>(
      "GET",
      `/incidents/${encodePathSegment(teamId)}/${encodePathSegment(
        incidentId,
      )}/activities`,
    );
  }

  async updateIncidentStatus(
    teamId: string | number,
    incidentId: string | number,
    status: string,
  ) {
    return this.request<unknown>(
      "PATCH",
      `/incidents/${encodePathSegment(teamId)}/${encodePathSegment(incidentId)}`,
      { status },
    );
  }

  async addIncidentComment(
    teamId: string | number,
    incidentId: string | number,
    content: string,
  ) {
    return this.request<unknown>(
      "POST",
      `/incidents/${encodePathSegment(teamId)}/${encodePathSegment(
        incidentId,
      )}/activities`,
      { content },
    );
  }

  // --- Heartbeats ---

  async listHeartbeats(teamId: string | number) {
    return this.request<unknown[]>(
      "GET",
      `/heartbeats/${encodePathSegment(teamId)}`,
    );
  }

  async getHeartbeat(teamId: string | number, heartbeatId: string | number) {
    return this.request<unknown>(
      "GET",
      `/heartbeats/${encodePathSegment(teamId)}/${encodePathSegment(
        heartbeatId,
      )}`,
    );
  }

  // --- Teams ---

  async listTeams() {
    return this.request<unknown[]>("GET", "/teams");
  }

  // --- Status Pages ---

  async listStatusPages(teamId: string | number) {
    return this.request<unknown[]>(
      "GET",
      `/status-pages/${encodePathSegment(teamId)}`,
    );
  }

  // --- Integrations ---

  async listIntegrations(teamId: string | number) {
    return this.request<unknown[]>(
      "GET",
      `/integrations/${encodePathSegment(teamId)}`,
    );
  }

  // --- Maintenance ---

  async listMaintenanceWindows(
    teamId: string | number,
    monitorId: string | number,
  ) {
    return this.request<unknown[]>(
      "GET",
      `/maintenance/${encodePathSegment(teamId)}/${encodePathSegment(
        monitorId,
      )}`,
    );
  }
}
