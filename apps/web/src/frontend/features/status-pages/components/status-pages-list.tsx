import { getRouteApi } from "@tanstack/react-router";
import { StatusPageItem } from "./status-page-item";

const routeApi = getRouteApi("/(dashboard)/$teamId/status-pages/");

export default function StatusPagesList() {
  const pages = routeApi.useLoaderData();

  return (
    <div className="flex flex-col gap-3">
      {pages?.map((page) => (
        <StatusPageItem key={page.id} page={page} />
      ))}
    </div>
  );
}
