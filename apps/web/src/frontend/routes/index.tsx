import { createFileRoute, Link } from "@tanstack/react-router";
import { useTeams } from "@/features/teams/api/use-teams";
import { useSession } from "@/lib/auth/client";
import { AnimatedMonitorDemo } from "@/components/motion/animated-status-check";
import { motion } from "motion/react";
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
} from "lucide-react";
import {
  SEOHead,
  createFAQSchema,
  createSoftwareApplicationSchema,
} from "@/components/seo";
import "../index.css";

export const Route = createFileRoute("/")({
  component: Index,
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

const faqs = [
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

function Index() {
  const { data: session } = useSession();
  const { data: teams } = useTeams();
  const firstTeamId = teams?.[0]?.id;

  const faqSchema = createFAQSchema(faqs);
  const softwareSchema = createSoftwareApplicationSchema();
  const combinedSchema = [faqSchema, softwareSchema];

  return (
    <>
      <SEOHead
        title="Open Source Uptime Monitoring"
        description="Monitor your services from multiple regions. Get instant alerts via Slack, Discord, or email when something breaks. Keep users informed with public status pages."
        canonical="https://uplight.dev"
        jsonLd={combinedSchema}
      />
      <div className="min-h-screen font-mono antialiased">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation */}
        <nav className="flex justify-between items-center mb-20 sm:mb-28">
          <span className="text-sm tracking-tight font-medium">uplight</span>
          <div className="flex items-center gap-4">
            {session?.user && firstTeamId ? (
              <Link
                to="/$teamId/monitors"
                params={{ teamId: firstTeamId.toString() }}
                className="text-xs hover:underline"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link className="text-xs hover:underline" to="/login">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-xs px-3 py-1.5 bg-foreground text-background hover:opacity-90 transition-opacity"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero */}
        <section className="mb-20 sm:mb-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-xs text-muted-foreground mb-4 block">
                  Open source uptime monitoring
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight mb-6 leading-[1.1]">
                  Know before your
                  <br />
                  customers do.
                </h1>
                <p className="text-sm text-muted-foreground mb-8 max-w-md leading-relaxed">
                  Monitor your services from multiple regions around the world.
                  Get instant alerts when something breaks. Keep users informed
                  with status pages.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/signup"
                    className="text-xs px-4 py-2 bg-foreground text-background hover:opacity-90 transition-opacity"
                  >
                    Start monitoring
                  </Link>
                  <a
                    href="https://github.com/francocanzani/uplight"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-4 py-2 ring-1 ring-foreground/10 hover:bg-surface transition-colors inline-flex items-center gap-2"
                  >
                    <Github className="size-3" />
                    View source
                  </a>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex justify-center lg:justify-end"
            >
              <AnimatedMonitorDemo />
            </motion.div>
          </div>
        </section>

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mb-20 sm:mb-28"
        >
          <div className="inline-flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-green-500" />
              Self-hostable
            </span>
            <span className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-green-500" />
              Open source
            </span>
            <span className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-green-500" />
              No vendor lock-in
            </span>
          </div>
        </motion.div>

        {/* Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-20 sm:mb-28"
        >
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-2xl font-light tracking-tight mb-3">
              Everything you need
            </h2>
            <p className="text-sm text-muted-foreground">
              Simple, reliable monitoring without the complexity.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border ring-1 ring-foreground/10">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
                className="bg-background p-6 hover:bg-surface transition-colors group"
              >
                <feature.icon className="size-4 text-muted-foreground group-hover:text-foreground transition-colors mb-3" />
                <h3 className="text-sm font-medium mb-2">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How it works */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-20 sm:mb-28"
        >
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-2xl font-light tracking-tight mb-3">
              How it works
            </h2>
            <p className="text-sm text-muted-foreground">
              Get started in under a minute.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
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
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
                className="text-center sm:text-left"
              >
                <span className="text-xs text-muted-foreground mb-2 block">
                  {item.step}
                </span>
                <h3 className="text-sm font-medium mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mb-20 sm:mb-28"
        >
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-2xl font-light tracking-tight mb-3">
              Questions & answers
            </h2>
            <p className="text-sm text-muted-foreground">
              Common questions about Uplight.
            </p>
          </div>

          <Accordion className="ring-1 ring-foreground/10 border-0">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={i}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center mb-20 sm:mb-28"
        >
          <div className="ring-1 ring-foreground/10 bg-surface/50 p-8 sm:p-12">
            <h2 className="text-xl sm:text-2xl font-light tracking-tight mb-3">
              Start monitoring today
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Free to use, open source, and ready to deploy. No credit card
              required.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/signup"
                className="text-xs px-4 py-2 bg-foreground text-background hover:opacity-90 transition-opacity"
              >
                Create free account
              </Link>
              <a
                href="https://github.com/francocanzani/uplight"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-4 py-2 ring-1 ring-foreground/10 hover:bg-surface transition-colors"
              >
                Self-host instead
              </a>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="border-t border-border/30 pt-8 pb-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <span>Uplight — Open source uptime monitoring</span>
            <div className="flex items-center gap-4">
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
        </footer>
      </div>
    </div>
    </>
  );
}
