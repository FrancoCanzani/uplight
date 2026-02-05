import { Link } from "@tanstack/react-router";

export function MachineView() {
  return (
    <div className="min-h-screen bg-background font-classic">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <pre className="whitespace-pre-wrap text-[10px] sm:text-xs md:text-sm leading-relaxed text-foreground overflow-x-hidden wrap-break-word">
          {`UPLIGHT                                                    https://uplight.dev
================================================================================

Open source uptime monitoring for modern teams.

================================================================================
OVERVIEW
--------------------------------------------------------------------------------

Product              :    Uplight - Infrastructure Monitoring Platform
Type                 :    Open Source / Self-Hostable
License              :    MIT
Repository           :    https://github.com/francocanzani/uplight

Description          :    Monitor your services from multiple regions around
                          the world. Get instant alerts when something breaks.
                          Keep users informed with status pages.

--------------------------------------------------------------------------------
CAPABILITIES
--------------------------------------------------------------------------------

Monitoring Types     :    HTTP/HTTPS endpoints
                          TCP services
                          SSL certificate verification

Check Intervals      :    Minimum 30 seconds
Regions              :    9+ global locations
Status Pages         :    Public, customizable

================================================================================
FEATURES
================================================================================

01. MULTI-REGION MONITORING
--------------------------------------------------------------------------------
    Check your services from 9+ global locations simultaneously.
    Detect regional outages before they affect all users.

02. INSTANT ALERTS
--------------------------------------------------------------------------------
    Get notified via Slack, Discord, email, or webhooks the moment
    something goes wrong. No more finding out from customers.

03. 30-SECOND INTERVALS
--------------------------------------------------------------------------------
    Monitor as frequently as every 30 seconds.
    Catch issues fast, resolve them faster.

04. PUBLIC STATUS PAGES
--------------------------------------------------------------------------------
    Beautiful, customizable status pages to keep your users informed.
    Build trust with transparency.

05. SSL & DOMAIN EXPIRY
--------------------------------------------------------------------------------
    Never let a certificate expire again. Get alerts days before
    your SSL or domain renewals are due.

06. TEAM COLLABORATION
--------------------------------------------------------------------------------
    Invite your team, assign monitors, and share responsibility.
    Everyone stays in the loop.

================================================================================
HOW IT WORKS
================================================================================

STEP 01              :    Add your endpoints
                          Enter the URLs or IP addresses you want to monitor.
                          Configure check intervals and regions.

STEP 02              :    Set up alerts
                          Connect Slack, Discord, or email.
                          Choose who gets notified and when.

STEP 03              :    Stay informed
                          Watch real-time status, review incident history,
                          and share public status pages.

================================================================================
INTEGRATIONS
================================================================================

Notification         :    Slack
Channels                  Discord
                          Email
                          Webhooks
                          PagerDuty
                          Telegram

================================================================================
DEPLOYMENT
================================================================================

Self-Host            :    Yes - 100% open source
Platform             :    Cloudflare Workers
One-Click Deploy     :    https://deploy.workers.cloudflare.com/?url=
                          https://github.com/francocanzani/uplight

Commands             :    git clone https://github.com/francocanzani/uplight
                          cd uplight
                          npm install
                          npm run deploy

================================================================================
FAQ
================================================================================

Q: What types of services can I monitor?
A: Uplight supports HTTP/HTTPS endpoints, TCP services, and can verify SSL
   certificates. You can monitor websites, APIs, databases, game servers,
   or any service that accepts network connections.

Q: How does multi-region monitoring work?
A: When you create a monitor, you select which regions should check your
   service. Each region independently sends requests and reports results.
   This helps you detect regional outages and ensures your service is
   accessible globally.

Q: Can I self-host Uplight?
A: Yes. Uplight is 100% open source and designed to be self-hosted. Deploy
   it on your own infrastructure using Cloudflare Workers, or run it locally
   for development. You own your data.

Q: What alerting integrations are available?
A: We support Slack, Discord, email, and generic webhooks. You can configure
   multiple notification channels per monitor and set up escalation policies
   for critical services.

Q: Is there a free tier?
A: The self-hosted version is completely free with no limitations. For the
   managed service, we offer a generous free tier with up to 5 monitors
   and 5-minute check intervals.

Q: How are status pages customized?
A: Each status page gets a unique URL and can be customized with your
   branding. Group monitors by service, add descriptions, and optionally
   show historical uptime data to your users.

================================================================================
LINKS
================================================================================

Homepage             :    https://uplight.dev
Sign Up              :    https://uplight.dev/signup
Login                :    https://uplight.dev/login
GitHub               :    https://github.com/francocanzani/uplight
Documentation        :    https://github.com/francocanzani/uplight#readme
API Reference        :    https://uplight.dev/api/docs
Guides               :    https://uplight.dev/guides
Use Cases            :    https://uplight.dev/use-cases
Compare              :    https://uplight.dev/compare

================================================================================
LEGAL
================================================================================

Privacy Policy       :    https://uplight.dev/privacy
Terms of Service     :    https://uplight.dev/terms
License              :    MIT

================================================================================
                     (c) ${new Date().getFullYear()} Uplight. Open source under MIT license.
================================================================================
`}
        </pre>

        <nav className="mt-12 pt-8 border-t border-border/30 flex flex-wrap gap-4 text-sm">
          <Link to="/signup" className="underline">
            Sign up
          </Link>
          <Link to="/login" className="underline">
            Login
          </Link>
          <a
            href="https://github.com/francocanzani/uplight"
            className="underline"
          >
            GitHub
          </a>
          <Link to="/guides" className="underline">
            Guides
          </Link>
          <Link to="/use-cases" className="underline">
            Use Cases
          </Link>
          <Link to="/compare" className="underline">
            Compare
          </Link>
        </nav>
      </div>
    </div>
  );
}
