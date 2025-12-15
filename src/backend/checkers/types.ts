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

export type CheckStatus = "success" | "failure" | "timeout" | "error";

export type IncidentCause =
  | "http_5xx"
  | "http_4xx"
  | "http_3xx"
  | "timeout"
  | "connection_refused"
  | "dns_failure"
  | "ssl_error"
  | "content_mismatch"
  | "tcp_failure";

export interface ContentCheck {
  enabled: boolean;
  mode: "contains" | "not_contains";
  content: string;
}

interface BaseCheckRequest {
  monitorId: number;
  location: Location;
  timeout: number;
  checkDNS: boolean;
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
  verifySSL: boolean;
}

export interface TcpCheckRequest extends BaseCheckRequest {
  type: "tcp";
  host: string;
  port: number;
}

export type CheckRequest = HttpCheckRequest | TcpCheckRequest;

export interface CheckConfig {
  timeout: number;
  maxRetries: number;
  initialRetryDelay: number;
}

export interface RawCheckResult {
  status: CheckStatus;
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
  type: "http" | "tcp";
  name: string;
  interval: number;
  timeout: number;
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
  verifySSL: boolean;
  checkDNS: boolean;
  host: string | null;
  port: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
