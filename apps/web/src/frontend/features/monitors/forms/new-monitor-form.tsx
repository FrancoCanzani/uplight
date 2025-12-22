import { useState } from "react";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { HttpMonitorForm } from "./http-monitor-form";
import { TcpMonitorForm } from "./tcp-monitor-form";

type MonitorType = "http" | "tcp";

export function NewMonitorForm() {
  const [monitorType, setMonitorType] = useState<MonitorType>("http");

  return (
    <div className="space-y-8 w-full md:max-w-4xl">
      <div>
        <FieldGroup>
          <FieldSet>
            <div>
              <FieldLabel>Monitor type</FieldLabel>
              <FieldDescription>
                Select the protocol we will use to monitor your service.
              </FieldDescription>
            </div>
            <RadioGroup
              value={monitorType}
              onValueChange={(value) => setMonitorType(value as MonitorType)}
              className="flex flex-col sm:flex-row"
            >
              <FieldLabel htmlFor="http">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>HTTP/HTTPS</FieldTitle>
                    <FieldDescription>
                      Monitor web services, APIs, and HTTP endpoints. Checks
                      response status, headers, and content.
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value="http" id="http" />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="tcp">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>TCP</FieldTitle>
                    <FieldDescription>
                      Monitor TCP connections to servers, databases, and custom
                      ports. Verifies port availability and connectivity.
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value="tcp" id="tcp" />
                </Field>
              </FieldLabel>
            </RadioGroup>
          </FieldSet>
        </FieldGroup>
      </div>

      <div>
        {monitorType === "http" ? <HttpMonitorForm /> : <TcpMonitorForm />}
      </div>
    </div>
  );
}
