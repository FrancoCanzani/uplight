---
title: "Discord Uptime Alerts - Server Monitoring Notifications"
description: "Get Discord notifications when your websites go down. Set up uptime alerts for your Discord server in minutes."
slug: "discord-alerts"
type: integration
publishedAt: "2025-01-28"
author: Uplight Team
keywords: ["discord uptime alerts", "discord server monitoring", "discord bot uptime", "website monitoring discord"]
featured: true
integration: "discord"
---

# Discord Uptime Alerts with Uplight

Get instant Discord notifications when your services go down. Perfect for gaming communities, dev teams, and anyone who lives in Discord.

## Why Discord for Monitoring Alerts?

Discord isn't just for gaming anymore. Development teams, startups, and communities use Discord daily. Uptime alerts belong where your team already is.

**Benefits:**
- **Real-time notifications** - Alerts appear instantly
- **Rich embeds** - Beautiful, informative alert cards
- **Role mentions** - Tag specific people or roles
- **Multiple channels** - Route alerts by severity
- **Free** - No paid Slack plans needed

## Alert Format

Uplight sends rich Discord embeds with all the details:

**Down Alert:**
```
🔴 Service Down
━━━━━━━━━━━━━━━━━
Monitor: api.example.com
Status: Connection timeout
Region: Asia Pacific
Time: Jan 28, 2025 2:45 PM UTC

Response: Timeout after 30 seconds
```

**Recovery Alert:**
```
🟢 Service Recovered
━━━━━━━━━━━━━━━━━
Monitor: api.example.com
Status: 200 OK
Downtime: 3 minutes 12 seconds
Region: All regions healthy

Response time: 145ms
```

## Setup Instructions

### Step 1: Create Discord Webhook

1. Open your Discord server
2. Go to **Server Settings** → **Integrations**
3. Click **Webhooks** → **New Webhook**
4. Name it "Uplight Alerts"
5. Select the target channel (e.g., #alerts)
6. **Copy Webhook URL** - You'll need this

**Tip:** Create a dedicated #uptime-alerts channel for clarity.

### Step 2: Add Webhook to Uplight

1. Log into your Uplight dashboard
2. Navigate to **Settings** → **Integrations**
3. Click **Add Integration**
4. Select **Discord**
5. Paste your webhook URL
6. Give it a descriptive name
7. Choose which monitors should send to this webhook
8. **Save**

### Step 3: Test the Integration

1. In your integration settings, click **Send Test**
2. Check your Discord channel
3. You should see a test alert within seconds

If it works, you're done! Alerts will now flow to Discord.

## Advanced Setup

### Multiple Channels by Severity

Create different channels for different alert types:

| Channel | Use Case | Webhook |
|---------|----------|---------|
| #critical-alerts | Production down | Webhook 1 |
| #warnings | Degraded performance | Webhook 2 |
| #ssl-alerts | Certificate expiring | Webhook 3 |

Set up separate Uplight integrations for each.

### Role Mentions

Want to ping specific roles when services go down?

1. Create a role (e.g., `@on-call`)
2. In your integration settings, enable role mentions
3. Configure the role ID to mention

**Getting Role ID:**
1. Enable Developer Mode in Discord settings
2. Right-click the role → Copy ID

### Thread Creation

For busy channels, have alerts create threads:
- Keeps main channel clean
- Groups related alerts together
- Easy to track incidents

## Discord Bot Permissions

The webhook needs minimal permissions:
- Send Messages
- Embed Links

That's it. No admin access needed.

## Best Practices

### 1. Dedicated Alert Channel

Create a channel just for alerts:
- Clear separation from chat
- Easy to find incidents
- Configure specific notification settings

### 2. Channel Notification Settings

For your alert channel:
- **All messages** for critical alerts
- **@mentions only** for lower severity

### 3. Pin Status Page Link

Pin your Uplight status page URL in the channel description. Quick access during incidents.

### 4. Organize with Categories

```
📊 OPERATIONS
├── #uptime-alerts
├── #deployments
└── #status-updates
```

## Troubleshooting

### Alerts not appearing?

1. **Verify webhook URL** - Double-check it's copied correctly
2. **Test the webhook** - Use Discord's test feature
3. **Check Uplight integration** - Is it enabled?
4. **Verify channel permissions** - Can the webhook post?

### Webhook rate limits?

Discord limits webhooks to 30 messages/minute. If you have many monitors:
- Group alerts by channel strategically
- Consider slightly longer check intervals for non-critical services

### Want to customize embed colors?

Uplight uses standard colors:
- 🔴 Red: Down/Critical
- 🟡 Yellow: Degraded/Warning
- 🟢 Green: Up/Recovered

## Integration Ideas

### Combined with Discord Bots

Use your existing Discord bots to:
- Auto-acknowledge alerts
- Create incident tickets
- Update status channels

### Status Channel

Create a voice channel that shows current status:
```
✅ All Systems: Operational
```

Update it based on Uplight webhooks using a bot.

## Security Notes

- Treat webhook URLs as secrets
- Don't share them publicly
- Regenerate if compromised
- Limit channel access to relevant team members

## Why Not Just Use Slack?

Many teams prefer Discord because:
- **Free** - No message limits, no paid tiers needed
- **Better for communities** - Public and private channels
- **Voice integration** - Jump into a call during incidents
- **Developer friendly** - Easy webhook/bot integration

## Next Steps

- [Add Slack alerts](/integrations/slack-alerts) - For teams on both platforms
- [Set up email backup](/integrations/email-alerts) - Redundant notifications
- [Create status page](/guides/status-page-setup) - Public incident communication

## Get Started Now

1. [Sign up for Uplight](/signup) or [self-host free](https://github.com/francocanzani/uplight)
2. Add your monitors
3. Create Discord webhook
4. Connect and test
5. Stay informed, always
