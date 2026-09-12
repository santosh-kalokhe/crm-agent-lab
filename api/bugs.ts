import type {
  VercelRequest,
  VercelResponse,
} from '@vercel/node'

type BugRequest = {
  source: string
  title: string
  module: string
  severity: string
  actualBehavior: string
  expectedBehavior: string
  stepsToReproduce: string[]
  additionalNotes?: string
  context: {
    application: string
    environment: string
    pageUrl: string
    route: string
    browser: string
    userAgent: string
    reportedAt: string
    supabaseConnected: boolean
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    })
  }

  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO

  if (!token || !owner || !repo) {
    return res.status(500).json({
      success: false,
      error:
        'GitHub integration is not configured.',
    })
  }

  const bug = req.body as BugRequest

  if (
    !bug.title ||
    !bug.module ||
    !bug.severity ||
    !bug.actualBehavior ||
    !bug.expectedBehavior ||
    !Array.isArray(bug.stepsToReproduce)
  ) {
    return res.status(400).json({
      success: false,
      error: 'Invalid bug report.',
    })
  }

  const steps = bug.stepsToReproduce
    .map(
      (step, index) =>
        `${index + 1}. ${step}`
    )
    .join('\n')

  const body = `
## Bug Summary

${bug.title}

## Module

${bug.module}

## Severity

${bug.severity}

## Actual Behavior

${bug.actualBehavior}

## Expected Behavior

${bug.expectedBehavior}

## Steps to Reproduce

${steps}

## Additional Notes

${bug.additionalNotes || 'None'}

## Environment

- Application: ${bug.context.application}
- Environment: ${bug.context.environment}
- Route: ${bug.context.route}
- Page: ${bug.context.pageUrl}
- Browser: ${bug.context.browser}
- Reported: ${bug.context.reportedAt}
- Supabase Connected: ${bug.context.supabaseConnected}
- Source: ${bug.source}

## Agent Metadata

- Created by: Bug Creation Agent
- Workflow Status: Created
- Next Agent: Bug Analysis Agent
`.trim()

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${token}`,
          Accept:
            'application/vnd.github+json',
          'Content-Type':
            'application/json',
          'X-GitHub-Api-Version':
            '2022-11-28',
        },

        body: JSON.stringify({
          title: `[BUG] ${bug.title}`,
          body,
          labels: [
            'bug',
            'agent-created',
          ],
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      console.error(
        'GitHub issue creation failed:',
        result
      )

      return res.status(response.status).json({
        success: false,
        error:
          result.message ||
          'Unable to create GitHub issue.',
      })
    }

    return res.status(201).json({
      success: true,

      issue: {
        number: result.number,
        title: result.title,
        url: result.html_url,
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      error:
        'Unexpected error creating issue.',
    })
  }
}