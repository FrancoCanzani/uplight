import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { getRouteApi, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { z } from "zod";
import { useCreateMonitor } from "../api/use-create-monitor";
import { expandStatusCodes } from "../utils/expand-status-codes";
import MonitorsTable from "./monitors-table";

const urlSchema = z.url("Please enter a valid URL");

export default function MonitorsPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/");
  const { teamId } = routeApi.useParams();
  const [mode, setMode] = useState<"new" | "quickstart">("new");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createMonitor = useCreateMonitor();

  const handleQuickstart = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = urlSchema.safeParse(url.trim());
    if (!result.success) {
      setError(result.error.issues[0]?.message || "Invalid URL");
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
          verifySSL: true,
          checkDNS: true,
          checkDomain: true,
        },
      },
      {
        onSuccess: () => {
          setUrl("");
          setError(null);
        },
        onError: () => {
          setError(null);
        },
      },
    );
  };

  const isPending = createMonitor.isPending;

  return (
    <div className="space-y-12 w-full lg:max-w-4xl mx-auto">
      <header className="w-full">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl tracking-tight text-balance">Monitors</h1>
          <div className="flex items-center gap-2 flex-1 justify-end max-w-2xl">
            <Button
              variant="secondary"
              size="xs"
              render={
                <Link to="/$teamId/monitors/new" params={{ teamId }}>
                  New Monitor
                </Link>
              }
            />

            <Button
              variant={mode === "quickstart" ? "default" : "outline"}
              size="xs"
              onClick={() =>
                setMode(mode === "quickstart" ? "new" : "quickstart")
              }
            >
              Quickstart
            </Button>

            <AnimatePresence>
              {mode === "quickstart" && (
                <motion.form
                  key="quickstart-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  onSubmit={handleQuickstart}
                  className="flex-1 max-w-sm"
                >
                  <InputGroup className="h-7">
                    <InputGroupInput
                      type="url"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        setError(null);
                      }}
                      placeholder="https://example.com"
                      autoComplete="off"
                      disabled={isPending}
                      aria-invalid={!!error}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        type="submit"
                        disabled={isPending || !url.trim()}
                      >
                        {isPending ? "Creating..." : "Save"}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  {error && (
                    <p className="text-xs text-destructive mt-1">{error}</p>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
      <MonitorsTable />
    </div>
  );
}
