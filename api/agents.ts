import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'

const MAX_INPUT = 12000
const MAX_OUTPUT = 30000
const instructions = {
  requirements: `You are a senior business analyst and software test architect. Analyze the supplied raw requirements. Return ONLY a JSON object with keys: summary (string), structuredRequirements (array of objects with id, title, description, acceptanceCriteria as array of strings, priority as Must|Should|Could), gaps (array of objects with id, question, impact, severity as High|Medium|Low), assumptions (array of strings), nonFunctionalRequirements (array of strings). Preserve traceability to the source; do not invent confirmed facts. Explicitly flag ambiguity and missing details.`,
  scenarios: `You are a senior QA test architect. Generate a balanced, actionable test scenario catalog from the supplied requirements. Return ONLY a JSON object with keys: summary (string), scenarios (array of objects with id, requirementId, category as Positive|Negative|Boundary|Edge, title, preconditions as array of strings, steps as array of strings, expectedResult as string, priority as High|Medium|Low), coverageGaps (array of strings). Cover all four categories; use clear expected results and identify unspecified behavior as a coverage gap rather than inventing it. Link requirementId to the provided requirement IDs where available.`
} as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  // No end-user authentication exists yet in this demo. Apply auth and rate limiting before public deployment.
  const { agent, input } = req.body ?? {}
  if ((agent !== 'requirements' && agent !== 'scenarios') || typeof input !== 'string' ||
      !input.trim() || input.length > MAX_INPUT) {
    return res.status(400).json({ error: 'Provide a valid agent and requirements text (up to 12,000 characters).' })
  }
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'OPENAI_API_KEY is not configured on the server.' })

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const response = await client.responses.create({
      model: process.env.AGENT_MODEL || 'gpt-4.1-mini',
      instructions: instructions[agent as keyof typeof instructions],
      input: input.trim(),
      text: { format: { type: 'json_object' } },
      max_output_tokens: 6500,
    })
    if (!response.output_text || response.output_text.length > MAX_OUTPUT) {
      return res.status(502).json({ error: 'Agent response was empty or too large.' })
    }
    const result: unknown = JSON.parse(response.output_text)
    if (!isRecord(result) || typeof result.summary !== 'string' ||
      (agent === 'requirements' && (!Array.isArray(result.structuredRequirements) || !Array.isArray(result.gaps))) ||
      (agent === 'scenarios' && !Array.isArray(result.scenarios))) {
      return res.status(502).json({ error: 'Agent returned an invalid result structure.' })
    }
    return res.status(200).json({ agent, result })
  } catch (error) {
    console.error('Agent execution failed', error instanceof Error ? error.message : 'unknown error')
    return res.status(502).json({ error: 'Unable to generate the analysis. Please retry.' })
  }
}
