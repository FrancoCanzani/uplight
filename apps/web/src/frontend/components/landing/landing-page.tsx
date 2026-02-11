import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Bot, Clock, FileText, Globe, Shield, Users } from "lucide-react";
import { motion, useInView } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTeams } from "@/features/teams/api/use-teams";
import { useSession } from "@/lib/auth/client";
import { Button } from "../ui/button";
import { GitHubStats } from "./github-stats";
import { HeroStats } from "./hero-stats";
import { IntegrationGrid } from "./integration-grid";
import { MachineView } from "./machine-view";
import { ScrollReveal } from "./scroll-reveal";
import { TerminalCTA } from "./terminal-cta";

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

export { faqSchemaData };

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
  {
    icon: Bot,
    title: "AI-ready via MCP",
    description:
      "Query monitors, manage incidents, and check uptime from Claude, Cursor, or any MCP-compatible AI assistant.",
  },
];

function ViewToggle({
  view,
  setView,
}: {
  view: "human" | "machine";
  setView: (view: "human" | "machine") => void;
}) {
  const isHuman = view === "human";
  const isMachine = view === "machine";

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 py-1.5 px-2.5 bg-background ring-1 ring-border text-sm font-classic select-none opacity-50 hover:opacity-100 transition-all">
      <button
        onClick={() => setView("human")}
        className="flex items-center gap-2 cursor-pointer"
      >
        <span className="w-4 h-4 ring-1 ring-foreground/30 flex items-center justify-center">
          {isHuman && (
            <span className="text-foreground text-xs font-bold">x</span>
          )}
        </span>
        <span className={isHuman ? "text-foreground" : "text-muted-foreground"}>
          Human
        </span>
      </button>
      <span className="text-muted-foreground">|</span>
      <button
        onClick={() => setView("machine")}
        className="flex items-center gap-2 cursor-pointer"
      >
        <span
          className={isMachine ? "text-foreground" : "text-muted-foreground"}
        >
          Machine
        </span>
        <span className="w-4 h-4 ring-1 ring-foreground/30 flex items-center justify-center">
          {isMachine && (
            <span className="text-foreground text-xs font-bold">x</span>
          )}
        </span>
      </button>
    </div>
  );
}

export default function LandingPage() {
  const { data: session } = useSession();
  const { data: teams } = useTeams();
  const firstTeamId = teams?.[0]?.id;
  const [view, setView] = useState<"human" | "machine">("human");

  if (view === "machine") {
    return (
      <>
        <MachineView />
        <ViewToggle view={view} setView={setView} />
      </>
    );
  }

  return (
    <div className="min-h-screen antialiased">
      <ViewToggle view={view} setView={setView} />
      <main>
        <div className="relative">
          <div className="absolute inset-0 opacity-50" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
            <nav className="flex justify-between items-center py-6">
              <span className="font-editorial text-2xl tracking-editorial">
                Uplight
              </span>
              <div className="flex items-center gap-4">
                {session?.user && firstTeamId ? (
                  <Link
                    to="/$teamId/monitors"
                    params={{ teamId: firstTeamId.toString() }}
                    className="text-sm hover:underline underline-offset-4"
                    preload={"viewport"}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      className="text-sm hover:underline underline-offset-4"
                      to="/login"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="text-sm hover:underline underline-offset-4"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </nav>

            <section className="pb-32">
              <div
                className="pointer-events-none relative mx-auto max-w-xl opacity-75 mix-blend-darken aspect-3/2"
                style={{
                  maskImage:
                    "radial-gradient(ellipse 35% 75% at center, black, transparent)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse 35% 75% at center, black, transparent)",
                }}
              >
                <div className="bg-background absolute inset-0 mix-blend-overlay" />
                <img
                  src="https://images.unsplash.com/photo-1634595947394-87012e7b12ba?q=80&w=2340&auto=format&fit=crop"
                  alt="watch"
                  className="h-full w-full object-cover invert dark:invert-0 dark:mix-blend-lighten"
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mx-auto max-w-md text-center"
              >
                <h1 className="font-editorial text-4xl sm:text-5xl tracking-editorial mb-4 leading-[1.1]">
                  Ship faster. <span className="italic">We check.</span>
                </h1>
                <p className="text-muted-foreground mb-6">
                  Open source uptime monitoring. Multi-region checks, instant
                  alerts, beautiful status pages.
                </p>

                <div className="flex items-center justify-center gap-3">
                  <a
                    href="https://deploy.workers.cloudflare.com/?url=https://github.com/francocanzani/uplight"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://deploy.workers.cloudflare.com/button"
                      alt="Deploy to Cloudflare"
                      className="h-9.5 rounded-none"
                    />
                  </a>
                  <Button
                    size={"lg"}
                    className={"h-9.5 text-base font-display"}
                    render={<Link to="/signup">Start monitoring</Link>}
                  />
                </div>
              </motion.div>
            </section>
          </div>
        </div>

        <ScrollReveal className="border-y border-border/30 bg-surface/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <HeroStats />
          </div>
        </ScrollReveal>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
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

            <FAQSection faqs={faqSchemaData} />
          </section>
        </div>

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
                  <Button
                    variant={"secondary"}
                    render={<Link to="/signup">Create free account</Link>}
                  />
                  <Button
                    render={
                      <a
                        href="https://github.com/francocanzani/uplight"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Self-host
                      </a>
                    }
                  />
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <TerminalCTA />
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>

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
                  <Link
                    to="/guides"
                    className="hover:text-foreground transition-colors"
                  >
                    Guides
                  </Link>
                </li>
                <li>
                  <Link
                    to="/use-cases"
                    className="hover:text-foreground transition-colors"
                  >
                    Use Cases
                  </Link>
                </li>
                <li>
                  <Link
                    to="/compare"
                    className="hover:text-foreground transition-colors"
                  >
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
                  <a
                    href="/api/docs"
                    className="hover:text-foreground transition-colors"
                  >
                    API Reference
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/30 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <span>
              &copy; {new Date().getFullYear()} Uplight. Open source under MIT
              license.
            </span>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/francocanzani/uplight"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <Link
                to="/login"
                className="hover:text-foreground transition-colors"
              >
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
  features: { title: string; description: string }[];
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
          <span className="absolute top-1.5 right-3 font-editorial text-6xl leading-none opacity-[0.04] dark:opacity-[0.06] pointer-events-none select-none">
            {String(i + 1).padStart(2, "0")}
          </span>
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
              <div className="inline-flex items-center justify-center size-8 rounded-full bg-surface ring-1 ring-border/50 mb-4 relative z-10">
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
    <Accordion className="border-none ring-0">
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
