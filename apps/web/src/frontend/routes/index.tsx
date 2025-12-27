import { Button } from "@/components/ui/button";
import { useTeams } from "@/features/teams/api/use-teams";
import { useSession } from "@/lib/auth/client";
import { createFileRoute, Link } from "@tanstack/react-router";
import "../index.css";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data: session } = useSession();
  const { data: teams } = useTeams();
  const firstTeamId = teams?.[0]?.id;

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-surface">
      <div className="border rounded shadow-xs bg-background">
        <div className="max-w-2xl mx-auto space-y-8">
          <header className="p-4 py-8 flex items-center justify-between">
            <h1 className="font-medium uppercase tracking-wide text-xl">
              Uplight
            </h1>
            <div>
              {session?.user && firstTeamId ? (
                <Link
                  to="/$teamId/monitors"
                  params={{ teamId: firstTeamId.toString() }}
                  className="text-sm hover:underline underline-offset-4"
                >
                  Dashboard →
                </Link>
              ) : (
                <div className="space-x-3">
                  <Button
                    variant={"secondary"}
                    size={"xs"}
                    render={<Link to="/login">Log in</Link>}
                  />
                  <Button
                    variant={"secondary"}
                    size={"xs"}
                    render={<Link to="/signup">Sign up</Link>}
                  />
                </div>
              )}
            </div>
          </header>

          <section className="space-y-6 p-4">
            <h3 className="text-xl">Uplight is:</h3>

            <ol className="pl-4 space-y-2 font-light">
              <li className="list-decimal">
                Uptime monitoring that watches your services and alerts you the
                moment something breaks
              </li>

              <li className="list-decimal">
                A simple dashboard to track response times, incidents, and
                scheduled maintenance
              </li>

              <li className="list-decimal">
                Peace of mind while you sleep—knowing you'll be the first to
                know if your site goes down
              </li>
            </ol>

            <p>If this speaks to you, try it now:</p>

            <div className="border text-sm py-2 px-3 rounded flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">✦</span>
                <div>
                  <p className="font-medium">Premium</p>
                  <p className="text-xs text-muted-foreground">
                    50 monitors, 1-min intervals, every region.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="border px-3 py-1.5 rounded text-xs">
                  $7 / month
                </span>
                <span className="border px-3 py-1.5 rounded text-xs">
                  $70 / year
                </span>
              </div>
            </div>

            <div className="border text-sm py-2 px-3 rounded flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl text-muted-foreground">○</span>
                <div>
                  <p className="font-medium">Free</p>
                  <p className="text-xs text-muted-foreground">
                    Up to 10 monitors, 5-min intervals, 1 region
                  </p>
                </div>
              </div>
              <span className="border px-3 py-1.5 rounded text-xs">
                Free / forever
              </span>
            </div>
          </section>

          <section>
            <div className="grid grid-cols-2 text-sm">
              <div className="hover:bg-surface p-3">
                <p className="text-muted-foreground mb-3">HTTP, TCP & DNS</p>
                <p className="text-foreground/80">
                  Monitor websites, APIs, and any TCP service.
                </p>
              </div>
              <div className="hover:bg-surface p-3">
                <p className="text-muted-foreground mb-3">Multi Region</p>
                <p className="text-foreground/80">
                  Monitor your services from up to 9 global regions.
                </p>
              </div>
              <div className="hover:bg-surface p-3">
                <p className="text-muted-foreground mb-3">Status Pages</p>
                <p className="text-foreground/80">
                  Communicate your incidents more effectively
                </p>
              </div>
              <div className="hover:bg-surface p-4">
                <p className="text-muted-foreground mb-3">Incidents</p>
                <p className="text-foreground/80">
                  Automatic incident detection with full history and resolution
                  tracking.
                </p>
              </div>
              <div className="hover:bg-surface p-3">
                <p className="text-muted-foreground mb-3">SSL & Domain</p>
                <p className="text-foreground/80">
                  Get notified before your certificates or domains expire.
                </p>
              </div>
              <div className="hover:bg-surface p-3">
                <p className="text-muted-foreground mb-3">Teams</p>
                <p className="text-foreground/80">
                  Collaborate with your team. Shared monitors, shared
                  responsibility.
                </p>
              </div>
            </div>
          </section>

          <section className="p-4 ">
            {session?.user && firstTeamId ? (
              <Link
                to="/$teamId/monitors"
                params={{ teamId: firstTeamId.toString() }}
                className="hover:underline underline-offset-4"
              >
                Go to dashboard →
              </Link>
            ) : (
              <div className="flex items-center gap-6">
                <Link
                  to="/signup"
                  className="hover:underline underline-offset-4"
                >
                  Get started
                </Link>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground text-sm">
                  Free to start. No credit card required.
                </span>
              </div>
            )}
          </section>

          <footer className="py-8  text-xs text-muted-foreground">
            <p>Built on Cloudflare Workers</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
