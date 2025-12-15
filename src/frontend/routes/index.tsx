import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTeams } from "@/features/teams/api/use-teams";
import { signOut, useSession } from "@/lib/auth/client";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import "../index.css";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("unknown");
  const { data: session } = useSession();
  const { data: teams } = useTeams();
  const firstTeamId = teams?.[0]?.id;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="p-2 flex gap-2 items-center justify-between border-b">
        <div className="flex gap-2">
          <Link to="/" className="[&.active]:font-bold">
            Home
          </Link>
        </div>
        <div className="flex gap-2 items-center">
          {session?.user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {session.user.name || session.user.email}
              </span>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Vite + React + Hono + Cloudflare</h1>
        <p className="text-muted-foreground">
          Welcome to your Better Auth application
        </p>
      </div>

      {session?.user ? (
        <Card>
          <CardHeader>
            <CardTitle>
              Welcome back, {session.user.name || session.user.email}!
            </CardTitle>
            <CardDescription>
              You are successfully authenticated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Email:</strong> {session.user.email}
              </p>
              {session.user.name && (
                <p className="text-sm">
                  <strong>Name:</strong> {session.user.name}
                </p>
              )}
            </div>
            {firstTeamId && (
              <Link
                to="/$teamId/monitors"
                params={{ teamId: String(firstTeamId) }}
              >
                <Button>Go to Dashboard</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Sign in or create an account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline">Sign Up</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Counter Example</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setCount((count) => count + 1)}
              aria-label="increment"
            >
              count is {count}
            </Button>
            <p className="text-sm text-muted-foreground">
              Edit <code>src/frontend/routes/index.tsx</code> and save to test
              HMR
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Example</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => {
                fetch("/api/")
                  .then((res) => res.json() as Promise<{ name: string }>)
                  .then((data) => setName(data.name));
              }}
              aria-label="get name"
            >
              Name from API is: {name}
            </Button>
            <p className="text-sm text-muted-foreground">
              Edit <code>src/backend/index.ts</code> to change the name
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
