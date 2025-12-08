## Getting Started

To start a new project with this template, run:

```bash
npm create cloudflare@latest -- --template=cloudflare/templates/vite-react-template
```

A live deployment of this template is available at:
[https://react-vite-template.templates.workers.dev](https://react-vite-template.templates.workers.dev)

## Development

Install dependencies:

```bash
bun install
```

Start the development server with:

```bash
bun run dev
```

Your application will be available at [http://localhost:5173](http://localhost:5173).

## Production

Build your project for production:

```bash
bun run build
```

Preview your build locally:

```bash
bun run preview
```

Deploy your project to Cloudflare Workers:

```bash
bun run build && bun run deploy
```

Monitor your workers:

```bash
bunx wrangler tail
```

## Authentication

This application uses [Better Auth](https://www.better-auth.com/) with email/password authentication, backed by Cloudflare D1 and Drizzle ORM.

**Flow**: Frontend → Better Auth Client → `/api/auth/*` → Better Auth Server → D1 Database

**Database Tables**: `user`, `account`, `session`, `verification`

**Usage**:
- Signup: `signUp.email()` from `@/lib/auth/client`
- Login: `signIn.email()` from `@/lib/auth/client`
- Session: `useSession()` hook provides current user and session state

### Initial Setup (After Cloning)

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Set up local database**:
   ```bash
   # Apply migrations to local D1 database
   bun run db:migrate:local
   ```

3. **Configure environment variables** (create `.env.local`):
   ```bash
   # Optional: For Drizzle Kit to connect to remote D1
   CLOUDFLARE_ACCOUNT_ID=your_account_id
   CLOUDFLARE_DATABASE_ID=your_database_id
   CLOUDFLARE_D1_TOKEN=your_api_token
   ```

4. **Start development server**:
   ```bash
   bun run dev
   # Or use setup script that ensures migrations are applied:
   bun run dev:setup
   ```

The local database is automatically created in `.wrangler/state/v3/d1/` when you first run the dev server. Migrations should auto-apply, but if you see "no such table" errors, run `bun run db:migrate:local` manually.

### Production Deployment

1. **Set Cloudflare secrets** (one-time setup):
   ```bash
   # Generate a secure random string for BETTER_AUTH_SECRET
   bunx wrangler secret put BETTER_AUTH_SECRET --env production
   # Enter your production URL (e.g., https://your-app.workers.dev)
   bunx wrangler secret put BETTER_AUTH_URL --env production
   ```

2. **Apply migrations to production database**:
   ```bash
   # This applies all migrations from the drizzle/ folder
   bunx wrangler d1 migrations apply uplight-prod --remote --env production
   ```

3. **Deploy to Cloudflare Workers**:
   ```bash
   bun run build && bun run deploy
   ```

**Note**: The production database (`uplight-prod`) is separate from your local dev database. Make sure migrations are applied to production before deploying, or your app will fail with "no such table" errors.

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://reactjs.org/)
- [Hono Documentation](https://hono.dev/)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
