import { createFileRoute, Link } from "@tanstack/react-router";
import { useTeams } from "@/features/teams/api/use-teams";
import { useSession } from "@/lib/auth/client";
import { AnimatedMonitorDemo } from "@/components/motion/animated-status-check";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Globe,
  Bell,
  Shield,
  Users,
  Clock,
  FileText,
  Github,
  ArrowRight,
} from "lucide-react";
import {
  createFAQSchema,
  createSoftwareApplicationSchema,
} from "@/components/seo";
import {
  ScrollReveal,
  HeroStats,
  IntegrationGrid,
  GitHubStats,
  TerminalCTA,
} from "@/components/landing";
import "../index.css";

const faqSchemaData = [
  {
    question: "What types of services can I monitor?",
    answer:
      "Uplight supports HTTP/HTTPS endpoints, TCP services, and can verify SSL certificates. You can monitor websites, APIs, databases, game servers, or any service that accepts network connections.",
  },
  {
    question: "How does multi-region monitoring work?",
    answer:
      "When you create a monitor, you select which regions should check your service. Each region independently sends requests and reports results. This helps you detect regional outages and ensures your service is accessible globally.",
  },
  {
    question: "Can I self-host Uplight?",
    answer:
      "Yes. Uplight is 100% open source and designed to be self-hosted. Deploy it on your own infrastructure using Cloudflare Workers, or run it locally for development. You own your data.",
  },
  {
    question: "What alerting integrations are available?",
    answer:
      "We support Slack, Discord, email, and generic webhooks. You can configure multiple notification channels per monitor and set up escalation policies for critical services.",
  },
  {
    question: "Is there a free tier?",
    answer:
      "The self-hosted version is completely free with no limitations. For the managed service, we offer a generous free tier with up to 5 monitors and 5-minute check intervals.",
  },
  {
    question: "How are status pages customized?",
    answer:
      "Each status page gets a unique URL and can be customized with your branding. Group monitors by service, add descriptions, and optionally show historical uptime data to your users.",
  },
];

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Uplight - Open Source Uptime Monitoring" },
      {
        name: "description",
        content:
          "Monitor your services from multiple regions. Get instant alerts via Slack, Discord, or email when something breaks. Keep users informed with public status pages.",
      },
      { property: "og:title", content: "Uplight - Open Source Uptime Monitoring" },
      {
        property: "og:description",
        content:
          "Monitor your services from multiple regions. Get instant alerts via Slack, Discord, or email when something breaks. Keep users informed with public status pages.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://uplight.dev" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify([
          createFAQSchema(faqSchemaData),
          createSoftwareApplicationSchema(),
        ]),
      },
    ],
  }),
});

const features = [
  {
    icon: Globe,
    title: "Multi-region monitoring",
    description:
      "Check your services from 9+ global locations simultaneously. Detect regional outages before they affect all users.",
  },
  {
    icon: Bell,
    title: "Instant alerts",
    description:
      "Get notified via Slack, Discord, email, or webhooks the moment something goes wrong. No more finding out from customers.",
  },
  {
    icon: Clock,
    title: "30-second intervals",
    description:
      "Monitor as frequently as every 30 seconds. Catch issues fast, resolve them faster.",
  },
  {
    icon: FileText,
    title: "Public status pages",
    description:
      "Beautiful, customizable status pages to keep your users informed. Build trust with transparency.",
  },
  {
    icon: Shield,
    title: "SSL & domain expiry",
    description:
      "Never let a certificate expire again. Get alerts days before your SSL or domain renewals are due.",
  },
  {
    icon: Users,
    title: "Team collaboration",
    description:
      "Invite your team, assign monitors, and share responsibility. Everyone stays in the loop.",
  },
];

const faqs = faqSchemaData;

function Index() {
  const { data: session } = useSession();
  const { data: teams } = useTeams();
  const firstTeamId = teams?.[0]?.id;

  return (
    <div className="min-h-screen antialiased bg-noise">
      <main>
      {/* Hero Section - Full width with gradient */}
      <div className="relative hero-gradient">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          {/* Navigation */}
          <nav className="flex justify-between items-center py-6">
            <span className="font-editorial text-lg tracking-editorial">uplight</span>
            <div className="flex items-center gap-4">
              {session?.user && firstTeamId ? (
                <Link
                  to="/$teamId/monitors"
                  params={{ teamId: firstTeamId.toString() }}
                  className="text-sm hover:text-muted-foreground transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    className="text-sm hover:text-muted-foreground transition-colors"
                    to="/login"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="text-sm px-4 py-2 bg-foreground text-background hover:opacity-90 transition-opacity"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Hero Content */}
          <section className="pt-16 sm:pt-24 pb-20 sm:pb-32">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="inline-flex items-center gap-2 text-xs text-muted-foreground mb-6 font-mono">
                    <span className="size-1.5 rounded-full bg-green-700 animate-pulse" />
                    Open source uptime monitoring
                  </span>
                  <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-editorial mb-6 leading-[1.05]">
                    Your infrastructure,
                    <br />
                    <span className="italic">always visible.</span>
                  </h1>
                  <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
                    Monitor your services from multiple regions around the world.
                    Get instant alerts when something breaks. Keep users informed
                    with status pages.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/signup"
                      className="group inline-flex items-center gap-2 text-sm px-5 py-2.5 bg-foreground text-background hover:opacity-90 transition-opacity"
                    >
                      Start monitoring
                      <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <a
                      href="https://github.com/francocanzani/uplight"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm px-5 py-2.5 ring-1 ring-foreground/10 hover:bg-surface transition-colors inline-flex items-center gap-2"
                    >
                      <Github className="size-4" />
                      View source
                    </a>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="flex justify-center lg:justify-end"
              >
                <AnimatedMonitorDemo />
              </motion.div>
            </div>
          </section>
        </div>
      </div>

      {/* Stats Bar */}
      <ScrollReveal className="border-y border-border/30 bg-surface/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <HeroStats />
        </div>
      </ScrollReveal>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Features */}
        <section className="py-20 sm:py-28">
          <ScrollReveal className="text-center mb-16">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block font-mono">
              Features
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl tracking-editorial mb-4">
              Everything you need
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Simple, reliable monitoring without the complexity.
            </p>
          </ScrollReveal>

          <FeaturesGrid features={features} />
        </section>

        {/* How it works */}
        <section className="py-20 sm:py-28 border-t border-border/30">
          <ScrollReveal className="text-center mb-16">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block font-mono">
              Getting started
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl tracking-editorial mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Get started in under a minute.
            </p>
          </ScrollReveal>

          <HowItWorksTimeline />
        </section>

        {/* Integrations */}
        <section className="py-20 sm:py-28 border-t border-border/30">
          <ScrollReveal className="text-center mb-16">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block font-mono">
              Integrations
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl tracking-editorial mb-4">
              Connect to your stack
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Get alerts where you already work.
            </p>
          </ScrollReveal>

          <IntegrationGrid />
        </section>

        {/* GitHub Stats / Social Proof */}
        <section className="py-20 sm:py-28 border-t border-border/30">
          <ScrollReveal className="text-center mb-16">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block font-mono">
              Community
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl tracking-editorial mb-4">
              Built by developers
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Join the growing community of developers using Uplight.
            </p>
          </ScrollReveal>

          <GitHubStats />
        </section>

        {/* FAQ */}
        <section className="py-20 sm:py-28 border-t border-border/30">
          <ScrollReveal className="text-center mb-16">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block font-mono">
              FAQ
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl tracking-editorial mb-4">
              Questions & answers
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Common questions about Uplight.
            </p>
          </ScrollReveal>

          <FAQSection faqs={faqs} />
        </section>
      </div>

      {/* CTA Section - Full width dark */}
      <section className="bg-foreground text-background py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl tracking-editorial mb-4">
                Start monitoring
                <br />
                <span className="italic">in 60 seconds</span>
              </h2>
              <p className="text-background/70 mb-8 max-w-md">
                Free to use, open source, and ready to deploy. No credit card
                required.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/signup"
                  className="text-sm px-5 py-2.5 bg-background text-foreground hover:opacity-90 transition-opacity"
                >
                  Create free account
                </Link>
                <a
                  href="https://github.com/francocanzani/uplight"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm px-5 py-2.5 ring-1 ring-background/20 hover:ring-background/40 transition-colors"
                >
                  Self-host instead
                </a>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <TerminalCTA />
            </ScrollReveal>
          </div>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <span className="font-editorial text-lg mb-4 block">Uplight</span>
              <p className="text-sm text-muted-foreground">
                Open source uptime monitoring for modern teams.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/guides" className="hover:text-foreground transition-colors">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link to="/use-cases" className="hover:text-foreground transition-colors">
                    Use Cases
                  </Link>
                </li>
                <li>
                  <Link to="/compare" className="hover:text-foreground transition-colors">
                    Compare
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-sm">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="https://github.com/francocanzani/uplight"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/francocanzani/uplight#readme"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="/api/docs" className="hover:text-foreground transition-colors">
                    API Reference
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/privacy" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/30 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} Uplight. Open source under MIT license.</span>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/francocanzani/uplight"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <Link to="/login" className="hover:text-foreground transition-colors">
                Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeaturesGrid({
  features,
}: {
  features: typeof import("./index").features;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div
      ref={ref}
      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/50 ring-1 ring-border/50"
    >
      {features.map((feature, i) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          className="relative bg-background p-6 sm:p-8 hover:bg-surface/50 transition-colors group"
        >
          <span className="feature-number">{String(i + 1).padStart(2, "0")}</span>
          <feature.icon
            className="size-5 text-muted-foreground group-hover:text-foreground transition-colors mb-4"
            strokeWidth={1.5}
          />
          <h3 className="font-medium mb-2">{feature.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {feature.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

function HowItWorksTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const steps = [
    {
      step: "01",
      title: "Add your endpoints",
      description:
        "Enter the URLs or IP addresses you want to monitor. Configure check intervals and regions.",
    },
    {
      step: "02",
      title: "Set up alerts",
      description:
        "Connect Slack, Discord, or email. Choose who gets notified and when.",
    },
    {
      step: "03",
      title: "Stay informed",
      description:
        "Watch real-time status, review incident history, and share public status pages.",
    },
  ];

  return (
    <div ref={ref} className="relative">
      {/* Connection line */}
      <div className="hidden sm:block absolute top-12 left-0 right-0 h-px bg-border/50" />

      <div className="grid sm:grid-cols-3 gap-8 sm:gap-12">
        {steps.map((item, i) => (
          <motion.div
            key={item.step}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: i * 0.15 }}
            className="relative"
          >
            <div className="sm:text-center">
              <div className="inline-flex items-center justify-center size-10 rounded-full bg-surface ring-1 ring-border/50 mb-4 relative z-10">
                <span className="font-editorial text-lg">{i + 1}</span>
              </div>
              <h3 className="font-medium mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function FAQSection({ faqs }: { faqs: typeof faqSchemaData }) {
  return (
    <Accordion className="ring-1 ring-border/50">
      {faqs.map((faq, i) => (
        <AccordionItem key={i} value={i}>
          <AccordionTrigger className="text-left">
            <span className="flex items-start gap-4">
              <span className="font-mono text-xs text-muted-foreground mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{faq.question}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-muted-foreground pl-8">{faq.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
