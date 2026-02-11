const UNSAFE_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

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

    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

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

  async listMonitors(teamId: string) {
    return this.request<unknown[]>("GET", `/monitors/${teamId}`);
  }

  async getMonitor(teamId: string, monitorId: string) {
    return this.request<unknown>("GET", `/monitors/${teamId}/${monitorId}`);
  }

  async getMonitorStats(
    teamId: string,
    monitorId: string,
    days?: number,
  ) {
    const query = days ? `?days=${days}` : "";
    return this.request<unknown>(
      "GET",
      `/monitors/${teamId}/${monitorId}/stats${query}`,
    );
  }

  async getMonitorChecks(
    teamId: string,
    monitorId: string,
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
      `/monitors/${teamId}/${monitorId}/checks${query ? `?${query}` : ""}`,
    );
  }

  // --- Incidents ---

  async listIncidents(
    teamId: string,
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
      `/incidents/${teamId}${query ? `?${query}` : ""}`,
    );
  }

  async getIncident(teamId: string, incidentId: string) {
    return this.request<unknown>("GET", `/incidents/${teamId}/${incidentId}`);
  }

  async getIncidentActivities(teamId: string, incidentId: string) {
    return this.request<unknown>(
      "GET",
      `/incidents/${teamId}/${incidentId}/activities`,
    );
  }

  async updateIncidentStatus(
    teamId: string,
    incidentId: string,
    status: string,
  ) {
    return this.request<unknown>(
      "PATCH",
      `/incidents/${teamId}/${incidentId}`,
      { status },
    );
  }

  async addIncidentComment(
    teamId: string,
    incidentId: string,
    content: string,
  ) {
    return this.request<unknown>(
      "POST",
      `/incidents/${teamId}/${incidentId}/activities`,
      { content },
    );
  }

  // --- Heartbeats ---

  async listHeartbeats(teamId: string) {
    return this.request<unknown[]>("GET", `/heartbeats/${teamId}`);
  }

  async getHeartbeat(teamId: string, heartbeatId: string) {
    return this.request<unknown>("GET", `/heartbeats/${teamId}/${heartbeatId}`);
  }

  // --- Teams ---

  async listTeams() {
    return this.request<unknown[]>("GET", "/teams");
  }

  // --- Status Pages ---

  async listStatusPages(teamId: string) {
    return this.request<unknown[]>("GET", `/status-pages/${teamId}`);
  }

  // --- Integrations ---

  async listIntegrations(teamId: string) {
    return this.request<unknown[]>("GET", `/integrations/${teamId}`);
  }

  // --- Maintenance ---

  async listMaintenanceWindows(teamId: string, monitorId: string) {
    return this.request<unknown[]>(
      "GET",
      `/maintenance/${teamId}/${monitorId}`,
    );
  }
}
