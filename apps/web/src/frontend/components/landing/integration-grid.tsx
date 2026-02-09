"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import DiscordLogo from "../logos/discord";
import GithubLogo from "../logos/github";
import GmailLogo from "../logos/gmail";
import JiraLogo from "../logos/jira";
import LinearLogo from "../logos/linear";
import OpsgenieLogo from "../logos/opsgenie";
import PagerDutyLogo from "../logos/pagerduty";
import SlackLogo from "../logos/slack";
import SmsLogo from "../logos/sms";
import TeamsLogo from "../logos/teams";
import WebhookLogo from "../logos/webhook";

const integrations = [
  { name: "Slack", icon: SlackLogo },
  { name: "Discord", icon: DiscordLogo },
  { name: "Email", icon: GmailLogo },
  { name: "Webhook", icon: WebhookLogo },
  { name: "PagerDuty", icon: PagerDutyLogo },
  { name: "Jira", icon: JiraLogo },
  { name: "Github", icon: GithubLogo },
  { name: "Linear", icon: LinearLogo },
  { name: "SMS", icon: SmsLogo },
  { name: "Teams", icon: TeamsLogo },
  { name: "Opsgenie", icon: OpsgenieLogo },
];

export function IntegrationGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div
      ref={ref}
      className="flex max-w-3xl mx-auto flex-wrap gap-4 items-center justify-center"
    >
      {integrations.map((integration, i) => (
        <motion.div
          key={integration.name}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.3, delay: i * 0.08 }}
          className={
            "group flex h-24 w-24 flex-col items-center justify-center gap-2"
          }
        >
          <integration.icon className="size-6 grayscale sm:size-8 text-muted-foreground group-hover:text-foreground group-hover:grayscale-0 transition-colors" />
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            {integration.name}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
