import { PageHeader } from "@/components/page-header";
import { HeartbeatForm } from "../forms/heartbeat-form";

export default function NewHeartbeatPage() {
  return (
    <div className="space-y-10 w-full md:max-w-4xl mx-auto">
      <PageHeader title="New Heartbeat" />
      <HeartbeatForm />
    </div>
  );
}
