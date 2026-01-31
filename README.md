# Uplight

Open source uptime monitoring and incident management platform. Monitor your websites, APIs, and infrastructure from 9 global locations.

## Features

- **HTTP & TCP Monitoring** - Monitor endpoints from 9 global regions with configurable intervals
- **Heartbeat Monitoring** - Track cron jobs, scheduled tasks, and background processes
- **Incident Management** - Track, assign, and resolve incidents with full timeline
- **Status Pages** - Public status pages for your users
- **Domain & SSL Monitoring** - Get alerts before certificates and domains expire
- **Notifications** - Slack, Discord, Email, Webhooks, and more
- **Team Collaboration** - Invite your team with role-based access
- **Maintenance Windows** - Schedule downtime without triggering alerts

## Self-Hosting

Deploy your own instance with one click:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/francocanzani/uplight)

See the [self-hosting docs](https://docs.uplight.dev/self-hosting) for more details.

> **Note:** The self-hosted version includes all features except Domain & SSL monitoring, which requires additional infrastructure.

## Tech Stack

- **Runtime** - [Cloudflare Workers](https://workers.cloudflare.com/)
- **Framework** - [Hono](https://hono.dev/) + [React](https://react.dev/)
- **Database** - [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite)
- **ORM** - [Drizzle](https://orm.drizzle.team/)
- **Auth** - [Better Auth](https://www.better-auth.com/)
- **Storage** - [Cloudflare R2](https://developers.cloudflare.com/r2/)
- **Queues** - [Cloudflare Queues](https://developers.cloudflare.com/queues/)
- **Build** - [Vite](https://vite.dev/) + [Turborepo](https://turbo.build/)
- **Styling** - [Tailwind CSS](https://tailwindcss.com/)

## Project Structure

```
uplight/
├── apps/
│   ├── web/              # Main application (Cloudflare Worker)
│   │   ├── src/
│   │   │   ├── backend/  # Hono API
│   │   │   └── frontend/ # React SPA
│   │   └── drizzle/      # Database migrations
│   ├── docs/             # Documentation site (Nextra)
│   └── domain-checker/   # Domain/SSL checker service (Fly.io)
└── packages/             # Shared packages
```

## Local Development

### Prerequisites

- [Bun](https://bun.sh/) v1.2+
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) CLI

### Setup

```bash
# Install dependencies
bun install

# Set up local database
bun run db:migrate:dev

# Start development server
bun run dev
```

The app will be available at `http://localhost:5173`.

### Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run deploy` | Deploy to Cloudflare |
| `bun run db:migrate:dev` | Run local database migrations |
| `bun run db:migrate:prod` | Run production database migrations |
| `bun run db:studio:dev` | Open Drizzle Studio for local DB |
| `bun run lint` | Run ESLint |
| `bun run check-types` | Run TypeScript type checking |

## Environment Variables

Copy `apps/web/.env.example` to `apps/web/.env` and configure:

| Variable | Description |
|----------|-------------|
| `BETTER_AUTH_SECRET` | Authentication secret (min 32 chars) |
| `BETTER_AUTH_URL` | Your app URL |
| `ENCRYPTION_SECRET` | Encryption key for sensitive data (min 32 chars) |
| `DOMAIN_CHECKER_URL` | Optional: Domain checker service URL |

## Documentation

Full documentation is available at [docs.uplight.dev](https://docs.uplight.dev).

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT
