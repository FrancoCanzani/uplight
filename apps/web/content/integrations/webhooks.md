---
title: "Custom Webhook Alerts - Integrate Uplight with Any Service"
description: "Send uptime alerts to any service using custom webhooks. Connect Uplight to your existing tools and workflows."
slug: "webhook-alerts"
type: integration
publishedAt: "2025-01-28"
author: Uplight Team
keywords: ["webhook uptime alerts", "custom webhook monitoring", "uptime monitoring api", "monitoring webhook integration"]
featured: false
integration: "webhook"
---

# Custom Webhook Alerts with Uplight

Webhooks let you send Uplight alerts to any HTTP endpoint. Connect to your existing tools, trigger automations, or build custom integrations.

## What Are Webhooks?

Webhooks are HTTP callbacks. When an event happens (like a service going down), Uplight sends an HTTP POST request to your specified URL with event data.

**Use webhooks to:**
- Trigger automated responses
- Send alerts to unsupported platforms
- Create custom incident workflows
- Log events to external systems
- Integrate with your existing tools

## Webhook Payload

When a monitor status changes, Uplight sends a JSON payload:

```json
{
  "event": "monitor.down",
  "timestamp": "2025-01-28T14:32:15.000Z",
  "monitor": {
    "id": 123,
    "name": "API Production",
    "url": "https://api.example.com/health",
    "type": "http"
  },
  "check": {
    "status": "down",
    "statusCode": 503,
    "responseTime": null,
    "region": "weur",
    "error": "Service Unavailable"
  },
  "incident": {
    "id": 456,
    "startedAt": "2025-01-28T14:32:15.000Z"
  }
}
```

### Event Types

| Event | Description |
|-------|-------------|
| `monitor.down` | Service is unreachable or returning errors |
| `monitor.up` | Service has recovered |
| `monitor.degraded` | Service is slow or partially failing |
| `ssl.expiring` | SSL certificate expires soon |
| `domain.expiring` | Domain registration expires soon |

## Setup Guide

### Step 1: Create Your Endpoint

Your endpoint must:
- Accept POST requests
- Accept `application/json` content type
- Return 2xx status within 30 seconds

Example endpoint (Node.js/Express):

```javascript
app.post('/uplight-webhook', (req, res) => {
  const event = req.body;

  console.log(`Received ${event.event} for ${event.monitor.name}`);

  // Your custom logic here

  res.status(200).send('OK');
});
```

### Step 2: Add Webhook in Uplight

1. Go to **Settings** → **Integrations**
2. Click **Add Integration** → **Webhook**
3. Enter your endpoint URL
4. (Optional) Add authentication headers
5. Select which monitors should trigger this webhook
6. Save and test

### Step 3: Test It

1. Click **Send Test** in integration settings
2. Check your endpoint logs
3. Verify you received the test payload

## Authentication Options

### Basic Auth

Add credentials in the URL:
```
https://user:password@yoursite.com/webhook
```

### Bearer Token

Add a custom header:
```
Authorization: Bearer your-secret-token
```

### Custom Headers

Add any headers you need:
```
X-API-Key: your-api-key
X-Custom-Header: value
```

## Integration Examples

### PagerDuty

Send alerts to PagerDuty using their Events API:

```javascript
// Your webhook endpoint
app.post('/uplight-to-pagerduty', async (req, res) => {
  const { event, monitor, check } = req.body;

  await fetch('https://events.pagerduty.com/v2/enqueue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      routing_key: 'YOUR_PAGERDUTY_KEY',
      event_action: event === 'monitor.down' ? 'trigger' : 'resolve',
      dedup_key: `uplight-${monitor.id}`,
      payload: {
        summary: `${monitor.name} is ${check.status}`,
        source: 'Uplight',
        severity: 'critical'
      }
    })
  });

  res.status(200).send('OK');
});
```

### Telegram

Send alerts to a Telegram chat:

```javascript
app.post('/uplight-to-telegram', async (req, res) => {
  const { event, monitor, check } = req.body;
  const emoji = event === 'monitor.down' ? '🔴' : '🟢';

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: `${emoji} ${monitor.name} is ${check.status}`,
      parse_mode: 'HTML'
    })
  });

  res.status(200).send('OK');
});
```

### Opsgenie

Create alerts in Opsgenie:

```javascript
app.post('/uplight-to-opsgenie', async (req, res) => {
  const { event, monitor, check, incident } = req.body;

  if (event === 'monitor.down') {
    await fetch('https://api.opsgenie.com/v2/alerts', {
      method: 'POST',
      headers: {
        'Authorization': `GenieKey ${OPSGENIE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `${monitor.name} is down`,
        alias: `uplight-${monitor.id}`,
        description: check.error,
        priority: 'P1'
      })
    });
  } else {
    await fetch(`https://api.opsgenie.com/v2/alerts/uplight-${monitor.id}/close`, {
      method: 'POST',
      headers: { 'Authorization': `GenieKey ${OPSGENIE_KEY}` }
    });
  }

  res.status(200).send('OK');
});
```

### Auto-Restart Services

Automatically restart failed services:

```javascript
app.post('/auto-restart', async (req, res) => {
  const { event, monitor } = req.body;

  if (event === 'monitor.down' && monitor.name === 'Web Server') {
    // Trigger restart via your infrastructure
    await fetch('https://your-infra-api.com/restart/web-server', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${INFRA_TOKEN}` }
    });

    console.log('Auto-restart triggered for web server');
  }

  res.status(200).send('OK');
});
```

## Best Practices

### 1. Respond Quickly

Return 200 OK as soon as possible. Do heavy processing async:

```javascript
app.post('/webhook', (req, res) => {
  res.status(200).send('OK'); // Respond immediately

  // Process async
  processAlert(req.body).catch(console.error);
});
```

### 2. Handle Retries

Uplight retries failed webhooks. Make your endpoint idempotent:

```javascript
const processedEvents = new Set();

app.post('/webhook', (req, res) => {
  const eventId = `${req.body.monitor.id}-${req.body.timestamp}`;

  if (processedEvents.has(eventId)) {
    return res.status(200).send('Already processed');
  }

  processedEvents.add(eventId);
  // Process event...
});
```

### 3. Validate Requests

Verify requests come from Uplight:

```javascript
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-uplight-signature'];

  if (!verifySignature(req.body, signature, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }

  // Process...
});
```

### 4. Log Everything

Keep logs for debugging:

```javascript
app.post('/webhook', (req, res) => {
  console.log({
    timestamp: new Date().toISOString(),
    event: req.body.event,
    monitor: req.body.monitor.name,
    headers: req.headers
  });

  // Process...
});
```

## Troubleshooting

### Webhook not receiving events?

1. **Check URL** - Is it publicly accessible?
2. **Check firewall** - Allow incoming POST requests
3. **Verify integration** - Is it enabled in Uplight?
4. **Test endpoint** - Try calling it with curl

### Getting timeouts?

1. **Respond faster** - Return 200 immediately, process async
2. **Check server** - Is your endpoint overloaded?
3. **Verify hosting** - Cloud functions might cold start

### Missing events?

1. **Check retry logs** - Uplight retries failed deliveries
2. **Verify endpoint stability** - Any outages?
3. **Review rate limits** - Some hosts limit incoming requests

## Security Checklist

- [ ] Use HTTPS only
- [ ] Validate webhook signatures
- [ ] Implement rate limiting
- [ ] Keep webhook URLs secret
- [ ] Monitor endpoint health
- [ ] Log all requests

## Next Steps

- [Slack integration](/integrations/slack-alerts) - Built-in, no webhook needed
- [Discord integration](/integrations/discord-alerts) - Built-in, no webhook needed
- [API documentation](/docs/api) - Full Uplight API reference

## Start Building

Webhooks give you unlimited integration possibilities. Connect Uplight to anything that accepts HTTP requests.

1. [Sign up](/signup) or [self-host](https://github.com/francocanzani/uplight)
2. Create a webhook endpoint
3. Add it to Uplight
4. Build your custom workflow
