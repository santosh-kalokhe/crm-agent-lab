# Requirements and Test Scenario Agents

Two human-in-the-loop agents are available in the CRM **Agents** page.

## Agent 1: Requirement Analyzer
Input: free-text business requirement (max 12,000 characters).
Output: JSON with `summary`, `structuredRequirements` (IDs, acceptance criteria, priority), `gaps` (questions, impact, severity), `assumptions`, and `nonFunctionalRequirements`.

## Agent 2: Test Scenario Generator
Input: original requirements or Agent 1's structured JSON.
Output: JSON with `summary`, `scenarios` (IDs, requirement IDs, category, preconditions, steps, expected result, priority), and `coverageGaps`. Categories: Positive, Negative, Boundary, Edge.

## Setup
Configure `OPENAI_API_KEY` as a **server-side Vercel environment variable**, not `VITE_*`. Optionally set `AGENT_MODEL` (defaults to `gpt-4.1-mini`). Deploy the Vercel application; `npm run dev` runs Vite only and does not provide the Vercel `/api/agents` endpoint. For local API testing use `vercel dev` with Vercel CLI and project environment configuration.

## API
`POST /api/agents` with JSON `{ "agent": "requirements" | "scenarios", "input": "..." }`.
Returns `{ "agent": "...", "result": { ... } }`. Invalid input: 400; missing key: 503; generation error: 502.

## Security and limitations
- This demo API has **no user authentication or rate limiting**. Add both before exposing it publicly; otherwise anyone can consume paid model calls.
- Requirements are sent to the configured OpenAI API; do not paste confidential data without appropriate approvals.
- Outputs are AI-generated drafts and require human review. Gaps must be resolved before treating scenarios as final.
- No requirements or scenarios are persisted to the database. Use Download JSON to export.
- The API validates the top-level output shape, not every nested field; add strict schema validation for production.

## Agent 3: Playwright Test Automation and automatic PR
Select `TS-1`, `TS-1, TS-2`, or `all`, then click **Generate Playwright Tests & PR**.
The server generates Playwright TypeScript, creates a branch, commits under `tests/generated/`,
and opens a **draft PR** against `main`. The UI shows the actual GitHub PR URL on success.
The code preview and download remain available.

### Deployment configuration
- `OPENAI_API_KEY`: server-side model key
- `GITHUB_PR_TOKEN`: GitHub fine-grained token for this repository with Contents (read/write) and Pull requests (read/write)
- `AGENT_AUTO_PUBLISH_ENABLED=true`: explicit server-side opt-in

**Security:** This demo currently lacks application-level user authentication and rate limiting.
Automatic PR publishing must only be enabled behind authenticated deployment access (for example
Vercel Deployment Protection with restricted team access). Do not enable it on a public deployment.
Add application authorization, rate limits, auditing and quotas before making it public.
The generated tests are untrusted, not executed by this endpoint, and must be reviewed in the draft PR.
