export type Location =
  | "wnam"
  | "enam"
  | "sam"
  | "weur"
  | "eeur"
  | "apac"
  | "oc"
  | "afr"
  | "me";

export type CheckStatus =
  | "success"
  | "failure"
  | "timeout"
  | "error"
  | "maintenance"
  | "degraded";

export type IncidentCause =
  | "http_5xx"
  | "http_4xx"
  | "http_3xx"
  | "timeout"
  | "connection_refused"
  | "dns_failure"
  | "ssl_error"
  | "content_mismatch"
  | "tcp_failure"
  | "network_error";

export type DnsRecordType = "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS";
export type DnsResolver = "cloudflare" | "google";
export interface DnsAssertion {
  recordType: DnsRecordType;
  value: string;
}

export interface ContentCheck {
  enabled: boolean;
  mode: "contains" | "not_contains";
  content: string;
}

interface BaseCheckRequest {
  monitorId: number;
  location: Location;
  timeout: number;
  contentCheck?: ContentCheck;
}

export interface HttpCheckRequest extends BaseCheckRequest {
  type: "http";
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
  username?: string;
  password?: string;
  expectedStatusCodes: number[];
  followRedirects: boolean;
}

export interface TcpCheckRequest extends BaseCheckRequest {
  type: "tcp";
  host: string;
  port: number;
}

export interface DnsCheckRequest extends BaseCheckRequest {
  type: "dns";
  host: string;
  assertions: DnsAssertion[];
  resolver: DnsResolver;
}

export type CheckRequest = HttpCheckRequest | TcpCheckRequest | DnsCheckRequest;

export interface CheckConfig {
  timeout: number;
  maxRetries: number;
  initialRetryDelay: number;
}

export interface RawCheckResult {
  result: CheckStatus;
  responseTime: number;
  statusCode?: number;
  errorMessage?: string;
  cause?: IncidentCause;
  responseHeaders?: Record<string, string>;
  responseBody?: string;
}

export interface CheckResult extends RawCheckResult {
  monitorId: number;
  location: Location;
  retryCount: number;
  checkedAt: number;
}

export interface MonitorRow {
  id: number;
  teamId: number;
  type: "http" | "tcp" | "dns";
  name: string;
  interval: number;
  timeout: number;
  responseTimeThreshold: number | null;
  locations: string;
  contentCheck: string | null;
  url: string | null;
  method: string | null;
  headers: string | null;
  body: string | null;
  username: string | null;
  password: string | null;
  expectedStatusCodes: string | null;
  followRedirects: boolean;
  checkDomain: boolean;
  host: string | null;
  port: number | null;
  dnsRecordType: string | null;
  dnsExpectedValue: string | null;
  dnsResolver: DnsResolver;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
