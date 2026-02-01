---
title: "SSL Certificate Monitoring - Never Let Certificates Expire"
description: "Monitor SSL certificates and get alerts before they expire. Avoid browser warnings and outages caused by expired certificates."
slug: "ssl-monitoring"
type: guide
publishedAt: "2025-01-28"
author: Uplight Team
keywords: ["ssl monitoring", "certificate monitoring", "ssl expiry alert", "certificate expiration", "https monitoring"]
featured: false
---

# SSL Certificate Monitoring

Expired SSL certificates break your site. Browsers show scary warnings. Customers leave. APIs fail. It's preventable.

## Why SSL Monitoring Matters

### The Cost of Expiration

When your SSL certificate expires:

- **Browsers block access** with full-page warnings
- **APIs fail** if they enforce SSL verification
- **SEO suffers** as Google flags insecure sites
- **Trust disappears** instantly
- **Revenue stops** for e-commerce sites

### Real Incidents

Major companies have been caught by expired certificates:

- LinkedIn (2019): 12-hour outage
- Microsoft Teams (2020): Multiple hours down
- Spotify (2020): App authentication failures

If it happens to them, it can happen to you.

## How Uplight Monitors SSL

When you add an HTTPS monitor, Uplight automatically:

1. **Checks certificate validity** on every request
2. **Extracts expiration date** from the certificate
3. **Tracks certificate chain** issues
4. **Alerts before expiration** (configurable)

You get proactive warnings, not panicked 3 AM alerts.

## Setting Up SSL Monitoring

### Step 1: Add HTTPS Monitor

1. Go to **Monitors** → **Add Monitor**
2. Enter your HTTPS URL: `https://example.com`
3. Enable **Check Domain** option

That's it. SSL monitoring is automatic for HTTPS URLs.

### Step 2: Configure Alert Threshold

Set when you want expiration warnings:

| Days Before | Use Case |
|-------------|----------|
| 30 days | Standard recommendation |
| 14 days | If renewal is automated |
| 7 days | Minimum safe threshold |
| 60 days | If renewal requires approval |

Recommendation: 30 days gives you time to act.

### Step 3: Add Multiple Domains

Monitor all your certificates:

```
https://example.com        (main site)
https://api.example.com    (API)
https://app.example.com    (web app)
https://admin.example.com  (admin panel)
https://cdn.example.com    (CDN/assets)
```

Each subdomain may have different certificates.

## Understanding SSL Alerts

### Certificate Expiring Soon

```
⚠️ SSL Certificate Expiring
Domain: api.example.com
Expires: 2025-02-28 (14 days)
Issuer: Let's Encrypt
Current Status: Valid
```

Action: Renew before expiration date.

### Certificate Expired

```
🔴 SSL Certificate Expired
Domain: example.com
Expired: 2025-01-27 (1 day ago)
Issue: Certificate validation failed
```

Action: Renew immediately. Site is showing warnings.

### Certificate Chain Issues

```
⚠️ SSL Chain Incomplete
Domain: example.com
Issue: Intermediate certificate missing
```

Action: Fix certificate installation.

### Self-Signed Certificate

```
ℹ️ Self-Signed Certificate
Domain: staging.example.com
Issue: Not trusted by browsers
```

May be intentional for internal/staging environments.

## SSL Best Practices

### 1. Automate Renewal

Use tools that auto-renew:

- **Let's Encrypt + Certbot**: Free, auto-renews
- **Cloudflare**: Automatic for proxied domains
- **AWS Certificate Manager**: Auto-renews for AWS services

Even with automation, monitor as a safety net.

### 2. Monitor All Subdomains

Don't forget:
- `www.example.com`
- `api.example.com`
- `app.example.com`
- `mail.example.com`
- Wildcard certificates: `*.example.com`

### 3. Set Calendar Reminders

In addition to monitoring alerts:
- Add renewal dates to team calendar
- Set reminders 45, 30, 14 days before
- Assign certificate ownership

### 4. Document Your Certificates

Track:
| Domain | Issuer | Expires | Auto-Renew | Owner |
|--------|--------|---------|------------|-------|
| example.com | Let's Encrypt | 2025-03-15 | Yes | DevOps |
| api.example.com | DigiCert | 2025-06-01 | No | Security |

### 5. Test After Renewal

After renewing:
1. Verify certificate installed correctly
2. Check intermediate certificates
3. Test from multiple browsers
4. Confirm monitoring shows valid

## Common SSL Issues

### Issue: Certificate Not Trusted

**Symptoms:**
- Browser shows "Not Secure"
- API calls fail with SSL error

**Causes:**
- Self-signed certificate
- Missing intermediate certificates
- Certificate for wrong domain

**Fix:**
1. Use a trusted CA (Let's Encrypt is free)
2. Install complete certificate chain
3. Verify certificate matches domain

### Issue: Mixed Content

**Symptoms:**
- Some resources load over HTTP
- Browser shows partial security

**Not an SSL monitoring issue**, but related. Ensure all resources use HTTPS.

### Issue: Certificate Mismatch

**Symptoms:**
- Browser warns about different domain

**Cause:**
- Certificate issued for `example.com` but accessed via `www.example.com`

**Fix:**
- Use certificate covering all domains (SAN)
- Or wildcard certificate (`*.example.com`)

## Monitoring Different Certificate Types

### Standard (DV) Certificates

Most common. Uplight monitors these automatically.

### Wildcard Certificates

Cover all subdomains (`*.example.com`):
- Monitor the main domain
- Spot-check key subdomains

### EV Certificates

Extended Validation (green bar in older browsers):
- Same monitoring as standard
- Check company name appears in certificate

### Multi-Domain (SAN) Certificates

One certificate, multiple domains:
- Monitor each domain separately
- One expiration affects all

## Integration with Renewal Systems

### Let's Encrypt + Certbot

Certbot auto-renews. Still monitor because:
- Renewal might fail silently
- DNS changes can break validation
- Server configs might change

### Cloudflare

Cloudflare manages certificates automatically. Monitor:
- Origin certificates (server-side)
- Custom domain certificates
- Client certificate requirements

### AWS Certificate Manager

ACM auto-renews for AWS services. Monitor:
- Non-AWS services using manual certificates
- Certificates exported from ACM

## SSL Monitoring Checklist

### Setup

- [ ] All HTTPS domains added as monitors
- [ ] "Check Domain" enabled on monitors
- [ ] Alert threshold set (30 days recommended)
- [ ] Alert channels configured

### Ongoing

- [ ] Review expiring certificates weekly
- [ ] Verify renewals completed successfully
- [ ] Test certificate chain after renewal
- [ ] Update documentation when certificates change

## What to Do When Certificates Expire

### Immediate Actions

1. **Don't panic** but act fast
2. **Renew the certificate** immediately
3. **Install the new certificate** on your server
4. **Verify it's working** from multiple locations
5. **Clear any caches** (CDN, browser)

### Communication

If customers were affected:
1. Update status page
2. Post incident on social media (if appropriate)
3. Prepare support response template

### Postmortem

1. Why did renewal fail?
2. Why didn't monitoring catch it earlier?
3. What process changes prevent recurrence?

## Summary

SSL monitoring is simple but critical:

1. **Add HTTPS monitors** - Uplight checks SSL automatically
2. **Set alert threshold** - 30 days recommended
3. **Monitor all domains** - Including subdomains
4. **Act on alerts** - Don't ignore expiration warnings
5. **Automate renewal** - But verify with monitoring

Never let a certificate expiration catch you off guard.

## Next Steps

- [Set up uptime monitoring](/docs/monitors)
- [Configure Slack alerts](/integrations/slack-alerts)
- [Create status page](/guides/status-page-setup)
- [Domain expiry monitoring](/guides/domain-monitoring)
