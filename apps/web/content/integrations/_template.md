---
title: "[Integration Name] Uptime Alerts - Get Instant Notifications"
description: "Learn how to set up [Integration] alerts for your uptime monitoring with Uplight. Step-by-step guide to configure notifications."
slug: "[integration-slug]-alerts"
type: integration
publishedAt: "2025-01-28"
author: Uplight Team
keywords: ["[integration] alerts", "uptime notifications", "[integration] monitoring"]
featured: false
integration: "[integration-name]"
---

# Set Up [Integration Name] Alerts for Uptime Monitoring

Get instant notifications in [Integration Name] when your services go down. This guide shows you how to configure Uplight to send alerts to your [Integration Name] workspace.

## Prerequisites

Before you begin, make sure you have:

- An Uplight account with at least one monitor configured
- Access to your [Integration Name] workspace settings
- Administrator permissions to add integrations

## Step 1: Create a Webhook URL

First, you need to create a webhook URL in [Integration Name]:

1. Go to your [Integration Name] workspace settings
2. Navigate to the integrations section
3. Create a new incoming webhook
4. Copy the webhook URL

## Step 2: Add the Integration in Uplight

Now add the integration in your Uplight dashboard:

1. Go to **Settings** → **Integrations**
2. Click **Add Integration**
3. Select **[Integration Name]**
4. Paste your webhook URL
5. Choose which monitors should send alerts

## Step 3: Test Your Integration

To verify everything works:

1. Click **Send Test** in the integration settings
2. Check your [Integration Name] channel for the test message
3. If you don't receive it, verify your webhook URL is correct

## Alert Types

Uplight sends two types of alerts to [Integration Name]:

- **Incident alerts**: When a monitor detects a problem
- **Recovery alerts**: When a service comes back online

## Customization Options

You can customize how alerts appear in [Integration Name]:

- Choose the channel for notifications
- Set up escalation rules for critical alerts
- Configure quiet hours to avoid non-urgent notifications at night

## Troubleshooting

### Not receiving alerts?

- Verify the webhook URL is correct
- Check that the integration is enabled
- Ensure your monitors are active

### Duplicate alerts?

- Check if you have multiple integrations configured
- Review your alert conditions

## Next Steps

- [Configure additional integrations](/guides/integrations)
- [Set up a public status page](/guides/status-page-setup)
- [Learn about multi-region monitoring](/guides/multi-region-monitoring)
