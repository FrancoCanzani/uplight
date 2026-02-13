---
title: "Opsgenie Uptime Alerts - Create and Close Alerts from Uplight"
description: "Send Uplight incidents to Opsgenie with API-based alert creation and automatic close events when monitors recover."
slug: "opsgenie-alerts"
type: integration
publishedAt: "2026-02-13"
author: Uplight Team
keywords: ["opsgenie uptime alerts", "opsgenie api monitoring", "monitoring alerts opsgenie", "on-call alerts uptime"]
featured: false
integration: "opsgenie"
---

# Opsgenie Uptime Alerts with Uplight

Connect Uplight to Opsgenie to route incidents through your existing on-call and escalation process. Uplight creates alerts for outages and closes them on recovery.

## What You Need

- Opsgenie API key
- Region selection (`US` or `EU`)
- Uplight monitor(s) to track

## Step 1: Create an Opsgenie API Key

1. In Opsgenie, open **Settings** -> **API Key Management**.
2. Create a key with alert create/close permissions.
3. Copy the key securely.

## Step 2: Configure Integration in Uplight

1. Go to **Settings** -> **Integrations** in Uplight.
2. Add **Opsgenie**.
3. Paste your API key.
4. Select the Opsgenie region (`US` or `EU`).
5. Set default priority (`P1` to `P5`).
6. Save.

## Step 3: Enable for Monitors

Attach the Opsgenie integration to production monitors first, then expand to additional services.

## Event Mapping

When a monitor fails:

- Uplight creates an Opsgenie alert
- Includes alias, message, priority, cause, locations, and severity context

When a monitor recovers:

- Uplight closes the Opsgenie alert using the same alias
- Includes downtime note in the close action

## Priority Recommendations

- `P1`: revenue-critical endpoints
- `P2`: core APIs
- `P3`: standard services
- `P4/P5`: low-impact or non-prod monitors

## Troubleshooting

### Alerts are not being created

- Confirm region matches your Opsgenie account.
- Verify API key permissions.
- Check for invalid payload rejections in logs.

### Alerts remain open after recovery

- Confirm recovery messages are enabled.
- Verify alias consistency between alert and close events.

## Related Guides

- [PagerDuty Uptime Alerts](/guides/integrations/pagerduty-alerts)
- [Status Page Setup](/guides/status-page-setup)
