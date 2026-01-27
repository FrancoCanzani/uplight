import { useMemo, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { Check } from "lucide-react";
import DiscordLogo from "@/components/logos/discord";
import GithubLogo from "@/components/logos/github";
import GmailLogo from "@/components/logos/gmail";
import SlackLogo from "@/components/logos/slack";
import WebhookLogo from "@/components/logos/webhook";
import { PageHeader } from "@/components/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDeleteIntegration } from "../api/use-delete-integration";
import DiscordIntegrationForm from "../forms/discord-integration-form";
import EmailIntegrationForm from "../forms/email-integration-form";
import GitHubIntegrationForm from "../forms/github-integration-form";
import SlackIntegrationForm from "../forms/slack-integration-form";
import WebhookIntegrationForm from "../forms/webhook-integration-form";
import type { Integration, IntegrationType } from "../schemas";

const INTEGRATION_TYPES: IntegrationType[] = [
  "email",
  "slack",
  "discord",
  "webhook",
  "github",
];

const INTEGRATION_TYPE_CONFIG: Record<
  IntegrationType,
  { label: string; icon: typeof GmailLogo; description: string }
> = {
  email: {
    label: "Email",
    icon: GmailLogo,
    description: "Send notifications via email",
  },
  slack: {
    label: "Slack",
    icon: SlackLogo,
    description: "Post messages to Slack channels",
  },
  discord: {
    label: "Discord",
    icon: DiscordLogo,
    description: "Send messages to Discord webhooks",
  },
  webhook: {
    label: "Webhook",
    icon: WebhookLogo,
    description: "Send HTTP requests to custom endpoints",
  },
  github: {
    label: "GitHub Issues",
    icon: GithubLogo,
    description: "Create GitHub issues from incidents",
  },
};

function IntegrationFormSheet({
  type,
  existing,
  open,
  onOpenChange,
}: {
  type: IntegrationType;
  existing?: Integration;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const config = INTEGRATION_TYPE_CONFIG[type];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={isMobile ? "bottom" : "right"}>
        <SheetHeader>
          <SheetTitle>
            {existing ? `Edit ${config.label}` : `Configure ${config.label}`}
          </SheetTitle>
          <SheetDescription>{config.description}</SheetDescription>
        </SheetHeader>
        <div className="p-4 h-full">
          {type === "email" && (
            <EmailIntegrationForm
              existing={existing}
              onClose={() => onOpenChange(false)}
            />
          )}
          {type === "slack" && (
            <SlackIntegrationForm
              existing={existing}
              onClose={() => onOpenChange(false)}
            />
          )}
          {type === "discord" && (
            <DiscordIntegrationForm
              existing={existing}
              onClose={() => onOpenChange(false)}
            />
          )}
          {type === "webhook" && (
            <WebhookIntegrationForm
              existing={existing}
              onClose={() => onOpenChange(false)}
            />
          )}
          {type === "github" && (
            <GitHubIntegrationForm
              existing={existing}
              onClose={() => onOpenChange(false)}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function IntegrationsPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/integrations/");
  const { integrations } = routeApi.useLoaderData();
  const { teamId } = routeApi.useParams();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<IntegrationType | null>(null);
  const [editingIntegration, setEditingIntegration] = useState<
    Integration | undefined
  >();
  const [deletingIntegration, setDeletingIntegration] = useState<Integration | null>(
    null,
  );

  const deleteMutation = useDeleteIntegration();

  const integrationsByType = useMemo(() => {
    const map = new Map<IntegrationType, Integration>();
    integrations.forEach((integration) => {
      map.set(integration.type, integration);
    });
    return map;
  }, [integrations]);

  const handleCardClick = (type: IntegrationType) => {
    const existing = integrationsByType.get(type);
    setEditingIntegration(existing);
    setSelectedType(type);
    setSheetOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingIntegration) return;
    deleteMutation.mutate({
      teamId,
      integrationId: deletingIntegration.id,
    });
    setDeletingIntegration(null);
  };

  return (
    <div className="space-y-10 w-full lg:max-w-4xl mx-auto">
      <PageHeader title="Integrations" />
      <div className="grid gap-4 sm:grid-cols-2">
        {INTEGRATION_TYPES.map((type) => {
          const config = INTEGRATION_TYPE_CONFIG[type];
          const Icon = config.icon;
          const existing = integrationsByType.get(type);
          const isEnabled = existing?.enabled === true;

          return (
            <Card
              key={type}
              size="sm"
              className="cursor-pointer hover:bg-surface transition-colors"
              onClick={() => handleCardClick(type)}
            >
              <CardHeader>
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="flex items-center justify-start gap-x-1.5">
                        <Icon className="size-4 grayscale shrink-0" />
                        {config.label}
                      </CardTitle>
                      {isEnabled && (
                        <Check className="size-3.5 text-primary shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {config.description}
              </CardContent>
            </Card>
          );
        })}
        <div className="border-dashed flex items-center justify-center border h-full min-h-18">
          <p className="text-xs text-muted-foreground">
            More integrations coming soon
          </p>
        </div>
      </div>

      {selectedType && (
        <IntegrationFormSheet
          type={selectedType}
          existing={editingIntegration}
          open={sheetOpen}
          onOpenChange={(open) => {
            setSheetOpen(open);
            if (!open) {
              setSelectedType(null);
              setEditingIntegration(undefined);
            }
          }}
        />
      )}

      <AlertDialog
        open={!!deletingIntegration}
        onOpenChange={(open) => !open && setDeletingIntegration(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Integration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {deletingIntegration?.type}{" "}
              integration? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
