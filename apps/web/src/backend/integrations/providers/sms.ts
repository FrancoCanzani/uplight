import { z } from "@hono/zod-openapi";
import type { IntegrationMessage, IntegrationProvider } from "../types";

export const SmsConfigSchema = z
  .object({
    accountSid: z.string().min(1, "Account SID is required"),
    authToken: z.string().min(1, "Auth Token is required"),
    fromNumber: z
      .string()
      .regex(/^\+[1-9]\d{1,14}$/, "Must be E.164 format (+1234567890)"),
    toNumbers: z
      .array(z.string().regex(/^\+[1-9]\d{1,14}$/, "Must be E.164 format"))
      .min(1, "At least one phone number is required")
      .max(10, "Maximum 10 phone numbers allowed"),
  })
  .openapi("SmsConfig");

export type SmsConfig = z.infer<typeof SmsConfigSchema>;

function formatSmsMessage(message: IntegrationMessage): string {
  if (message.type === "alert") {
    return `[ALERT] ${message.monitorName} is DOWN\nCause: ${message.cause}\nID: #${message.incidentId}`.slice(
      0,
      160,
    );
  }
  const duration = message.duration
    ? `${Math.floor(message.duration / 60000)}m`
    : "";
  return `[OK] ${message.monitorName} is UP\nDowntime: ${duration}`.slice(
    0,
    160,
  );
}

export const smsProvider: IntegrationProvider<SmsConfig> = {
  type: "sms",
  configSchema: SmsConfigSchema,

  async send(config: SmsConfig, message: IntegrationMessage, _env: Env) {
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
    const auth = btoa(`${config.accountSid}:${config.authToken}`);
    const body = formatSmsMessage(message);

    const results = await Promise.allSettled(
      config.toNumbers.map((to) =>
        fetch(twilioUrl, {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: to,
            From: config.fromNumber,
            Body: body,
          }),
        }),
      ),
    );

    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length === results.length) {
      throw new Error("All SMS sends failed");
    }
  },
};
