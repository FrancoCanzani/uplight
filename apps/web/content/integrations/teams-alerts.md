---
title: "Microsoft Teams Uptime Alerts - Incident Notifications in Channels"
description: "Send Uplight uptime alerts to Microsoft Teams channels using incoming webhooks. Get instant incident and recovery notifications."
slug: "teams-alerts"
type: integration
publishedAt: "2026-02-13"
author: Uplight Team
keywords: ["microsoft teams uptime alerts", "teams incident notifications", "website monitoring teams", "teams webhook alerts"]
featured: false
integration: "teams"
---

# Microsoft Teams Uptime Alerts with Uplight

If your incident workflow runs in Teams, your uptime alerts should too. Uplight sends structured incident and recovery messages directly to a Teams channel using a webhook.

## What This Integration Sends

Uplight posts two event types:

- **Incident alert** when a monitor goes down
- **Recovery alert** when the monitor comes back up

Each message includes monitor name, cause, affected locations, and incident metadata so responders can act immediately.

## Prerequisites

Before setup, make sure you have:

- An Uplight account with at least one active monitor
- Permission to create an incoming webhook in your Teams workspace
- A channel dedicated to operational alerts (recommended)

## Step 1: Create a Teams Incoming Webhook

1. Open the Teams channel where you want alerts.
2. Add an **Incoming Webhook** connector.
3. Name it (for example, `Uplight Alerts`).
4. Copy the webhook URL.

## Step 2: Add Teams in Uplight

1. In Uplight, go to **Settings** -> **Integrations**.
2. Click **Add Integration**.
3. Select **Microsoft Teams**.
4. Paste the webhook URL.
5. Save the integration.

## Step 3: Assign Monitors

1. Open each monitor you want routed to Teams.
2. Under notifications, enable your Teams integration.
3. Save changes.

## Step 4: Send a Test Alert

1. Trigger a test from integration settings.
2. Confirm the message appears in the Teams channel.
3. Verify your on-call team sees the notification.

## Message Format Highlights

Teams messages include:

- Monitor name
- Cause and optional error details
- Locations impacted
- Severity when available
- Downtime value on recovery messages

This lets your team triage quickly without opening multiple tools first.

## Best Practices

- Use a dedicated `#ops-alerts` style channel for signal clarity.
- Route critical production monitors to a separate channel.
- Pair this with status pages so responders can share customer-facing status quickly.

## Troubleshooting

### Alerts are not arriving

- Re-check the webhook URL in Uplight.
- Confirm the integration is enabled for the monitor.
- Confirm your Teams connector is still active.

### Too much noise

- Split integrations by environment (prod vs staging).
- Increase failure threshold on non-critical monitors.

## Related Guides

- [Set Up Slack Uptime Alerts](/guides/integrations/slack-alerts)
- [Set Up Discord Uptime Alerts](/guides/integrations/discord-alerts)
- [Status Page Setup Guide](/guides/status-page-setup)
