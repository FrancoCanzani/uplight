import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicy,
  head: () => ({
    meta: [
      { title: "Privacy Policy | Uplight" },
      {
        name: "description",
        content:
          "Privacy Policy for Uplight - Learn how we collect, use, and protect your data.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://uplight.francocanzani.workers.dev/privacy" },
    ],
  }),
});

function PrivacyPolicy() {
  return (
    <div className="min-h-screen font-mono antialiased">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <nav className="mb-8">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </nav>

        <header className="mb-12">
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </header>

        <article className="prose prose-sm prose-neutral dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-medium mb-3">Overview</h2>
            <p className="text-muted-foreground">
              Uplight ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our uptime monitoring service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3">Information We Collect</h2>
            <p className="text-muted-foreground mb-2">We collect information you provide directly:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Account information (email address, password)</li>
              <li>Monitor configurations (URLs, check intervals, notification preferences)</li>
              <li>Team and organization details</li>
              <li>Payment information (processed by third-party providers)</li>
            </ul>
            <p className="text-muted-foreground mt-3 mb-2">We automatically collect:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Usage data (features used, monitors created)</li>
              <li>Device and browser information</li>
              <li>IP addresses and approximate location</li>
              <li>Cookies and similar technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3">How We Use Your Information</h2>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Provide and maintain our monitoring service</li>
              <li>Send alerts and notifications about your monitors</li>
              <li>Process payments and manage your subscription</li>
              <li>Improve and develop new features</li>
              <li>Communicate updates and changes to our service</li>
              <li>Detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3">Data Storage and Security</h2>
            <p className="text-muted-foreground">
              Your data is stored securely using industry-standard encryption. We use Cloudflare's infrastructure to ensure high availability and security. Monitor check data is retained according to your plan's data retention policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3">Data Sharing</h2>
            <p className="text-muted-foreground mb-2">We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Service providers who assist in operating our service</li>
              <li>Integration partners (Slack, Discord) when you connect them</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3">Your Rights</h2>
            <p className="text-muted-foreground mb-2">You have the right to:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              <li>Access and export your data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3">Self-Hosted Instances</h2>
            <p className="text-muted-foreground">
              If you self-host Uplight, you are responsible for your own data storage and privacy practices. This policy applies only to the managed service at uplight.dev.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-3">Contact Us</h2>
            <p className="text-muted-foreground">
              For privacy-related questions, please open an issue on our{" "}
              <a
                href="https://github.com/francocanzani/uplight"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                GitHub repository
              </a>{" "}
              or contact the maintainers directly.
            </p>
          </section>
        </article>

        <footer className="mt-16 pt-8 border-t border-border/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Uplight — Open source uptime monitoring</span>
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
