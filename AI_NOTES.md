# AI Notes

## AI Tools and How I Used Them

I used AI tools throughout the development process, primarily **ChatGPT** for architecture discussions, implementation guidance, debugging, code review, and reasoning through Discord's interaction model.

I also used **Google Gemini** as the AI capability inside the application for analyzing submitted reports. The application uses Gemini to classify reports by category, severity, and generate a concise summary.

The development was split roughly as follows:

* **AI-assisted:** Exploring architecture options, understanding Discord interaction types, implementing signature verification flows, debugging TypeScript/Prisma issues, designing the action/attempt observability model, implementing Discord buttons and modals, and integrating the Gemini analysis step.
* **Developer-led:** Final architecture decisions, choosing the database and deployment setup, deciding how actions and retries should be modeled, integrating the pieces into the existing application, testing the complete Discord → backend → database → AI → mirror flow, and debugging production-specific behavior.

I treated AI suggestions as implementation guidance rather than blindly applying them. The final implementation was tested and adjusted based on actual application behavior.

---

## Key Decisions I Made

### 1. Model downstream work as explicit Actions

I chose to represent important operations such as Discord responses, mirror notifications, and AI analysis as separate `Action` records with associated `ActionAttempt` records.

This was intentional because the assignment emphasized unattended reliability and visible failure/retry history. Instead of only logging errors, the dashboard can show which operation failed, how many attempts were made, and the error associated with each attempt.

This also made adding the AI analysis step much simpler because it could reuse the same reliability model.

### 2. Keep the primary Discord response independent from AI

I decided that AI analysis should be treated as a downstream operation rather than something required before acknowledging the user's report.

The reasoning was that a temporary AI provider outage should not prevent Discord from receiving the user's report acknowledgement. AI processing can fail and be retried independently while the primary interaction remains successful.

### 3. Use Discord modals for `/report`

I changed `/report` from accepting report text directly as a slash-command option to opening a Discord modal.

This allowed the application to demonstrate another Discord interaction type (`MODAL_SUBMIT`) while providing a better interface for longer report text. It also required handling the modal submission as a separate, independently verified interaction.

---

## The Hardest Bug / AI Wrong Turn

### Cookie, CORS, Cloudflare Tunnel, and SameSite behavior

The hardest debugging issue was authentication in the deployed/development environment where the backend needed to set and subsequently receive an authentication cookie from the frontend.

Initially, the backend appeared to be unable to set the cookie correctly from the frontend. The first debugging direction focused on the expected **CORS and cookie domain configuration**, which was a reasonable starting point.

However, I was also developing/testing through a **Cloudflare Tunnel**, which made the browser's cookie behavior more subtle.

After changing the configuration, the cookie appeared to be successfully set in the browser, but authenticated requests were still arriving without the expected cookie. This was particularly confusing because inspecting the browser made it look as though the cookie existed.

AI guidance initially focused heavily on the domain/CORS configuration and did not identify the actual browser cookie-policy issue quickly enough. This led to a long debugging session where I had to trace the complete flow rather than assuming that a visible cookie meant it would be sent with requests.

The key discovery was the interaction between the cookie's **`SameSite=Lax` setting**, the development/deployment setup, and the browser's cross-site request rules. The browser could store the cookie but reject sending it in the request context I was using.

I eventually fixed the issue by correcting the cookie configuration, including the appropriate **`SameSite` and `Secure` settings**, and aligning it with the actual frontend/backend deployment setup.

The important lesson was that:

> A cookie being present in browser storage does not necessarily mean the browser will include it in a request.

This was also a case where AI's initial suggestions were useful for narrowing down the general authentication/CORS area, but the final diagnosis required examining the browser's actual cookie behavior and validating the request headers rather than continuing to change CORS settings.

This was the single biggest debugging detour during the assignment and the clearest example where I had to challenge the AI's initial diagnosis instead of continuing to follow it.

---

## Other AI-Related Lessons

During the Gemini integration, the AI provider initially returned unavailable/overloaded responses and, in another case, an incomplete JSON response.

Instead of treating the AI response as guaranteed, I added structured JSON output requirements and application-side validation. More importantly, I made AI analysis a downstream action with its own attempt history so that an AI failure does not silently cause the primary Discord workflow to fail.

This reinforced the importance of treating AI services as unreliable external dependencies rather than deterministic functions.

---

## What I Would Improve With More Time

With additional time, I would:

* Add **multi-server administration**, allowing one dashboard account to manage multiple Discord servers independently.
* Move downstream operations such as AI analysis and mirror notifications to a proper background job/queue system instead of processing them within the application process.
* Add more automated tests around Discord signature verification, duplicate interactions, cookie authentication, and downstream retry behavior.
* Add more structured logging with correlation IDs connecting a Discord interaction to its actions and individual attempts.
* Add configurable AI prompts/rules through the dashboard.
* Add better handling for permanent versus transient AI/provider failures so that retries can be more selective.
* Expand observability with deployment/runtime metrics and alerts.

---

## Example AI Collaboration Prompt

One example of how I used AI during development was asking it to reason through the Discord interaction architecture:

> "I need to handle Discord slash commands while respecting the three-second initial response requirement. How should I structure the interaction endpoint, persistence, deferred response, downstream actions, retries, and duplicate interaction handling so that a temporary failure doesn't silently lose an operation?"

I then adapted the suggested approach to the application's existing Prisma data model and tested each part against the actual Discord behavior.

## AI AGENTS 

AI agents were not used in this project. The AI integration uses Gemini directly for report classification, severity detection, and summarization. ChatGPT was used as a development assistant for architecture, debugging, implementation guidance, and code review, rather than as an autonomous agent.
