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
import { useDeleteNotifier } from "../api/use-delete-notifier";
import DiscordNotifierForm from "../forms/discord-notifier-form";
import EmailNotifierForm from "../forms/email-notifier-form";
import GitHubNotifierForm from "../forms/github-notifier-form";
import SlackNotifierForm from "../forms/slack-notifier-form";
import WebhookNotifierForm from "../forms/webhook-notifier-form";
import type { Notifier, NotifierType } from "../schemas";

const NOTIFIER_TYPES: NotifierType[] = [
  "email",
  "slack",
  "discord",
  "webhook",
  "github",
];

const NOTIFIER_TYPE_CONFIG: Record<
  NotifierType,
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

function NotifierFormSheet({
  type,
  existing,
  open,
  onOpenChange,
}: {
  type: NotifierType;
  existing?: Notifier;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const config = NOTIFIER_TYPE_CONFIG[type];

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
            <EmailNotifierForm
              existing={existing}
              onClose={() => onOpenChange(false)}
            />
          )}
          {type === "slack" && (
            <SlackNotifierForm
              existing={existing}
              onClose={() => onOpenChange(false)}
            />
          )}
          {type === "discord" && (
            <DiscordNotifierForm
              existing={existing}
              onClose={() => onOpenChange(false)}
            />
          )}
          {type === "webhook" && (
            <WebhookNotifierForm
              existing={existing}
              onClose={() => onOpenChange(false)}
            />
          )}
          {type === "github" && (
            <GitHubNotifierForm
              existing={existing}
              onClose={() => onOpenChange(false)}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function NotificationsPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/notifications/");
  const { notifiers } = routeApi.useLoaderData();
  const { teamId } = routeApi.useParams();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<NotifierType | null>(null);
  const [editingNotifier, setEditingNotifier] = useState<
    Notifier | undefined
  >();
  const [deletingNotifier, setDeletingNotifier] = useState<Notifier | null>(
    null,
  );

  const deleteMutation = useDeleteNotifier();

  const notifiersByType = useMemo(() => {
    const map = new Map<NotifierType, Notifier>();
    notifiers.forEach((notifier) => {
      map.set(notifier.type, notifier);
    });
    return map;
  }, [notifiers]);

  const handleCardClick = (type: NotifierType) => {
    const existing = notifiersByType.get(type);
    setEditingNotifier(existing);
    setSelectedType(type);
    setSheetOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingNotifier) return;
    deleteMutation.mutate({
      teamId,
      notifierId: deletingNotifier.id,
    });
    setDeletingNotifier(null);
  };

  return (
    <div className="space-y-12 w-full lg:max-w-4xl mx-auto">
      <PageHeader title="Notifications" />
      <div className="grid gap-4 sm:grid-cols-2">
        {NOTIFIER_TYPES.map((type) => {
          const config = NOTIFIER_TYPE_CONFIG[type];
          const Icon = config.icon;
          const existing = notifiersByType.get(type);
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
        <div className="border-dashed flex items-center justify-center border ">
          <p className="text-xs text-muted-foreground">
            More notifiers coming soon
          </p>
        </div>
      </div>

      {selectedType && (
        <NotifierFormSheet
          type={selectedType}
          existing={editingNotifier}
          open={sheetOpen}
          onOpenChange={(open) => {
            setSheetOpen(open);
            if (!open) {
              setSelectedType(null);
              setEditingNotifier(undefined);
            }
          }}
        />
      )}

      <AlertDialog
        open={!!deletingNotifier}
        onOpenChange={(open) => !open && setDeletingNotifier(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notifier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {deletingNotifier?.type}{" "}
              notifier? This action cannot be undone.
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
