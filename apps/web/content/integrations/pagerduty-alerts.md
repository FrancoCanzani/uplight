---
title: "PagerDuty Uptime Alerts - Trigger and Resolve Incidents Automatically"
description: "Connect Uplight to PagerDuty Events API and automatically trigger and resolve incidents when monitors go down or recover."
slug: "pagerduty-alerts"
type: integration
publishedAt: "2026-02-13"
author: Uplight Team
keywords: ["pagerduty uptime alerts", "pagerduty events api monitoring", "incident response uptime", "monitoring pagerduty integration"]
featured: false
integration: "pagerduty"
---

# PagerDuty Uptime Alerts with Uplight

Uplight can open and resolve PagerDuty incidents automatically. When a monitor fails, Uplight triggers an event. When service recovers, Uplight resolves it using the same dedup key.

## Why PagerDuty + Uplight

- Alert fatigue reduction through PagerDuty routing rules
- Fast on-call escalation for real outages
- Clear lifecycle from trigger to resolve
- Consistent incident records tied to monitor events

## Prerequisites

- A PagerDuty service with an integration key (routing key)
- An active Uplight monitor
- Permission to configure integrations in both tools

## Step 1: Get a PagerDuty Routing Key

1. In PagerDuty, open the target service.
2. Add an integration using **Events API v2**.
3. Copy the generated routing key.

## Step 2: Add PagerDuty in Uplight

1. In Uplight, go to **Settings** -> **Integrations**.
2. Click **Add Integration** and choose **PagerDuty**.
3. Paste the routing key.
4. Select a default severity (`critical`, `error`, `warning`, or `info`).
5. Save.

## Step 3: Attach to Monitors

1. Open the monitor settings.
2. Enable PagerDuty in notifications.
3. Save and test.

## What Uplight Sends to PagerDuty

For down events:

- `event_action: trigger`
- `dedup_key` based on incident ID
- Summary, monitor source, cause, locations, and error details

For recovery events:

- `event_action: resolve`
- Same dedup key
- Downtime and monitor context

This enables automatic resolve in PagerDuty without manual cleanup.

## Severity Strategy

- Use `critical` for customer-facing production endpoints.
- Use `error` for internal but high-impact services.
- Use `warning` or `info` for lower-priority environments.

## Troubleshooting

### Incidents are not created

- Verify the routing key matches the service integration.
- Confirm the monitor is mapped to this integration.
- Check integration logs for rejected API responses.

### Incidents do not auto-resolve

- Confirm recovery events are enabled.
- Confirm the dedup key is unchanged between trigger and resolve.

## Related Guides

- [Custom Webhook Alerts](/guides/integrations/webhook-alerts)
- [How to Set Up Status Pages](/guides/status-page-setup)
