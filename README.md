# Discord Slash-Command Bot

A full-stack Discord slash-command bot with an authenticated web dashboard for command configuration, activity monitoring, and notification mirroring.

The application receives Discord interactions through an HTTP endpoint, verifies Discord Ed25519 signatures, records every command interaction, executes slash commands, responds back to Discord, and mirrors notifications to a configured second Discord channel.

## Live Application

**Dashboard:** https://discord-command-bot-1.onrender.com

**API:** https://discord-command-bot-kuqn.onrender.com

**API Health Check:** https://discord-command-bot-kuqn.onrender.com/health

---

## Features

### Discord

* Discord OAuth2 authentication
* HTTP-based Discord Interactions endpoint
* Ed25519 signature verification
* Discord PING/PONG handling
* Slash commands:

  * `/status`
  * `/report`
* Deferred Discord interaction responses
* Command-channel configuration
* Notification mirroring to a separate Discord channel
* Interaction deduplication using Discord interaction IDs

### Dashboard

* Sign in with Discord
* View connected Discord servers
* Select a server
* Configure command and mirror channels
* View command activity
* View interaction status
* View action status
* Paginated interaction history
* Automatic activity refresh

### Reliability

* Unique interaction ID prevents duplicate processing
* Discord interactions are acknowledged within Discord's response window
* Primary Discord responses and mirror notifications are tracked independently
* Mirror notifications retry up to three times
* Failed actions retain their failure state
* Database-backed interaction and action history

### Security

* Discord Ed25519 request verification
* HTTP-only session cookies
* Session tokens are randomly generated and stored as SHA-256 hashes
* Discord OAuth access tokens are not persisted
* Protected dashboard APIs require authentication
* Admin authorization for dashboard APIs
* Secrets are kept server-side
* CORS is restricted to the configured frontend origin
* External request payloads are validated

---

# Architecture

```text
                         ┌──────────────────────┐
                         │       Discord        │
                         │                      │
                         │ /status              │
                         │ /report               │
                         └──────────┬───────────┘
                                    │
                                    │ HTTPS Interaction
                                    ▼
                    ┌──────────────────────────────┐
                    │      Express API             │
                    │                              │
                    │ Ed25519 Verification         │
                    │ Interaction Controller       │
                    │ Command Service              │
                    │ Action Service               │
                    └──────────────┬───────────────┘
                                   │
                         ┌─────────┴─────────┐
                         │                   │
                         ▼                   ▼
                ┌────────────────┐   ┌─────────────────┐
                │   PostgreSQL   │   │ Discord REST API│
                │     Neon       │   │                 │
                │                │   │ Response        │
                │ Interactions   │   │ Mirror Message  │
                │ Actions        │   │                 │
                │ Servers        │   └─────────────────┘
                │ Sessions       │
                └────────────────┘

                         ▲
                         │ REST API
                         │
                ┌────────┴─────────┐
                │ React Dashboard  │
                │                  │
                │ Vite + TypeScript│
                │ Tailwind CSS     │
                └──────────────────┘
```

## Backend Architecture

The backend follows a layered architecture:

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Repositories
  ↓
Prisma
  ↓
PostgreSQL
```

Discord-specific API communication is isolated inside the integrations layer.

```text
src/
├── config/
├── middleware/
├── controllers/
├── routes/
├── services/
├── repositories/
├── integrations/
│   └── discord/
├── commands/
├── workers/
├── utils/
└── types/
```

The frontend is structured around:

```text
src/
├── components/
├── pages/
├── layouts/
├── hooks/
├── services/
├── context/
├── types/
└── utils/
```

---

# Tech Stack

## Frontend

* React
* Vite
* TypeScript
* Tailwind CSS
* React Router
* Context API

## Backend

* Node.js
* Express
* TypeScript
* Zod
* Pino HTTP logging

## Database

* PostgreSQL
* Prisma ORM
* Neon

## Discord

* Discord OAuth2
* Discord HTTP Interactions
* Discord REST API
* Ed25519 request verification

## Deployment

* Render
* Neon PostgreSQL

## Testing

* Vitest

---

# Project Structure

```text
discord-command-bot/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   └── src/
│   └── web/
│       └── src/
├── docs/
├── tests/
├── AGENTS.md
├── AI_NOTES.md
├── README.md
├── package.json
├── tsconfig.json
└── .env.example
```

---

# Local Development

## Prerequisites

Install:

* Node.js 20+
* yarn
* PostgreSQL database
* Discord application/bot

A free PostgreSQL database can be created with Neon.

---

## 1. Clone the repository

```bash
git clone https://github.com/Kanha-13/discord-command-bot
cd discord-command-bot
```

---

## 2. Install dependencies

From the project root:

```bash
yarn install
```

Then install dependencies for the applications if required by your local setup:

```bash
cd apps/api
yarn install

cd ../web
yarn install

cd ../..
```

---

# Environment Variables

## Backend

Create:

```text
apps/api/.env
```

based on `.env.example`.

```env
PORT=5000
WEB_APP_URL=http://localhost:5173

DATABASE_URL=

DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_PUBLIC_KEY=
DISCORD_BOT_TOKEN=
DISCORD_APPLICATION_ID=

DISCORD_OAUTH_REDIRECT_URI=http://localhost:5000/api/auth/discord/callback
```

## Frontend

Create:

```text
apps/web/.env
```

```env
VITE_API_URL=http://localhost:5000
```

Never commit `.env` files or Discord credentials.

---

# Database Setup

The project uses Prisma migrations.

From:

```text
apps/api
```

generate the Prisma client:

```bash
yarn run db:generate
```

Validate the schema:

```bash
yarn run db:validate
```

For local development, apply migrations with:

```bash
yarn run db:migrate
```

For production deployments:

```bash
yarn run db:deploy
```

---

# Discord Setup

Create an application in the Discord Developer Portal.

The application requires:

* Client ID
* Client Secret
* Public Key
* Bot Token
* Application ID

## OAuth Redirect URL

For local development:

```text
http://localhost:5000/api/auth/discord/callback
```

For production:

```text
https://discord-command-bot-kuqn.onrender.com/api/auth/discord/callback
```

The redirect URL configured in Discord must exactly match `DISCORD_OAUTH_REDIRECT_URI`.

---

# Discord Interaction Endpoint

Configure the Discord application's Interactions Endpoint URL as:

```text
https://discord-command-bot-kuqn.onrender.com/api/discord/interactions
```

The endpoint:

1. Verifies the Ed25519 signature.
2. Handles Discord PING requests.
3. Validates the interaction.
4. Deduplicates using the Discord interaction ID.
5. Persists the interaction.
6. Acknowledges the interaction.
7. Processes the command.
8. Sends the Discord response.
9. Sends the mirror notification.
10. Records action results.

---

# Slash Commands

## `/status`

Returns:

```text
🟢 Bot is operational.
```

The mirror channel receives:

```text
/status executed by <username>
```

## `/report`

Usage:

```text
/report text:<report>
```

Example:

```text
/report text=Production deployment completed successfully
```

Discord receives:

```text
📋 Report received.

Production deployment completed successfully
```

The mirror channel receives:

```text
🚨 New Report
User: <username>
Report: Production deployment completed successfully
```

---

# Registering Slash Commands

The API includes a command registration script:

```bash
cd apps/api
yarn run discord:register
```

The script uses the Discord application ID and bot token from the environment.

---

# Running Locally

From the project root:

```bash
yarn run dev
```

This starts:

* API: `http://localhost:5000`
* Web: `http://localhost:5173`

The API health endpoint is:

```text
http://localhost:5000/health
```

---

# Testing

Run the complete test suite from the project root:

```bash
yarn test
```

The test suite covers areas including:

* Command execution
* `/status`
* `/report`
* Invalid report input
* Discord signature verification
* Modified request bodies
* Invalid signatures
* Discord PING handling
* Raw request body handling
* Unsupported interactions
* Missing guild/channel/command data
* Command-channel restrictions
* Mirror notification retries
* Mirror notification failures
* Missing action records
* Discord response action handling

Build both applications with:

```bash
yarn run build
```

---

# Reliability Design

## Discord Response Window

Discord expects an interaction acknowledgement within a short response window.

The application therefore immediately acknowledges application commands with a deferred response:

```text
Discord
   ↓
POST /api/discord/interactions
   ↓
Verify signature
   ↓
Persist interaction
   ↓
HTTP 200 + type 5 acknowledgement
   ↓
Background command processing
   ↓
Discord follow-up
```

This prevents longer processing from causing the initial Discord interaction to expire.

## Deduplication

Every Discord interaction has a unique interaction ID.

The database stores this ID with a unique constraint.

If Discord sends the same interaction more than once, the existing record is detected and the command is not processed again.

## Action Tracking

Each interaction creates two tracked actions:

```text
DISCORD_RESPONSE
MIRROR_NOTIFICATION
```

This allows the application to distinguish between:

```text
Primary Discord response → SUCCESS
Mirror notification       → FAILED
```

A mirror failure therefore does not erase a successfully handled primary command.

## Retry

Mirror notifications use up to three attempts.

The delays are:

```text
Attempt 1
   ↓ failure
500ms
   ↓
Attempt 2
   ↓ failure
1000ms
   ↓
Attempt 3
```

If all attempts fail, the mirror action is marked `FAILED`.

---

# Security

### Discord Requests

Discord interaction requests are verified using the application's Ed25519 public key before processing.

### Sessions

Authentication uses server-side sessions.

The browser receives an HTTP-only cookie containing a random session token.

The database stores only a SHA-256 hash of the session token.

### OAuth Tokens

Discord OAuth access tokens are used server-side during authentication and are not persisted in the database or exposed to the frontend.

### Secrets

Secrets are stored in environment variables.

The repository contains only `.env.example`.

### Authorization

Dashboard APIs require:

```text
Authenticated session
        +
Admin role
```

The Discord interaction endpoint is intentionally public because Discord must be able to reach it, but requests must pass Ed25519 verification.

---

# Production Deployment

The production application is deployed using Render and Neon.

## API

```text
https://discord-command-bot-kuqn.onrender.com
```

## Frontend

```text
https://discord-command-bot-1.onrender.com
```

## Database

PostgreSQL hosted on Neon.

Production database migrations should be applied with:

```bash
yarn run db:deploy
```

The API uses Render's provided `PORT` environment variable.

---

# Production Environment

The API requires:

```env
NODE_ENV=production

DATABASE_URL=<NEON_DATABASE_URL>

WEB_APP_URL=https://discord-command-bot-1.onrender.com

DISCORD_CLIENT_ID=<DISCORD_CLIENT_ID>
DISCORD_CLIENT_SECRET=<DISCORD_CLIENT_SECRET>
DISCORD_PUBLIC_KEY=<DISCORD_PUBLIC_KEY>
DISCORD_BOT_TOKEN=<DISCORD_BOT_TOKEN>
DISCORD_APPLICATION_ID=<DISCORD_APPLICATION_ID>

DISCORD_OAUTH_REDIRECT_URI=https://discord-command-bot-kuqn.onrender.com/api/auth/discord/callback
```

The frontend requires:

```env
VITE_API_URL=https://discord-command-bot-kuqn.onrender.com
```

No secrets should be exposed through `VITE_` variables.

---

# Manual End-to-End Test

1. Open the production dashboard.
2. Sign in with Discord.
3. Select the Discord server.
4. Configure a command channel.
5. Configure a different mirror channel.
6. Run `/status`.
7. Confirm the Discord response.
8. Confirm the mirror notification.
9. Open the dashboard and confirm the interaction is recorded.
10. Run `/report text=Production test`.
11. Confirm the response and mirror notification.
12. Run a command from an unconfigured channel.
13. Confirm the command is rejected and still recorded.

---

# API Endpoints

## Authentication

```text
GET  /api/auth/discord
GET  /api/auth/discord/callback
GET  /api/auth/me
POST /api/auth/logout
```

## Discord

```text
POST /api/discord/interactions
```

## Servers

```text
GET /api/servers
GET /api/servers/:id
GET /api/servers/:id/channels
```

## Configuration

```text
GET /api/servers/:id/config
PUT /api/servers/:id/config
```

## Interactions

```text
GET /api/interactions
GET /api/interactions/:id
```

## Health

```text
GET /health
```

---

# Engineering Decisions

The implementation intentionally avoids unnecessary infrastructure for the core assignment.

The initial version does not require:

* Redis
* BullMQ
* WebSockets
* Slack
* Complex RBAC
* External AI services

Instead, the application uses PostgreSQL-backed state, simple retry handling, HTTP APIs, and Discord's REST API.

This keeps the deployment small while still providing interaction persistence, deduplication, action tracking, and failure handling.

---

# Future Improvements

Potential improvements include:

* Durable background job processing
* Configurable command rules
* Retry history and improved observability
* Server-Sent Events for real-time dashboard updates
* Interactive Discord buttons
* Additional Discord commands
* Optional AI-powered report summarization
* More extensive end-to-end testing

---

# License

This project was created as a technical take-home assignment.
