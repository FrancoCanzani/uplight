---
title: "Slack Uptime Alerts - Get Notified When Sites Go Down"
description: "Set up Slack alerts for your uptime monitoring. Get instant notifications in your Slack workspace when services go down or recover."
slug: "slack-alerts"
type: integration
publishedAt: "2025-01-28"
author: Uplight Team
keywords: ["slack uptime alerts", "slack monitoring notifications", "slack downtime alerts", "website down slack notification"]
featured: true
integration: "slack"
---

# Slack Uptime Alerts with Uplight

Get instant Slack notifications when your websites and APIs go down. Uplight sends alerts directly to your Slack channels so your team can respond immediately.

## Why Slack for Uptime Alerts?

Your team already lives in Slack. Why check another dashboard?

- **Instant visibility** - Alerts appear where you already work
- **Team coordination** - Everyone sees the issue simultaneously
- **Quick response** - React, comment, and coordinate in-thread
- **Mobile alerts** - Slack mobile app means alerts reach you anywhere
- **Search history** - Find past incidents easily

## What You'll Get

When a monitor detects a problem, Uplight sends a rich Slack message:

```
🔴 DOWN: api.yoursite.com
Status: 503 Service Unavailable
Region: Western Europe
Response time: Timeout after 30s
Checked at: 2025-01-28 14:32:15 UTC
```

When it recovers:

```
🟢 UP: api.yoursite.com
Status: 200 OK
Downtime: 4 minutes 23 seconds
Region: All regions responding
Checked at: 2025-01-28 14:36:38 UTC
```

## Setup Guide

### Step 1: Create a Slack Webhook

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. Name it "Uplight Alerts" and select your workspace
4. Go to **Incoming Webhooks** in the sidebar
5. Toggle **Activate Incoming Webhooks** to On
6. Click **Add New Webhook to Workspace**
7. Select the channel for alerts (e.g., #ops-alerts)
8. Copy the webhook URL

### Step 2: Add to Uplight

1. Open your Uplight dashboard
2. Go to **Settings** → **Integrations**
3. Click **Add Integration** → **Slack**
4. Paste your webhook URL
5. Name it (e.g., "Ops Channel Alerts")
6. Select which monitors should use this integration
7. Click **Save**

### Step 3: Test It

1. Click **Send Test Alert** in Uplight
2. Check your Slack channel
3. You should see a test message within seconds

## Advanced Configuration

### Multiple Channels

Create separate integrations for different alert types:

- **#critical-alerts** - Production services only
- **#staging-alerts** - Staging/dev environments
- **#security-alerts** - SSL and domain expiry

### Alert Routing by Monitor

Assign specific monitors to specific Slack channels:

1. Edit your monitor in Uplight
2. Under **Notifications**, select which integrations to use
3. Save changes

### Quiet Hours

Avoid non-urgent alerts at night:

1. Go to Integration settings
2. Set **Quiet Hours** (e.g., 10 PM - 7 AM)
3. Only critical alerts will send during quiet hours

## Best Practices

### 1. Dedicated Alert Channel

Don't mix uptime alerts with general chat. Create a dedicated channel:
- #uptime-alerts
- #ops-alerts
- #service-status

### 2. Pin Your Status Page

Pin a link to your Uplight status page in the alert channel. Team members can quickly check overall status.

### 3. Set Up Channel Notifications

Configure channel notification settings:
- **All messages** for critical alerts channel
- **Mentions only** for less critical channels

### 4. Use Slack Workflows

Combine with Slack Workflow Builder:
- Auto-create incident tickets
- Notify on-call rotation
- Update status page

## Troubleshooting

### Not receiving alerts?

1. **Check webhook URL** - Make sure it's correct and active
2. **Verify integration is enabled** - Toggle should be on in Uplight
3. **Check monitor status** - Is the monitor active?
4. **Review Slack channel** - Is the bot in the channel?

### Duplicate alerts?

1. **Check for multiple integrations** - You might have the same webhook twice
2. **Review monitor settings** - Each monitor should use one Slack integration

### Delayed alerts?

1. **Check monitor interval** - Alerts send after check completes
2. **Verify Slack webhook** - Test it manually with curl
3. **Check quiet hours** - Alerts might be suppressed

## Example Slack Alert Workflow

```
Monitor detects failure
    ↓
Uplight sends Slack webhook
    ↓
Alert appears in #ops-alerts
    ↓
Team member acknowledges
    ↓
Investigation begins
    ↓
Fix deployed
    ↓
Monitor detects recovery
    ↓
Recovery alert sent to Slack
    ↓
Incident closed
```

## Integration with Slack Features

### Thread Replies

Uplight sends related alerts (failures + recovery) to help you track incidents over time.

### Slack Search

Find past incidents:
```
in:#ops-alerts from:Uplight "api.yoursite.com"
```

### Slack Connect

Share alert channels with external partners or clients using Slack Connect.

## Security Considerations

- Webhook URLs are secret - treat them like passwords
- Use Slack's URL restrictions if available
- Rotate webhooks periodically
- Review who has access to alert channels

## Next Steps

- [Set up Discord alerts](/integrations/discord-alerts) - For teams on Discord
- [Configure email alerts](/integrations/email-alerts) - Backup notification method
- [Create a status page](/guides/status-page-setup) - Keep users informed

## Get Started

1. [Create your Uplight account](/signup)
2. Add your first monitor
3. Follow this guide to connect Slack
4. Never miss another outage
