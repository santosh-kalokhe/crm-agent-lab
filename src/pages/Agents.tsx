import { useState } from 'react'
import type { ReactNode } from 'react'

type Agent = 'requirements' | 'scenarios'
type Result = Record<string, unknown>
async function readApiResponse(response: Response): Promise<Record<string, any>> {
  const raw = await response.text()
  let data: Record<string, any>
  try {
    data = JSON.parse(raw)
  } catch {
    const summary = raw.trim().slice(0, 180)
    throw new Error('Server returned HTTP ' + response.status + ' instead of JSON. ' +
      (summary.startsWith('A server') ? 'The server function may have failed or timed out. Check Vercel function logs.' :
        'Response: ' + summary))
  }
  if (!response.ok) throw new Error(data.error || 'Server request failed (HTTP ' + response.status + ')')
  return data
}

const example = 'As a sales user, I want to create a lead with name, email and deal value so that I can track new opportunities. Email must be valid and deal value cannot be negative.'

export default function Agents() {
  const [input, setInput] = useState('')
  const [analysis, setAnalysis] = useState<Result | null>(null)
  const [scenarios, setScenarios] = useState<Result | null>(null)
  const [loading, setLoading] = useState<Agent | null>(null)
  const [error, setError] = useState('')
  const [useAnalysis, setUseAnalysis] = useState(true)
  const [selection, setSelection] = useState('all')
  const [automation, setAutomation] = useState<{ summary: string; code: string; warnings: string[] } | null>(null)
  const [automationLoading, setAutomationLoading] = useState(false)
  const [pullRequest, setPullRequest] = useState('')

  async function run(agent: Agent) {
    const source = agent === 'scenarios' && useAnalysis && analysis
      ? JSON.stringify(analysis) : input.trim()
    if (!source) { setError('Enter requirements first.'); return }
    setLoading(agent)
    setError('')
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent, input: source }),
      })
      const data = await readApiResponse(response)
      if (agent === 'requirements') { setAnalysis(data.result); setScenarios(null); setAutomation(null) }
      else { setScenarios(data.result); setAutomation(null) }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error')
    } finally { setLoading(null) }
  }

  async function generateAutomation() {
    if (!scenarios || !Array.isArray(scenarios.scenarios)) return
    setAutomationLoading(true)
    setError('')
    try {
      const response = await fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarios: scenarios.scenarios, selection }),
      })
      const data = await readApiResponse(response)
      setAutomation(data.result)
      setPullRequest(data.pullRequest?.url || '')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error')
    } finally { setAutomationLoading(false) }
  }

  function downloadCode() {
    if (!automation) return
    const url = URL.createObjectURL(new Blob([automation.code], { type: 'text/plain' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'agent3-generated.spec.ts'
    link.click()
    URL.revokeObjectURL(url)
  }

  function download(name: string, result: Result) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
    URL.revokeObjectURL(url)
  }

  function asObjects(value: unknown): Record<string, unknown>[] {
    return Array.isArray(value) ? value.filter(
      (item): item is Record<string, unknown> => item !== null && typeof item === 'object' && !Array.isArray(item)
    ) : []
  }

  function strings(value: unknown): string[] {
    return Array.isArray(value) ? value.map(String) : []
  }

  function field(value: unknown): string {
    return value == null ? 'Not specified' : String(value)
  }

  function bulletList(value: unknown) {
    const items = strings(value)
    return items.length
      ? <ul style={{ paddingLeft: 22, marginTop: 8 }}>{items.map((item, index) => <li key={index} style={{ marginBottom: 5 }}>{item}</li>)}</ul>
      : <p style={{ opacity: 0.7 }}>None identified.</p>
  }

  function pill(label: string) {
    return <span style={{ display: 'inline-block', borderRadius: 999, background: 'var(--surface-secondary, #e9edf4)', color: 'var(--text-primary, #243247)', padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>{label}</span>
  }

  function itemCard(children: ReactNode, key: string | number) {
    return <article key={key} style={{ border: '1px solid var(--border, #d9dfe8)', borderRadius: 10, padding: 16, marginTop: 12 }}>{children}</article>
  }

  function renderAnalysis(result: Result) {
    return <>
      <h3>Structured requirements</h3>
      {asObjects(result.structuredRequirements).length
        ? asObjects(result.structuredRequirements).map((req, index) => itemCard(<>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {pill(field(req.id))}{pill(field(req.priority))}
              <strong>{field(req.title)}</strong>
            </div>
            <p>{field(req.description)}</p>
            <h4>Acceptance criteria</h4>
            {bulletList(req.acceptanceCriteria)}
          </>, index))
        : <p>No structured requirements generated.</p>}
      <h3 style={{ marginTop: 22 }}>Gaps and clarification questions</h3>
      {asObjects(result.gaps).length
        ? asObjects(result.gaps).map((gap, index) => itemCard(<>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{pill(field(gap.id))}{pill(field(gap.severity))}</div>
            <p><strong>{field(gap.question)}</strong></p>
            <p>Impact: {field(gap.impact)}</p>
          </>, index))
        : <p>No gaps identified.</p>}
      <h3 style={{ marginTop: 22 }}>Assumptions</h3>
      {bulletList(result.assumptions)}
      <h3>Non-functional requirements</h3>
      {bulletList(result.nonFunctionalRequirements)}
    </>
  }

  function renderScenarios(result: Result) {
    const items = asObjects(result.scenarios)
    const categories = ['Positive', 'Negative', 'Boundary', 'Edge']
    return <>
      <h3>Test scenario coverage ({items.length})</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {categories.map(category => pill(`${category}: ${items.filter(item => item.category === category).length}`))}
      </div>
      {categories.map(category => {
        const group = items.filter(item => item.category === category)
        return <section key={category} style={{ marginTop: 20 }}>
          <h3>{category} scenarios</h3>
          {group.length ? group.map((scenario, index) => itemCard(<>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {pill(field(scenario.id))}
              {pill(`Requirement: ${field(scenario.requirementId)}`)}
              {pill(`Priority: ${field(scenario.priority)}`)}
            </div>
            <h4 style={{ marginTop: 12 }}>{field(scenario.title)}</h4>
            <strong>Preconditions</strong>
            {bulletList(scenario.preconditions)}
            <strong>Steps</strong>
            <ol style={{ paddingLeft: 22 }}>{strings(scenario.steps).map((step, i) => <li key={i} style={{ marginBottom: 5 }}>{step}</li>)}</ol>
            <strong>Expected result</strong>
            <p>{field(scenario.expectedResult)}</p>
          </>, index)) : <p>No {category.toLowerCase()} scenarios generated.</p>}
        </section>
      })}
      <h3 style={{ marginTop: 22 }}>Coverage gaps</h3>
      {bulletList(result.coverageGaps)}
    </>
  }

  function renderResult(title: string, result: Result, filename: string, agent: Agent) {
    return <section className="card" style={{ marginTop: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2>{title}</h2>
        <button onClick={() => download(filename, result)}>Download JSON</button>
      </div>
      <p>{field(result.summary)}</p>
      {agent === 'requirements' ? renderAnalysis(result) : renderScenarios(result)}
    </section>
  }

  return <div>
    <div className="pageHeader"><div><h1>AI Requirements & Test Agents</h1>
      <p>Analyze requirements, identify gaps, and generate traceable test scenarios.</p></div></div>
    <section className="card">
      <h2>Input requirements</h2>
      <textarea aria-label="Requirements" rows={9} maxLength={12000} value={input}
        onChange={e => setInput(e.target.value)} placeholder={example}
        style={{ width: '100%', padding: 12, boxSizing: 'border-box' }} />
      <p>{input.length} / 12,000 characters</p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={() => setInput(example)}>Load example</button>
        <button className="primary" disabled={!!loading || !input.trim()} onClick={() => run('requirements')}>
          {loading === 'requirements' ? 'Analyzing…' : '1. Analyze Requirements'}
        </button>
        <button className="primary" disabled={!!loading || (!input.trim() && !analysis)}
          onClick={() => run('scenarios')}>
          {loading === 'scenarios' ? 'Generating…' : '2. Generate Test Scenarios'}
        </button>
      </div>
      <label style={{ display: 'block', marginTop: 12 }}>
        <input type="checkbox" checked={useAnalysis} onChange={e => setUseAnalysis(e.target.checked)} />
        Use structured analysis for scenario generation when available
      </label>
      {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}
    </section>
    {analysis && renderResult('Agent 1 — Requirement Analysis', analysis, 'requirement-analysis.json', 'requirements')}
    {scenarios && renderResult('Agent 2 — Test Scenarios', scenarios, 'test-scenarios.json', 'scenarios')}
    {scenarios && <section className="card" style={{ marginTop: 18 }}>
      <h2>Agent 3 — Playwright Test Automation</h2>
      <p>Enter scenario IDs separated by commas (for example TS-1, TS-2), or all.</p>
      <label htmlFor="scenario-selection">Scenario selection</label>
      <input id="scenario-selection" value={selection} onChange={e => setSelection(e.target.value)}
        placeholder="TS-1, TS-2 or all" style={{ display: 'block', width: '100%', maxWidth: 460, padding: 10, margin: '10px 0' }} />
      <button className="primary" disabled={!!loading || automationLoading || !selection.trim()} onClick={generateAutomation}>
        {automationLoading ? 'Generating tests and creating PR…' : '3. Generate Playwright Tests & PR'}
      </button>
      {automation && <div style={{ marginTop: 18 }}>
        <h3>Generated Playwright automation</h3>
        <p>{automation.summary}</p>
        <button onClick={downloadCode}>Download .spec.ts</button>
        {pullRequest && <p role="status" style={{ marginTop: 14 }}>
          Draft pull request created: <a href={pullRequest} target="_blank" rel="noopener noreferrer">
            View Playwright pull request on GitHub</a>
        </p>}
        {automation.warnings?.length > 0 && <><h4>Review needed</h4>{bulletList(automation.warnings)}</>}
        <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', padding: 16, background: 'var(--surface-secondary, #edf1f6)', borderRadius: 8 }}>
          <code>{automation.code}</code>
        </pre>
      </div>}
    </section>}
  </div>
}
