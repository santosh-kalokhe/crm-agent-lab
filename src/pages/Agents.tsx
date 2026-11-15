import { useState } from 'react'

type Agent = 'requirements' | 'scenarios'
type Result = Record<string, unknown>
const example = 'As a sales user, I want to create a lead with name, email and deal value so that I can track new opportunities. Email must be valid and deal value cannot be negative.'

export default function Agents() {
  const [input, setInput] = useState('')
  const [analysis, setAnalysis] = useState<Result | null>(null)
  const [scenarios, setScenarios] = useState<Result | null>(null)
  const [loading, setLoading] = useState<Agent | null>(null)
  const [error, setError] = useState('')
  const [useAnalysis, setUseAnalysis] = useState(true)

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
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Agent request failed')
      if (agent === 'requirements') { setAnalysis(data.result); setScenarios(null) }
      else setScenarios(data.result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error')
    } finally { setLoading(null) }
  }

  function download(name: string, result: Result) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
    URL.revokeObjectURL(url)
  }

  function renderResult(title: string, result: Result, filename: string) {
    return <section className="card" style={{ marginTop: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <h2>{title}</h2>
        <button onClick={() => download(filename, result)}>Download JSON</button>
      </div>
      <p>{String(result.summary || '')}</p>
      {Object.entries(result).filter(([key]) => key !== 'summary').map(([key, value]) =>
        <div key={key} style={{ marginTop: 14 }}>
          <h3>{key.replace(/([A-Z])/g, ' $1')}</h3>
          {Array.isArray(value) ? (value.length ? value.map((item, i) =>
            <div key={i} style={{ borderTop: '1px solid #ddd', padding: '10px 0' }}>
              {typeof item === 'string' ? item : <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{JSON.stringify(item, null, 2)}</pre>}
            </div>) : <p>None identified.</p>) : <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(value, null, 2)}</pre>}
        </div>
      )}
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
    {analysis && renderResult('Agent 1 — Requirement Analysis', analysis, 'requirement-analysis.json')}
    {scenarios && renderResult('Agent 2 — Test Scenarios', scenarios, 'test-scenarios.json')}
  </div>
}
