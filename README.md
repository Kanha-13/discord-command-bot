# Discord Slash-Command Bot

A full-stack Discord slash-command bot with an authenticated web dashboard for command configuration, activity monitoring, notification mirroring, interactive Discord components, modal-based report submission, AI-assisted report analysis, and action-level failure/retry observability.

The application receives Discord interactions through a public HTTP endpoint, verifies Discord Ed25519 signatures, records interactions, executes commands, responds to Discord, performs downstream actions, and exposes interaction/action history through an authenticated dashboard.


## Live Application

* **Dashboard:** https://discord-command-bot-1.onrender.com
* **API:** https://discord-command-bot-kuqn.onrender.com
* **API Health:** https://discord-command-bot-kuqn.onrender.com/health

---

# Features

## Discord

* Discord OAuth2 authentication
* HTTP-based Discord Interactions endpoint
* Ed25519 signature verification
* Discord `PING` handling
* Slash commands:

  * `/status`
  * `/report`
* Deferred Discord responses
* Interaction deduplication using Discord interaction IDs
* Configurable command rules
* Interactive Discord components
* Modal-based report submission
* Notification mirroring to a second Discord channel

## Dashboard

* Sign in with Discord
* View connected Discord server
* Configure command and mirror channels
* Configure command rules
* View command/interactions activity
* View interaction status
* View individual action status
* View action attempt history
* View failures and retry history
* Paginated interaction history
* Automatic activity refresh

## AI

* Gemini-powered report analysis
* Structured report categorization
* Severity classification
* Concise report summaries
* AI analysis tracked as a first-class action
* AI failures and retries visible in the dashboard

## Reliability

* Unique interaction ID prevents duplicate processing
* Discord interactions are acknowledged within Discord's response window
* Primary Discord responses and downstream actions are tracked independently
* AI analysis and mirror notifications support retry handling
* Failed actions retain their failure state
* Individual action attempts are persisted
* Database-backed interaction and action history

## Security

* Discord Ed25519 request verification
* HTTP-only session cookies
* Session tokens are randomly generated and stored as SHA-256 hashes
* Discord OAuth access tokens are not persisted
* Protected dashboard APIs require authentication
* Admin authorization for dashboard APIs
* Secrets are kept server-side
* CORS is restricted to the configured frontend origin
* External request payloads are validated

## Completed Stretch Goals

### 1. Configurable Command Rules

Command execution can be restricted through the dashboard.

The configuration determines which commands are allowed in configured Discord channels. A command that is not permitted is rejected without executing its downstream workflow, while the interaction remains visible in the activity history.

This allows command behavior to be changed through the UI without modifying application code.

### 2. Interactive Discord Components

The `/status` command provides a **Refresh Status** button.

The flow is:

```text
/status
   ↓
Discord sends APPLICATION_COMMAND
   ↓
Bot responds with status + button
   ↓
User clicks "Refresh Status"
   ↓
Discord sends MESSAGE_COMPONENT
   ↓
Signature verification
   ↓
Interaction persistence + deduplication
   ↓
Existing Discord message is updated
```

The component interaction is independently verified and recorded.

The button updates the existing response rather than creating a second message.

### 3. Modal-Based `/report`

The `/report` command opens a Discord modal instead of accepting the report text directly as a slash-command option.

The flow is:

```text
/report
   ↓
Discord sends APPLICATION_COMMAND
   ↓
Bot opens report modal
   ↓
User submits report
   ↓
Discord sends MODAL_SUBMIT
   ↓
Signature verification
   ↓
Report processing
```

The modal submission is persisted as its own interaction and processed through the same reliability and observability pipeline.

### 4. AI-Assisted Report Analysis

Submitted reports are analyzed using Google's Gemini API.

The AI produces structured information:

* **Category** — for example `BUG`, `PAYMENT`, `ACCOUNT`, `PERFORMANCE`, `FEATURE_REQUEST`, or `OTHER`
* **Severity** — `LOW`, `MEDIUM`, or `HIGH`
* **Summary** — a concise description of the report

Example:

```text
Report:
The website is completely down and users cannot access it.

AI Analysis:
Category: BUG
Severity: HIGH
Summary: The user reported that the website is completely down.
```

AI processing is represented as a separate `AI_ANALYSIS` action and uses the same action/attempt tracking system as other downstream operations.

The primary Discord response does not depend on successful AI processing. If the AI provider is temporarily unavailable, the report can still be acknowledged while the AI action records its failure.

### 5. Meaningful Observability

The application tracks important downstream operations as actions.

Current action types include:

```text
DISCORD_RESPONSE
AI_ANALYSIS
MIRROR_NOTIFICATION
```

Each action records:

* Current status
* Number of attempts
* Error information
* Completion time

Individual attempts are stored separately.

For example:

```text
AI_ANALYSIS
├── Attempt 1 → FAILED
├── Attempt 2 → FAILED
└── Attempt 3 → SUCCESS
```

This makes failures and retries visible from the dashboard instead of relying only on application logs.

---

# Future Scope

## Multi-Server Support

The backend already associates interactions and configuration with individual Discord servers through `serverId`, providing a foundation for multi-server support.

Multi-server administration was intentionally left as future scope for this submission.

A future implementation could provide:

* Multiple connected Discord servers
* Server selection in the dashboard
* Independent command rules per server
* Independent command and mirror channel configuration
* Server-specific interaction history
* Server-specific action history
* Independent server configuration

## Other Potential Improvements

* Durable background job processing for downstream actions
* More sophisticated transient/permanent failure classification
* Real-time dashboard updates using SSE or WebSockets
* More comprehensive end-to-end testing
* Configurable AI prompts and analysis rules
* More granular role-based permissions
* Production metrics and alerting
* Additional Discord commands

# Architecture

```text
                         ┌──────────────────────┐
                         │       Discord        │
                         │                      │
                         │ /status              │
                         │ /report              │
                         │ Buttons               │
                         │ Report Modal          │
                         └──────────┬───────────┘
                                    │
                                    │ HTTPS Interaction
                                    ▼
                     ┌────────────────────────────┐
                     │        Express API         │
                     │                            │
                     │ Ed25519 Verification       │
                     │ Interaction Controller     │
                     │ Command Service            │
                     │ Action Service             │
                     │ AI Service                 │
                     └────────────┬───────────────┘
                                  │
                     ┌────────────┼─────────────┐
                     │            │             │
                     ▼            ▼             ▼
              ┌────────────┐ ┌──────────┐ ┌──────────────┐
              │ PostgreSQL │ │ Discord  │ │ Gemini API   │
              │   Neon     │ │ REST API │ │              │
              │            │ │          │ │ AI Analysis  │
              │ Servers    │ │ Response │ └──────────────┘
              │ Sessions   │ │ Mirror   │
              │ Interactions│ └──────────┘
              │ Actions    │
              │ Attempts   │
              └──────┬─────┘
                     │
                     │ REST API
                     ▼
             ┌───────────────────┐
             │ React Dashboard   │
             │                   │
             │ Vite + TypeScript │
             │ Tailwind CSS      │
             └───────────────────┘
```

---

# Interaction Architecture

The application handles multiple Discord interaction types:

| Interaction           | Purpose                       |
| --------------------- | ----------------------------- |
| `PING`                | Discord endpoint verification |
| `APPLICATION_COMMAND` | `/status` and `/report`       |
| `MESSAGE_COMPONENT`   | Status refresh button         |
| `MODAL_SUBMIT`        | Report form submission        |

Every Discord interaction passes through signature verification before application-level processing.

The application also persists Discord's interaction ID with a unique constraint to prevent duplicate processing.

---

# Report Workflow

The current `/report` workflow is:

```text
/report
   ↓
Open Discord Modal
   ↓
MODAL_SUBMIT
   ↓
Verify Ed25519 signature
   ↓
Persist interaction
   ↓
Acknowledge/defer interaction
   ↓
Validate report
   ↓
Discord Response
   ↓
AI Analysis
   ↓
Mirror Notification
   ↓
Record action results
```

The downstream operations are independently tracked.

For a successful report:

```text
DISCORD_RESPONSE       SUCCESS
AI_ANALYSIS            SUCCESS
MIRROR_NOTIFICATION    SUCCESS
```

If Gemini becomes unavailable:

```text
DISCORD_RESPONSE       SUCCESS
AI_ANALYSIS            FAILED
MIRROR_NOTIFICATION    SUCCESS
```

The primary report is therefore not silently lost because of an external AI dependency.

---

# Reliability Design

## Discord Response Window

Discord interactions have a limited acknowledgement window.

The application therefore acknowledges interactions using the appropriate Discord interaction response type before performing longer-running work.

For deferred operations:

```text
Discord
   ↓
POST /api/discord/interactions
   ↓
Verify signature
   ↓
Persist interaction
   ↓
Deferred acknowledgement
   ↓
Process interaction
   ↓
Discord follow-up
```

This prevents longer-running operations from causing the initial Discord interaction to expire.

## Deduplication

Every Discord interaction has a unique interaction ID.

The database stores this ID with a unique constraint.

If Discord sends the same interaction more than once, the existing record is detected and duplicate processing is avoided.

## Action Tracking

Important operations are represented as explicit actions.

Current action types are:

```text
DISCORD_RESPONSE
AI_ANALYSIS
MIRROR_NOTIFICATION
```

For example, a report submission can produce:

```text
CommandInteraction
│
├── DISCORD_RESPONSE
├── AI_ANALYSIS
└── MIRROR_NOTIFICATION
```

Each action tracks:

* Status
* Number of attempts
* Error information
* Completion time

Individual attempts are stored in `ActionAttempt`.

This allows the dashboard to distinguish between:

```text
Discord Response       SUCCESS
AI Analysis            SUCCESS
Mirror Notification    FAILED
```

rather than treating the entire interaction as simply successful or failed.

## Retry Handling

Downstream operations use retry handling with exponential backoff.

The current retry sequence is:

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

After the final failed attempt, the action is marked `FAILED` and the error is retained in the database.

AI analysis uses the same action/attempt model, so provider failures are visible rather than silently discarded.

The primary Discord response is intentionally independent of downstream AI processing.

# Security

## Discord Request Verification

Discord interaction requests are verified using:

* `X-Signature-Ed25519`
* `X-Signature-Timestamp`
* Discord application public key

Signature verification occurs before processing the interaction.

The raw request body is preserved because modifying the body before verification would invalidate the signature.

## Authentication

The dashboard uses Discord OAuth2 for authentication.

The application uses server-side sessions with an HTTP-only cookie.

Session tokens are randomly generated and only their SHA-256 hashes are persisted in the database.

Discord OAuth access tokens are not exposed to the frontend.

## Authorization

Protected dashboard APIs require an authenticated session and appropriate authorization.

The Discord interaction endpoint remains publicly reachable because Discord must be able to call it, but requests are accepted only after Discord signature verification.

## Secrets

Secrets are supplied through environment variables.

The repository contains `.env.example` files but no production credentials.

---

# Engineering and Deployment Challenges

Several issues required additional debugging during development and deployment.

## CORS and Cookie Authentication

One of the main deployment challenges was getting authentication cookies to work correctly between the frontend and backend.

Initially, the backend appeared unable to set the session cookie correctly because of cross-origin configuration.

The application was also being tested through a Cloudflare Tunnel, which introduced additional browser cookie behavior compared with a straightforward localhost setup.

After configuration changes, the cookie could appear in browser storage while still not being included in subsequent requests.

The final issue involved the interaction between:

* Frontend/backend origins
* CORS configuration
* Cookie domain behavior
* `SameSite`
* `Secure`
* Cloudflare Tunnel/development environment

The cookie configuration was adjusted so that the browser would both store and send the session cookie in the actual deployment context.

This was an important debugging lesson because a cookie being visible in browser storage does not necessarily mean that the browser will attach it to a request.

## Discord OAuth Redirect

Discord OAuth redirect configuration also required careful debugging.

The callback URL configured in the Discord Developer Portal must exactly match the application's configured redirect URI.

Different URLs were required for local development and production.

Production:

```text
https://discord-command-bot-kuqn.onrender.com/api/auth/discord/callback
```

Local development:

```text
http://localhost:5000/api/auth/discord/callback
```

Any mismatch can result in authentication failing even though the OAuth implementation itself is functioning correctly.

## Cloudflare Tunnel

Cloudflare Tunnel was useful during local development for exposing the application to external services, but it introduced additional complexity around:

* Public versus local origins
* OAuth redirect URLs
* CORS
* Browser cookie policies
* `SameSite` and `Secure` behavior
* Testing Discord callbacks against a local service

The final deployment uses Render, while the tunnel was primarily useful during development and debugging.

## Gemini Availability and Response Handling

During AI integration, the Gemini provider occasionally returned temporary availability errors.

There were also cases where the model returned incomplete JSON.

The initial implementation assumed the AI response would always contain valid JSON, which caused parsing failures.

The implementation was improved by:

* Requesting JSON output explicitly
* Validating the returned structure
* Treating AI as an external dependency
* Recording AI processing as an explicit action
* Keeping AI processing separate from the primary Discord response
* Retrying failed AI actions

This prevents a temporary AI provider failure from silently breaking the report workflow.

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
* Slash Commands
* Message Components
* Modals

## AI

* Google Gemini API
* Structured JSON report analysis

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

Backend structure:

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

---

# Local Development

## Prerequisites

* Node.js 20+
* Yarn
* PostgreSQL database
* Discord application/bot
* Gemini API key

A free PostgreSQL database can be created using Neon.

## Clone

```bash
git clone https://github.com/Kanha-13/discord-command-bot
cd discord-command-bot
```

## Install

```bash
yarn install
```

If required by the workspace setup:

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

Create `apps/api/.env` based on `.env.example`.

Example:

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

GEMINI_API_KEY=
GEMINI_MODEL=
```

## Frontend

```env
VITE_API_URL=http://localhost:5000
```

Never commit real `.env` files or credentials.

---

# Database Setup

The project uses Prisma migrations.

From `apps/api`:

```bash
yarn run db:generate
```

Validate:

```bash
yarn run db:validate
```

Apply local migrations:

```bash
yarn run db:migrate
```

For production:

```bash
yarn run db:deploy
```

---

# Discord Setup

Create an application through the Discord Developer Portal.

The application requires:

* Client ID
* Client Secret
* Public Key
* Bot Token
* Application ID

## OAuth Redirect

Local:

```text
http://localhost:5000/api/auth/discord/callback
```

Production:

```text
https://discord-command-bot-kuqn.onrender.com/api/auth/discord/callback
```

The configured Discord OAuth redirect URL must exactly match `DISCORD_OAUTH_REDIRECT_URI`.

# Discord Interaction Endpoint

Configure the Discord application's Interactions Endpoint URL as:

```text
https://discord-command-bot-kuqn.onrender.com/api/discord/interactions
```

The endpoint:

1. Verifies the Ed25519 signature.
2. Handles Discord `PING` requests.
3. Identifies the interaction type.
4. Validates required Discord data.
5. Deduplicates using the Discord interaction ID.
6. Persists the interaction.
7. Sends the appropriate Discord acknowledgement.
8. Processes the command/component/modal.
9. Sends the Discord response or follow-up.
10. Executes downstream actions such as AI analysis and mirror notification.
11. Records action status and individual attempt results.

Supported interaction types include:

| Type                  | Purpose                       |
| --------------------- | ----------------------------- |
| `PING`                | Discord endpoint verification |
| `APPLICATION_COMMAND` | `/status` and `/report`       |
| `MESSAGE_COMPONENT`   | Status refresh button         |
| `MODAL_SUBMIT`        | Report form submission        |


---

# Slash Commands

## `/status`

Returns:

```text
🟢 Bot is operational.
```

The response also contains a **Refresh Status** button.

Clicking the button generates a `MESSAGE_COMPONENT` interaction. The interaction is signature-verified, persisted, deduplicated, and processed by the application.

The existing Discord message is updated with the latest status rather than creating a new message.

---

## `/report`

The `/report` command opens a Discord modal.

The user enters the report inside the modal and submits it.

Example:

```text
/report
        ↓
Submit a Report modal
        ↓
User enters:
"The website is completely down."
        ↓
Submit
```

The modal submission generates a `MODAL_SUBMIT` interaction.

The application then:

1. Verifies the Discord signature.
2. Persists the interaction.
3. Validates the report.
4. Sends the primary Discord response.
5. Runs AI analysis.
6. Sends the report to the configured mirror channel.
7. Records action results and attempt history.

Example AI analysis:

```text
Category: BUG
Severity: HIGH
Summary: The user reported that the website is completely down.
```

AI processing is independent of the primary Discord response. A temporary AI failure therefore does not prevent the report from being acknowledged.

# Registering Slash Commands

The API includes a Discord command registration script:

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

```text
API  → http://localhost:5000
Web  → http://localhost:5173
```

Health endpoint:

```text
http://localhost:5000/health
```

---

# Testing

Run the test suite:

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

Build both applications:

```bash
yarn run build
```

---

# Manual End-to-End Test

1. Open the production dashboard.
2. Sign in with Discord.
3. Select the configured Discord server.
4. Configure a command channel.
5. Configure a different mirror channel.
6. Configure command rules.
7. Run `/status`.
8. Confirm the Discord response.
9. Click **Refresh Status**.
10. Confirm the existing Discord message is updated.
11. Open the dashboard and confirm the interaction is recorded.
12. Run `/report`.
13. Confirm that the report modal opens.
14. Submit a report through the modal.
15. Confirm the Discord report acknowledgement.
16. Confirm AI analysis is performed.
17. Confirm the mirror notification is delivered.
18. Confirm the dashboard shows:

    * Discord Response
    * AI Analysis
    * Mirror Notification
19. Open the action history and inspect attempts.
20. Run a command from a channel where it is not allowed.
21. Confirm the command is rejected and the interaction is still recorded.


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

# Production Deployment

The application is deployed using Render and Neon PostgreSQL.

## API

```text
https://discord-command-bot-kuqn.onrender.com
```

## Frontend

```text
https://discord-command-bot-1.onrender.com
```

## Database

PostgreSQL is hosted on Neon.

Production migrations:

```bash
yarn run db:deploy
```

The API uses Render's provided `PORT` environment variable.

---

# Production Environment

Backend:

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

GEMINI_API_KEY=<GEMINI_API_KEY>
GEMINI_MODEL=<GEMINI_MODEL>
```

Frontend:

```env
VITE_API_URL=https://discord-command-bot-kuqn.onrender.com
```

No secrets should be exposed through `VITE_` variables.

---

# Engineering Decisions

The implementation intentionally avoids unnecessary infrastructure while still providing persistence, reliability, and observability.

The current implementation uses:

* PostgreSQL-backed state
* Prisma
* Express/HTTP APIs
* Discord REST API
* Explicit action tracking
* Retry handling
* Gemini for AI-assisted report analysis

The application does not currently require Redis, BullMQ, or a dedicated message queue.

For this assignment, database-backed action state and retry handling provide sufficient visibility into downstream operations while keeping the deployment relatively small.

A durable background job/queue system would be a logical next step if the application needed to process substantially higher volumes or guarantee execution across application restarts.

# What Was Built Beyond the Core Requirements

The final implementation goes beyond the minimum slash-command workflow.

```text
Core
├── Slash commands
├── Discord interaction endpoint
├── Signature verification
├── Persistence
├── Discord response
├── Mirror notification
└── Authenticated dashboard

Stretch Goals
├── Configurable command rules
├── Interactive components
├── Modal-based report submission
├── AI-assisted report analysis
└── Meaningful observability

Future Scope
└── Multi-server administration
```

---

# Known Limitations / Future Improvements

The following improvements were intentionally left for future work:

* Multi-server administration
* Durable background job processing
* More sophisticated retry policies
* Real-time dashboard updates using SSE/WebSockets
* More extensive end-to-end testing
* Configurable AI prompts/rules
* More granular role-based permissions
* Production-grade metrics and alerting
* Better separation of transient versus permanent downstream failures

---

# AI Development Notes

AI tools were used throughout development for architecture exploration, implementation guidance, debugging, code review, Discord interaction reasoning, and AI integration.

The project also includes a dedicated [`AI_NOTES.md`](./AI_NOTES.md) documenting:

* AI tools and models used
* How development work was split between the developer and AI
* Key architecture decisions
* The hardest AI-assisted debugging issue
* Lessons learned
* Potential future improvements

---

# License

This project was created as a technical take-home assignment.
