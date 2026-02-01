---
title: "API Uptime Monitoring - Monitor REST & GraphQL APIs"
description: "Monitor your API endpoints from multiple regions. Check response codes, verify content, track latency. Open source API monitoring."
slug: "api-monitoring"
type: use-case
publishedAt: "2025-01-28"
author: Uplight Team
keywords: ["api monitoring", "api uptime", "rest api monitoring", "graphql monitoring", "api health check"]
featured: true
industry: "api"
---

# API Uptime Monitoring

Your API is your product. Monitor it like your business depends on it—because it does.

## Why Monitor APIs?

APIs fail silently. Unlike a website, there's no visual indicator when something's wrong. Without monitoring, you discover API issues when:

- Customers complain
- Dashboards break
- Integrations fail
- Revenue stops

Proactive monitoring catches issues before users do.

## What Uplight Monitors

### HTTP Methods

| Method | Use Case |
|--------|----------|
| GET | Health checks, status endpoints |
| POST | Authentication, webhook receivers |
| PUT | Update operations |
| DELETE | Cleanup operations |
| HEAD | Quick availability checks |

### Response Validation

- **Status codes**: Expect 200, alert on anything else
- **Response body**: Verify JSON contains expected fields
- **Response time**: Alert when latency exceeds threshold
- **SSL/TLS**: Certificate validity and expiration

## API Monitoring Strategies

### Strategy 1: Health Check Endpoint

Create a dedicated health endpoint:

```json
GET /api/health

Response:
{
  "status": "healthy",
  "database": "connected",
  "cache": "connected",
  "version": "2.4.1",
  "timestamp": "2025-01-28T14:00:00Z"
}
```

**Monitor configuration:**
- URL: `https://api.example.com/health`
- Method: GET
- Expected status: 200
- Content contains: `"status": "healthy"`
- Interval: 1 minute

### Strategy 2: Critical Path Monitoring

Monitor your most important endpoints:

```
Authentication: POST /api/auth/login
User data: GET /api/users/me
Core feature: GET /api/products
Payments: POST /api/payments/status
```

Each endpoint gets its own monitor with appropriate settings.

### Strategy 3: Synthetic Transactions

Test complete user flows:

```
1. Authenticate → Get token
2. Use token → Fetch user data
3. Perform action → Verify result
```

*Note: Complex synthetic tests may require custom scripting outside Uplight.*

## Configuration Examples

### REST API Health Check

```yaml
Monitor: API Health
URL: https://api.example.com/health
Method: GET
Interval: 1 minute
Regions: All
Expected status: 200
Content check: "status": "healthy"
Timeout: 10 seconds
```

### Authenticated Endpoint

```yaml
Monitor: User API
URL: https://api.example.com/v1/user
Method: GET
Headers:
  Authorization: Bearer <api-key>
  Accept: application/json
Interval: 1 minute
Expected status: 200
```

### POST Endpoint

```yaml
Monitor: Webhook Receiver
URL: https://api.example.com/webhooks/health
Method: POST
Headers:
  Content-Type: application/json
Body: {"type": "health_check"}
Interval: 5 minutes
Expected status: 200
```

### GraphQL Endpoint

```yaml
Monitor: GraphQL API
URL: https://api.example.com/graphql
Method: POST
Headers:
  Content-Type: application/json
Body: {"query": "{ __typename }"}
Interval: 1 minute
Expected status: 200
Content check: "__typename"
```

## Multi-Region API Monitoring

APIs serve global users. Monitor from multiple locations:

### Why It Matters

- **CDN issues**: Edge caches might fail in specific regions
- **DNS problems**: Propagation issues affect some regions
- **Cloud outages**: AWS us-east-1 down? Your EU users are fine
- **Network routing**: Peering issues cause regional slowdowns

### Recommended Regions

**Global API:**
- Western North America (wnam)
- Eastern North America (enam)
- Western Europe (weur)
- Asia Pacific (apac)
- Oceania (oc)

**Regional API (e.g., EU only):**
- Western Europe (weur)
- Eastern Europe (eeur)

## Latency Monitoring

APIs need to be fast. Configure response time thresholds:

```yaml
Monitor: Search API
URL: https://api.example.com/search?q=test
Response time threshold: 500ms
Alert on: Response time exceeded
```

### Latency Benchmarks

| API Type | Good | Acceptable | Slow |
|----------|------|------------|------|
| Health check | <50ms | <200ms | >500ms |
| Simple query | <100ms | <300ms | >1s |
| Complex query | <500ms | <2s | >5s |
| File upload | <2s | <5s | >10s |

## API Versioning Monitoring

Monitor all your API versions:

```
https://api.example.com/v1/health
https://api.example.com/v2/health
https://api.example.com/v3/health
```

Why? Deprecating a version? Know when it's safe to sunset. New version? Verify it's stable.

## Error Response Monitoring

Your API should handle errors gracefully. But does it?

**Monitor error behavior:**
```yaml
Monitor: 404 Handler
URL: https://api.example.com/nonexistent
Expected status: 404
Content check: "error"
```

This catches issues where your API returns 500s instead of proper error responses.

## Rate Limit Awareness

Don't let your monitors trigger rate limits:

- **Use health endpoints** (usually exempt from rate limits)
- **Space out checks** (1-5 minute intervals)
- **Whitelist monitor IPs** if possible
- **Use dedicated API keys** for monitoring

## API Monitoring Checklist

### Endpoints to Monitor

- [ ] Health check endpoint
- [ ] Authentication endpoints
- [ ] Core API endpoints
- [ ] Webhook receivers
- [ ] Public API endpoints
- [ ] Admin API endpoints
- [ ] Legacy API versions

### Configuration

- [ ] Appropriate HTTP methods
- [ ] Required headers (auth, content-type)
- [ ] Response body validation
- [ ] Latency thresholds
- [ ] Multi-region checks
- [ ] Proper timeouts

### Alerting

- [ ] Immediate alerts for health check failures
- [ ] Latency alerts for performance degradation
- [ ] Escalation for prolonged outages
- [ ] Separate alerts for different API versions

## Troubleshooting API Monitors

### Monitor reports "down" but API works

1. **Check regions**: Maybe one region has issues
2. **Verify content check**: Is your check too strict?
3. **Check timing**: Intermittent slowness causing timeouts?
4. **Review headers**: Missing required headers?

### Intermittent failures

1. **Check timeout settings**: Increase if needed
2. **Review threshold**: Require 2+ failures before alerting
3. **Analyze patterns**: Same time each day? Same region?
4. **Check dependencies**: Database, cache, third-party services

### High latency alerts

1. **Check database queries**: N+1 queries? Missing indexes?
2. **Review caching**: Cache misses?
3. **Check third-party calls**: External API slow?
4. **Analyze traffic**: DDoS? Traffic spike?

## Integration with API Documentation

Link your status page to your API docs:

```markdown
## API Status

Check current API status: [status.example.com](https://status.example.com)

Current uptime: 99.98%
```

Developers trust APIs with transparent status pages.

## Getting Started

### 1. Deploy Uplight

```bash
# Self-host on Cloudflare Workers
npx create-uplight@latest

# Or use managed service
# Sign up at uplight.dev/signup
```

### 2. Add Health Check Monitor

Start simple:
- Your main health endpoint
- 1-minute intervals
- All regions

### 3. Add Critical Endpoints

Expand coverage:
- Authentication
- Core API routes
- Payment endpoints

### 4. Configure Alerts

Connect to your workflow:
- Slack for immediate notification
- Email for escalation
- Webhooks for automation

### 5. Create Status Page

Show your API reliability:
- Group endpoints by version
- Display current status
- Show uptime history

## Next Steps

- [Multi-region monitoring guide](/guides/multi-region-monitoring)
- [Webhook alerts for automation](/integrations/webhook-alerts)
- [SSL certificate monitoring](/guides/ssl-monitoring)
