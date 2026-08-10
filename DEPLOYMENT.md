# CineMax deployment guide

This repository is deployed as two Vercel projects:

1. **Frontend** - the Vite application from the repository root (or `client`).
2. **Backend** - the Express application with `backend` as its Root Directory.

The backend also requires a hosted MongoDB database. A MongoDB server running on
`localhost` is not reachable from Vercel.

## 1. Prepare MongoDB

Create a hosted MongoDB database and obtain a connection string resembling:

```text
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/cinemax?retryWrites=true&w=majority
```

Allow Vercel to reach the database using the network-access controls offered by
your MongoDB provider. Do not commit the connection string.

## 2. Deploy the backend project

Import this Git repository into a new Vercel project with these settings:

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Framework Preset | Express |
| Build Command | Leave at the detected default |
| Output Directory | Leave blank |
| Install Command | Leave at the detected default |
| Node.js version | 24.x |

Add the following variables under **Settings -> Environment Variables** for
Production, Preview, and Development as appropriate:

```text
MONGO_URL=<hosted MongoDB connection string>
ACCESS_TOKEN=<new random secret of at least 32 bytes>
REFRESH_TOKEN=<different random secret of at least 32 bytes>
CLIENT_URLS=https://your-frontend.vercel.app
```

Optional email variables:

```text
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
```

Do not add `PORT`; Vercel manages the server port. After deployment, verify:

```text
https://your-backend.vercel.app/
https://your-backend.vercel.app/health
```

`/health` must return `"status":"ok"` and `"database":"connected"`.

## 3. Deploy the frontend project

The existing frontend Vercel project can use the repository root. The root
`vercel.json` builds `client/dist`. Alternatively, create a project whose Root
Directory is `client`; `client/vercel.json` supports that layout too.

Recommended settings when using the repository root:

| Setting | Value |
| --- | --- |
| Root Directory | Leave blank |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `client/dist` |
| Node.js version | 24.x |

Add these frontend environment variables before building:

```text
VITE_API_URL=https://your-backend.vercel.app
VITE_SOCKET_URL=https://your-backend.vercel.app
VITE_ENABLE_REALTIME=false
```

All `VITE_` variables are included in browser JavaScript. Never put passwords,
JWT secrets, or the MongoDB connection string in a `VITE_` variable.

The current seat-lock implementation stores temporary locks in one long-running
Node process. Keep realtime disabled on the Vercel handler so the frontend does
not repeatedly attempt an unavailable Socket.IO connection. Final booking still
checks the database for already-booked seats. Set realtime to `true` when using
the local Node server or after moving temporary locks to a shared durable store.

## 4. Finish the cross-origin configuration

Once the frontend has its final production domain, set the backend variable to
that exact origin and redeploy the backend:

```text
CLIENT_URLS=https://your-final-frontend.vercel.app
```

Do not add a trailing slash. Multiple allowed frontend domains can be separated
with commas.

## 5. Seed the production database

After placing the hosted `MONGO_URL` in your local ignored `backend/.env`, run:

```bash
npm run seed
```

Run this deliberately: the seed script clears existing CineMax data before it
creates the sample movies, screens, showtimes, concessions, and users.

## 6. Repository security cleanup

The first commit included `backend/.env` and both `node_modules` directories.
Before pushing the deployment fix, remove them from Git tracking while keeping
the local files:

```bash
git rm --cached backend/.env
git rm -r --cached backend/node_modules client/node_modules
```

Then commit `.gitignore` and the deployment changes. Because the old JWT secrets
exist in Git history, replace both secrets in Vercel; do not reuse the old values.

## Troubleshooting

- Vercel `404: NOT_FOUND` at `/`: confirm the correct project and Root Directory.
- Frontend loads but has no movies: check `VITE_API_URL`, then open backend `/health`.
- Backend `/health` says `configuration-error`: add every variable listed in `missing`.
- Backend `/health` says `degraded`: fix the hosted MongoDB connection or network access.
- Browser reports CORS: set `CLIENT_URLS` to the exact frontend origin and redeploy.
- Refreshing `/movies` returns 404: ensure the applicable `vercel.json` was committed.
