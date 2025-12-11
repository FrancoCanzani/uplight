import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewHttpMonitorForm } from "./new-http-monitor-form";
import { NewTcpMonitorForm } from "./new-tcp-monitor-form";

type MonitorType = "http" | "tcp";

export function NewMonitorForm() {
  const [monitorType, setMonitorType] = useState<MonitorType>("http");

  return (
    <div className="mx-auto max-w-3xl">
      <Tabs
        value={monitorType}
        onValueChange={(v) => setMonitorType(v as MonitorType)}
      >
        <TabsList className="mb-6 w-full">
          <TabsTrigger value="http" className="flex-1">
            HTTP Monitor
          </TabsTrigger>
          <TabsTrigger value="tcp" className="flex-1">
            TCP Monitor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="http">
          <NewHttpMonitorForm />
        </TabsContent>

        <TabsContent value="tcp">
          <NewTcpMonitorForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
