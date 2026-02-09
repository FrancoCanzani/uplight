import { useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { useHotkeys } from "react-hotkeys-hook";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCreateMonitor } from "../api/use-create-monitor";
import { expandStatusCodes } from "../utils/expand-status-codes";

export default function MonitorQuickstart() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/");
  const { teamId } = routeApi.useParams();
  const isMobile = useIsMobile();
  const urlSchema = z.url("Please enter a valid URL");

  const [monitorType, setMonitorType] = useState<"http" | "tcp">("http");
  const [url, setUrl] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState<string>("443");
  const [showDialog, setShowDialog] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const createMonitor = useCreateMonitor();

  // Cmd+Shift+K - Open monitor quickstart
  useHotkeys('mod+shift+k', (e) => {
    e.preventDefault();
    if (isMobile) {
      setShowSheet(true);
    } else {
      setShowDialog(true);
    }
  });

  const handleQuickstart = (e: React.FormEvent) => {
    e.preventDefault();

    if (monitorType === "http") {
      const result = urlSchema.safeParse(url.trim());
      if (!result.success) {
        toast.error("Invalid URL", {
          description:
            result.error.issues[0]?.message || "Please enter a valid URL",
        });
        return;
      }

      const validUrl = result.data;
      const hostname = new URL(validUrl).hostname;
      const twoXxCodes = expandStatusCodes(["2xx"]);

      createMonitor.mutate(
        {
          teamId: Number(teamId),
          data: {
            type: "http",
            name: hostname,
            url: validUrl,
            method: "get",
            interval: 60000,
            timeout: 30,
            locations: ["wnam"],
            expectedStatusCodes: twoXxCodes,
            followRedirects: true,
            checkDomain: true,
          },
        },
        {
          onSuccess: () => {
            setUrl("");
            if (isMobile) {
              setShowSheet(false);
            } else {
              setShowDialog(false);
            }
          },
        },
      );
    } else {
      if (!host.trim()) {
        toast.error("Invalid host", {
          description: "Please enter a hostname or IP address",
        });
        return;
      }

      const portNum = parseInt(port, 10);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        toast.error("Invalid port", {
          description: "Port must be a number between 1 and 65535",
        });
        return;
      }

      createMonitor.mutate(
        {
          teamId: Number(teamId),
          data: {
            type: "tcp",
            name: `${host}:${port}`,
            host: host.trim(),
            port: portNum,
            interval: 60000,
            timeout: 30,
            locations: ["wnam"],
          },
        },
        {
          onSuccess: () => {
            setHost("");
            setPort("443");
            if (isMobile) {
              setShowSheet(false);
            } else {
              setShowDialog(false);
            }
          },
        },
      );
    }
  };

  const isPending = createMonitor.isPending;

  return (
    <>
      <Button
        variant="outline"
        size="xs"
        onClick={() => {
          if (isMobile) {
            setShowSheet(true);
          } else {
            setShowDialog(true);
          }
        }}
      >
        Quickstart
      </Button>

      {isMobile ? (
        <Sheet open={showSheet} onOpenChange={setShowSheet}>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Quickstart Monitor</SheetTitle>
              <SheetDescription>
                Quickly create a monitor for HTTP or TCP services. Start
                checking. Configure later.
              </SheetDescription>
            </SheetHeader>
            <div className="p-4 pb-8">
              <Tabs
                value={monitorType}
                onValueChange={(value) =>
                  setMonitorType(value as "http" | "tcp")
                }
              >
                <TabsList className="w-full">
                  <TabsTrigger value="http" className="flex-1">
                    HTTP/HTTPS
                  </TabsTrigger>
                  <TabsTrigger value="tcp" className="flex-1">
                    TCP
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="http" className="mt-4 space-y-3">
                  <form onSubmit={handleQuickstart} className="space-y-3">
                    <Input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      autoComplete="off"
                      disabled={isPending}
                      className="w-full"
                      autoFocus
                    />
                    <Button
                      type="submit"
                      disabled={isPending || !url.trim()}
                      className="w-full text-xs"
                    >
                      {isPending ? "Creating..." : "Create Monitor"}
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="tcp" className="mt-4 space-y-3">
                  <form onSubmit={handleQuickstart} className="space-y-3">
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <Input
                        type="text"
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                        placeholder="example.com or 192.168.1.1"
                        autoComplete="off"
                        disabled={isPending}
                      />
                      <Input
                        type="number"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                        placeholder="443"
                        min="1"
                        max="65535"
                        autoComplete="off"
                        disabled={isPending}
                        className="w-24"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isPending || !host.trim() || !port.trim()}
                      className="w-full text-xs"
                    >
                      {isPending ? "Creating..." : "Create Monitor"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Quickstart Monitor</DialogTitle>
              <DialogDescription>
                Quickly create a monitor for HTTP or TCP services. Start
                checking. Configure later.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <Tabs
                value={monitorType}
                onValueChange={(value) =>
                  setMonitorType(value as "http" | "tcp")
                }
              >
                <TabsList className="w-full">
                  <TabsTrigger value="http" className="flex-1">
                    HTTP/HTTPS
                  </TabsTrigger>
                  <TabsTrigger value="tcp" className="flex-1">
                    TCP
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="http" className="mt-4 space-y-3">
                  <form onSubmit={handleQuickstart} className="space-y-3">
                    <Input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      autoComplete="off"
                      disabled={isPending}
                      className="w-full"
                    />
                    <Button
                      type="submit"
                      disabled={isPending || !url.trim()}
                      className="w-full text-xs"
                    >
                      {isPending ? "Creating..." : "Create Monitor"}
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="tcp" className="mt-4 space-y-3">
                  <form onSubmit={handleQuickstart} className="space-y-3">
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <Input
                        type="text"
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                        placeholder="example.com or 192.168.1.1"
                        autoComplete="off"
                        disabled={isPending}
                      />
                      <Input
                        type="number"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                        placeholder="443"
                        min="1"
                        max="65535"
                        autoComplete="off"
                        disabled={isPending}
                        className="w-24"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isPending || !host.trim() || !port.trim()}
                      className="w-full text-xs"
                    >
                      {isPending ? "Creating..." : "Create Monitor"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
