import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(dashboard)/$teamId/incidents/$incidentId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>H!</div>
}
