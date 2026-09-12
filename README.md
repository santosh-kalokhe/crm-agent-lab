# CRM Agent Lab

A small React + TypeScript CRM designed to become the application-under-test for a Human-in-the-Loop Autonomous SDLC demo.

## Modules
- Dashboard
- Sales / Leads
- Customer Service / Cases
- Marketing / Campaigns
- Agent Control Center placeholder

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Optional Supabase setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Copy `.env.example` to `.env.local`.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
5. Add proper RLS policies before enabling real user access.

The app intentionally falls back to demo data until database CRUD is connected.

## Deploy to Vercel
1. Push this project to a GitHub repository.
2. Import the repository in Vercel.
3. Vercel should detect Vite automatically.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. If Supabase is enabled, add the two `VITE_SUPABASE_*` environment variables in the Vercel project settings.

## Next milestone
Connect Sales CRUD to Supabase, then Cases and Campaigns, then authentication.

## Architecture
```text
Browser
│
├── GitHub Codespaces
│   ├── VS Code
│   ├── React/TypeScript CRM
│   ├── Python AI agents
│   ├── Playwright
│   └── Git
│
├── GitHub
│   ├── Source code
│   ├── Issues
│   ├── Branches
│   ├── Pull Requests
│   └── GitHub Actions
│
├── Supabase
│   └── CRM database
│
└── Vercel
    └── Public CRM
