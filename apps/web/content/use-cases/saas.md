---
title: "SaaS Uptime Monitoring - Keep Your App Running"
description: "Monitor your SaaS application uptime from multiple regions. Detect outages before customers do. Open source, self-hostable."
slug: "saas-monitoring"
type: use-case
publishedAt: "2025-01-28"
author: Uplight Team
keywords: ["saas monitoring", "saas uptime", "application monitoring", "saas reliability", "api uptime monitoring"]
featured: true
industry: "saas"
---

# SaaS Uptime Monitoring

Your SaaS customers expect 99.9% uptime. With Uplight, you'll know about outages before they do—and have the status page to prove your reliability.

## Why SaaS Companies Need Uptime Monitoring

Every minute of downtime costs you:

- **Revenue**: Customers can't use what they can't access
- **Trust**: Repeated outages drive churn
- **Support load**: "Is it down?" tickets flood in
- **Reputation**: Word spreads fast in SaaS communities

Proactive monitoring changes the equation. Know first, fix faster, communicate transparently.

## What to Monitor

### Critical Endpoints

**Your web application:**
```
https://app.yoursaas.com
https://app.yoursaas.com/login
https://app.yoursaas.com/dashboard
```

**Your API:**
```
https://api.yoursaas.com/v1/health
https://api.yoursaas.com/v1/status
```

**Authentication services:**
```
https://auth.yoursaas.com/oauth/token
https://auth.yoursaas.com/.well-known/openid-configuration
```

### Supporting Services

- **CDN endpoints** - Static assets availability
- **Webhook endpoints** - Customer integrations
- **Documentation** - Customer self-service
- **Marketing site** - New customer acquisition

## Recommended Configuration

### Monitor Settings

| Service | Interval | Regions | Threshold |
|---------|----------|---------|-----------|
| Main app | 1 min | 5+ | 2 consecutive failures |
| API health | 1 min | 5+ | 2 consecutive failures |
| Auth service | 1 min | 3+ | 1 failure |
| Webhooks | 5 min | 3 | 2 consecutive failures |
| Marketing site | 5 min | 3 | 3 consecutive failures |

### Alert Configuration

**Immediate alerts (Slack/Discord):**
- Main application down
- API health check failing
- Authentication service issues

**Escalation (Email/Phone):**
- After 5 minutes of downtime
- Multiple regions affected
- SSL certificate expiring

### Content Verification

Don't just check for 200 OK. Verify the response:

```
Monitor: API Health Check
URL: https://api.yoursaas.com/health
Expected status: 200
Content contains: "status": "healthy"
```

This catches issues where the server responds but the service is broken.

## Multi-Region Strategy

SaaS customers are everywhere. Monitor from everywhere:

**Minimum coverage:**
- US East Coast (enam)
- US West Coast (wnam)
- Western Europe (weur)

**Better coverage:**
- Add Asia Pacific (apac)
- Add South America (sam)

**Complete coverage:**
- All 9 Uplight regions

### Why Multi-Region Matters

Single-region monitoring can miss:
- Regional CDN failures
- DNS propagation issues
- Cloud provider regional outages
- Network routing problems

If your EU customers can't reach your service, a US-only monitor won't tell you.

## Status Page for SaaS

Every SaaS needs a public status page. It's not optional anymore.

### What to Include

**Services to list:**
- Web Application
- API
- Authentication
- Webhooks/Integrations
- Mobile Apps

**Information to show:**
- Current status (operational/degraded/down)
- Uptime percentage
- Active incidents
- Scheduled maintenance
- Historical performance

### Status Page Benefits

1. **Reduces support tickets** - Customers check status first
2. **Builds trust** - Transparency shows professionalism
3. **Improves communication** - One source of truth
4. **Demonstrates reliability** - Show your uptime track record

## SaaS-Specific Best Practices

### 1. Monitor from Customer Perspective

Use public endpoints, not internal health checks:
```
❌ http://internal-lb.aws.local:8080/health
✅ https://api.yoursaas.com/health
```

### 2. Test Authentication Flows

Monitor endpoints that require auth:
- Use basic auth for protected health checks
- Verify OAuth token endpoints respond
- Check SSO integration points

### 3. Monitor Third-Party Dependencies

Your SaaS relies on others:
- Payment provider (Stripe, etc.)
- Email service (SendGrid, etc.)
- Auth provider (Auth0, etc.)
- Cloud services

Create monitors for critical dependencies. Their outage is your outage.

### 4. Set Up On-Call Rotation

Connect Uplight to your incident management:
1. Alert goes to Slack immediately
2. If not acknowledged in 5 minutes, escalate
3. Page the on-call engineer
4. Track incident response time

### 5. Document Response Procedures

Create runbooks for common issues:
- API returning 503s → Check server capacity
- Auth service down → Verify OAuth config
- SSL errors → Check certificate expiry

## SaaS Monitoring Checklist

**Endpoints:**
- [ ] Main application URL
- [ ] API health endpoint
- [ ] Authentication endpoints
- [ ] Webhook endpoints
- [ ] Documentation site
- [ ] Marketing site

**Configuration:**
- [ ] Multi-region monitoring enabled
- [ ] Content verification configured
- [ ] Appropriate check intervals set
- [ ] Alert thresholds defined

**Alerting:**
- [ ] Slack/Discord connected
- [ ] Email backup configured
- [ ] Escalation policy set
- [ ] On-call team assigned

**Status Page:**
- [ ] Public status page created
- [ ] All services listed
- [ ] Custom domain configured
- [ ] Maintenance windows scheduled

## Case Study: SaaS Startup

A B2B SaaS company with 500 customers implemented Uplight:

**Before:**
- Found out about outages from customer tweets
- Average detection time: 15 minutes
- No public status page
- Trust issues with enterprise customers

**After:**
- Outages detected in under 1 minute
- Automatic team notification
- Public status page with 99.95% uptime displayed
- Enterprise customers reference status page in contracts

**Results:**
- 60% reduction in "is it down?" support tickets
- Faster incident response
- Improved customer trust
- Easier enterprise sales

## Getting Started

### Quick Setup (5 minutes)

1. **Sign up** at [uplight.dev/signup](/signup) or [self-host](https://github.com/francocanzani/uplight)

2. **Add your main app monitor:**
   - URL: `https://app.yoursaas.com`
   - Interval: 1 minute
   - Regions: 5+

3. **Add your API monitor:**
   - URL: `https://api.yoursaas.com/health`
   - Interval: 1 minute
   - Content check: `"status": "healthy"`

4. **Connect Slack/Discord**

5. **Create status page**

You're monitoring. Now maintain it.

## Self-Hosting for SaaS

Many SaaS companies prefer self-hosted monitoring:

**Benefits:**
- Data stays in your infrastructure
- No external dependencies for monitoring
- Customizable to your needs
- Cost-effective at scale

**Deploy to Cloudflare Workers:**
```bash
npx create-uplight@latest
```

Your monitoring runs on Cloudflare's edge network—globally distributed, highly available.

## Next Steps

- [Set up multi-region monitoring](/guides/multi-region-monitoring)
- [Configure status pages](/guides/status-page-setup)
- [Connect Slack alerts](/integrations/slack-alerts)
- [SSL certificate monitoring](/guides/ssl-monitoring)
