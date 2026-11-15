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

## Agent 3: Playwright Test Automation and GitHub PR
After Agent 2 generates scenarios, enter `TS-1`, `TS-1, TS-2`, or `all`.
Agent 3 generates a TypeScript Playwright spec, displays the code and warnings, and offers a download.
Select **Create GitHub Pull Request** to publish the reviewed code in a new `agent/playwright-*` branch under `tests/generated/` and open a **draft** PR against `main`.

### Required server-side environment variables
- `OPENAI_API_KEY`: existing Agent 1/2/3 generation key
- `GITHUB_PR_TOKEN`: GitHub fine-grained token with repository Contents (read/write) and Pull requests (read/write) permissions for `santosh-kalokhe/crm-agent-lab`
- `AGENT_PUBLISH_KEY`: strong shared publishing secret, entered into the Agent 3 UI before creating a PR

The GitHub token must never be exposed to browser code or committed to the repository.
The shared publishing key is a demo authorization mechanism, **not** a substitute for per-user authentication and rate limiting. Add proper login, access controls, auditing, and request limits before public use.
The generated code is untrusted and should be reviewed before running it; draft PR creation does not execute tests.
