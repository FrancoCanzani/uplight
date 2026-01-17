import { useMemo } from "react";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import getLocationLabel from "@/features/monitors/utils/get-location-label";
import { formatDate } from "@/lib/utils";
import { useCheckDetail } from "../api/use-check-detail";
import { useInfiniteChecks } from "../api/use-infinite-checks";

const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/$monitorId/");

export function CheckDetailSheet() {
  const { teamId, monitorId } = routeApi.useParams();
  const search = routeApi.useSearch() || {};
  const navigate = useNavigate();

  const {
    data: checkDetail,
    isLoading,
    error,
  } = useCheckDetail(teamId, monitorId, search.checkId);

  const { data } = useInfiniteChecks({
    teamId,
    monitorId,
    days: Number(search.period || 7),
    result: search.checkResult,
    location: search.checkLocation,
    dateFrom: search.checkDateFrom,
    dateTo: search.checkDateTo,
  });

  const checks = useMemo(() => {
    return data?.pages.flatMap((page) => page.checks) ?? [];
  }, [data]);

  const currentIndex =
    checks.findIndex((check) => check.id === Number(search.checkId)) ?? -1;
  const hasNext = currentIndex >= 0 && currentIndex < checks.length - 1;
  const hasPrev = currentIndex > 0;

  const nextCheckId = hasNext ? checks[currentIndex + 1]?.id : undefined;
  const prevCheckId = hasPrev ? checks[currentIndex - 1]?.id : undefined;

  const handleClose = () => {
    navigate({
      to: "/$teamId/monitors/$monitorId",
      params: { teamId, monitorId },
      search: (prev) => {
        if (!prev) return {};
        return Object.fromEntries(
          Object.entries(prev).filter(([key]) => key !== "checkId"),
        );
      },
    });
  };

  const handleNext = () => {
    if (nextCheckId) {
      navigate({
        to: "/$teamId/monitors/$monitorId",
        params: { teamId, monitorId },
        search: (prev) => ({ ...prev, checkId: String(nextCheckId) }),
      });
    }
  };

  const handlePrev = () => {
    if (prevCheckId) {
      navigate({
        to: "/$teamId/monitors/$monitorId",
        params: { teamId, monitorId },
        search: (prev) => ({ ...prev, checkId: String(prevCheckId) }),
      });
    }
  };

  if (!search.checkId) return null;

  return (
    <Sheet
      open={!!search.checkId}
      onOpenChange={(open) => !open && handleClose()}
    >
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Check Details</SheetTitle>
          <SheetDescription>
            Check result information and response data
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 h-full flex items-center justify-center">
            <Spinner />
          </div>
        ) : checkDetail ? (
          <div className="flex-1 overflow-y-auto px-4 space-y-4">
            <div className="flex gap-2 justify-between">
              <Button
                variant="outline"
                size="xs"
                onClick={handlePrev}
                disabled={!hasPrev}
              >
                <ChevronLeft className="size-3" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={handleNext}
                disabled={!hasNext}
              >
                Next
                <ChevronRight className="size-3" />
              </Button>
            </div>

            <Section title="General">
              <ConfigItem
                label="Result"
                value={
                  <Badge variant="outline" className="capitalize">
                    {checkDetail.result}
                  </Badge>
                }
              />
              <ConfigItem
                label="Location"
                value={getLocationLabel(checkDetail.location)}
              />
            </Section>

            <Section title="Performance">
              <ConfigItem
                label="Response Time"
                value={`${checkDetail.responseTime}ms`}
                mono
              />
              <ConfigItem
                label="Status Code"
                value={checkDetail.statusCode?.toString() ?? "—"}
                mono
              />
              <ConfigItem
                label="Retry Count"
                value={checkDetail.retryCount.toString()}
                mono
              />
            </Section>

            <Section title="Timing">
              <ConfigItem
                label="Checked At"
                value={formatDate(checkDetail.checkedAt)}
              />
            </Section>

            {checkDetail.errorMessage && (
              <Section title="Error">
                <div className="p-2 bg-destructive/10 border  text-xs  break-words">
                  {checkDetail.errorMessage}
                </div>
              </Section>
            )}

            {checkDetail.responseHeaders && (
              <Section title="Response Headers">
                <div className="p-4 bg-muted/50 border  overflow-x-auto">
                  <div className="space-y-1.5">
                    {Object.entries(checkDetail.responseHeaders).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex items-start gap-4 text-xs  border-b border-border/50 pb-1.5 last:border-0 last:pb-0"
                        >
                          <div className="font-semibold text-foreground shrink-0 min-w-[180px]">
                            {key}:
                          </div>
                          <div className="text-muted-foreground break-all">
                            {value}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </Section>
            )}

            {checkDetail.responseBody && (
              <Section title="Response Body">
                <div className="p-4 bg-muted/50 border  overflow-x-auto max-h-96 overflow-y-auto">
                  <pre className="text-xs  whitespace-pre-wrap break-words text-foreground">
                    {checkDetail.responseBody}
                  </pre>
                </div>
              </Section>
            )}

            {!checkDetail.responseHeaders && !checkDetail.responseBody && (
              <Section title="Response Data">
                <div className="text-xs text-muted-foreground text-center py-4">
                  No response data available
                </div>
              </Section>
            )}
          </div>
        ) : error ? (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="text-center text-destructive">
              {error instanceof Error ? error.message : "Failed to load check"}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="text-center text-xs text-muted-foreground">
              Check not found
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium capitalize tracking-wider">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function ConfigItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  if (!value) return null;

  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span
        className={`text-right ${mono ? " text-[11px]" : ""} break-all`}
      >
        {value}
      </span>
    </div>
  );
}
