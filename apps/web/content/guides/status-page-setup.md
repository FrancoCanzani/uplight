---
title: "How to Create a Public Status Page - Complete Guide"
description: "Create a professional status page for your service. Step-by-step guide to building trust with customers through transparent uptime reporting."
slug: "status-page-setup"
type: guide
publishedAt: "2025-01-28"
author: Uplight Team
keywords: ["status page", "create status page", "public status page", "incident page", "service status"]
featured: true
---

# How to Create a Public Status Page

A status page isn't optional anymore. Customers expect it. Enterprise clients require it. This guide shows you how to set one up properly.

## Why You Need a Status Page

### For Your Customers

- **Self-service**: Check status without contacting support
- **Trust**: Transparency builds confidence
- **Communication**: Single source of truth during incidents
- **History**: View your track record

### For Your Team

- **Reduces tickets**: "Is it down?" tickets disappear
- **Faster communication**: Update once, reach everyone
- **Documentation**: Incident history for postmortems
- **Professionalism**: Shows you take reliability seriously

### For Sales

Enterprise buyers check your status page. They want to see:
- Historical uptime (99.9%+)
- Professional incident communication
- Proactive maintenance scheduling

## Prerequisites

- Uplight account ([sign up free](/signup))
- At least one monitor configured
- 10 minutes to complete setup

## Step 1: Plan Your Status Page Structure

Before creating, plan what to display.

### Services to Include

**Group by user impact:**

```
Customer-Facing
├── Web Application
├── Mobile App
├── API

Backend Services
├── Authentication
├── Payments
├── Data Processing

Integrations
├── Webhooks
├── Third-Party Sync
└── Partner API
```

**Or group by product:**

```
Product A
├── App
├── API
└── Webhooks

Product B
├── Dashboard
├── API
└── Mobile
```

### What NOT to Include

- Internal tools (unless customer-facing)
- Individual microservices (group them)
- Test/staging environments
- Redundant entries

Keep it simple. 5-10 services is ideal.

## Step 2: Create Your Status Page

1. Log into Uplight dashboard
2. Navigate to **Status Pages** in sidebar
3. Click **Create Status Page**
4. Configure basic settings:

### Basic Settings

| Setting | Recommendation |
|---------|----------------|
| Name | Your company or product name |
| Slug | `status` (makes URL clean) |
| Description | Brief service description |
| Logo | Your company logo (optional) |

### Visibility

- **Public**: Anyone can view (recommended)
- **Private**: Requires authentication

Most companies choose public for transparency.

## Step 3: Add Service Groups

Organize your monitors into logical groups.

### Create a Group

1. Click **Add Group**
2. Name it (e.g., "Core Services")
3. Add description (optional)
4. Set display order

### Add Monitors to Group

1. Select monitors from the list
2. Assign custom display names if needed
3. Arrange in priority order

**Example structure:**

```
Core Services
├── Website (monitor: main-website)
├── API (monitor: api-health)
└── Authentication (monitor: auth-service)

Integrations
├── Slack Integration (monitor: slack-webhook)
└── Zapier Integration (monitor: zapier-webhook)
```

## Step 4: Configure Display Settings

### Uptime Display

Choose what to show:
- **Current status only**: Just operational/degraded/down
- **24-hour uptime**: Shows recent reliability
- **30-day uptime**: Standard for most pages
- **90-day uptime**: Shows long-term reliability

Recommendation: 30-day or 90-day uptime percentage.

### Historical Data

Show a timeline of past performance:
- **90 days**: Standard
- **30 days**: Cleaner, less history
- **Custom**: Match your SLA period

### Incident Display

- Show active incidents prominently
- Display resolved incidents for X days
- Include maintenance windows

## Step 5: Customize Appearance

### Branding

- **Logo**: Upload your company logo
- **Favicon**: Optional custom favicon
- **Colors**: Match your brand (if supported)

### Custom Domain

Instead of `yourcompany.uplight.dev/status`, use `status.yourcompany.com`:

1. Go to **Settings** → **Custom Domain**
2. Enter: `status.yourcompany.com`
3. Add CNAME record to your DNS:
   ```
   status.yourcompany.com → cname.uplight.dev
   ```
4. Wait for DNS propagation (up to 24 hours)
5. SSL certificate is automatic

### Page Content

Add helpful information:
- Link to documentation
- Support contact
- Subscription option (if available)

## Step 6: Test Your Status Page

Before announcing:

1. **View the page** - Check appearance and information
2. **Simulate incident** - Verify status changes display
3. **Check mobile** - Ensure responsive design works
4. **Test load time** - Should be fast (<2 seconds)

## Step 7: Share Your Status Page

### In Your Application

Add to footer:
```html
<a href="https://status.yourcompany.com">System Status</a>
```

Add to help/support pages:
```markdown
Check our [status page](https://status.yourcompany.com) for current system status.
```

### In Documentation

Include in your API docs:
```markdown
## Service Status

Current status: [status.yourcompany.com](https://status.yourcompany.com)
```

### In Support Materials

Add to:
- Support email signatures
- Chat widget
- Help center articles
- Incident response templates

### In Marketing

Include in:
- Pricing page (enterprise trust signal)
- Security page
- SLA documentation

## Managing Incidents

### Creating an Incident

When something goes wrong:

1. Navigate to your status page in Uplight
2. Click **Create Incident**
3. Fill in details:
   - **Title**: Brief description
   - **Status**: Investigating / Identified / Monitoring / Resolved
   - **Impact**: Which services affected
   - **Message**: What's happening

### Incident Updates

Keep customers informed:

```
14:32 - Investigating: We're aware of issues with the API
        and are investigating.

14:45 - Identified: Root cause identified as database
        connection issues. Working on fix.

15:10 - Monitoring: Fix deployed. Monitoring for stability.

15:30 - Resolved: Issue resolved. API is fully operational.
        Total downtime: 58 minutes.
```

### Post-Incident

After resolution:
1. Mark incident as resolved
2. Update with final summary
3. Consider posting postmortem link

## Scheduled Maintenance

Communicate maintenance in advance:

1. Click **Schedule Maintenance**
2. Set start and end times
3. Describe the maintenance
4. Select affected services
5. Publish

Example:
```
Scheduled Maintenance
Date: February 15, 2025
Time: 02:00 - 04:00 UTC
Services: Database, API
Impact: Brief service interruption expected
```

## Best Practices

### 1. Keep It Simple

5-10 services maximum. Group related services.

### 2. Update Promptly

During incidents:
- First update within 5 minutes
- Updates every 15-30 minutes
- Resolved status when confident

### 3. Be Honest

Don't hide incidents. Customers notice. Trust is built through transparency.

### 4. Use Clear Language

❌ "We're experiencing degraded performance in our distributed compute cluster"
✅ "Some users may experience slow page loads"

### 5. Include Workarounds

If possible, tell users how to work around issues:
```
Workaround: If experiencing issues, try refreshing the page
or clearing your browser cache.
```

### 6. Follow Up

For major incidents, consider:
- Postmortem blog post
- Root cause analysis shared
- Preventive measures explained

## Common Mistakes

### Too Many Services

❌ Listing every microservice
✅ Group into user-facing categories

### Stale Page

❌ Status page that never updates
✅ Regular updates, even when things are good

### Corporate Speak

❌ "We are currently experiencing operational difficulties..."
✅ "The checkout system is down. We're working on it."

### Ignoring Maintenance

❌ Surprise maintenance affecting users
✅ Scheduled maintenance announced in advance

## Measuring Success

Track these metrics:
- Support tickets mentioning "is it down?"
- Direct status page visits during incidents
- Customer feedback on communication
- Enterprise sales referencing status page

## Integration with Monitoring

Your status page should automatically reflect monitor status:

1. Monitors detect issue
2. Status page updates automatically
3. Alert sent to team
4. Team investigates
5. Manual incident update posted
6. Monitor recovers
7. Status page shows recovery

## Summary

A good status page:
- ✅ Shows current status clearly
- ✅ Displays uptime history
- ✅ Updates during incidents
- ✅ Announces maintenance
- ✅ Uses clear language
- ✅ Is easy to find

## Next Steps

1. [Sign up for Uplight](/signup) if you haven't
2. Create your first monitors
3. Set up your status page following this guide
4. Share it with your users
5. Keep it updated!

## Related Guides

- [Multi-region monitoring](/guides/multi-region-monitoring)
- [Slack alerts setup](/integrations/slack-alerts)
- [Incident management](/guides/incident-response)
