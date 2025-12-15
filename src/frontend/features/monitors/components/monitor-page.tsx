import { getRouteApi } from "@tanstack/react-router";

export default function MonitorPage() {
  const routeApi = getRouteApi("/(dashboard)/$teamId/monitors/$monitorId/");
  const monitor = routeApi.useLoaderData();

  const { teamId, monitorId } = routeApi.useParams();

  return <div>Some shit</div>;
}
