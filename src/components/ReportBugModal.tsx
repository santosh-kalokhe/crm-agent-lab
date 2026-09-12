import { useState } from 'react'
import type { FormEvent } from 'react'
import { submitBugReport } from '../lib/bugApi'
import { isSupabaseConfigured } from '../lib/supabase'
import type {
  BugModule,
  BugSeverity,
} from '../types/bug'

type Props = {
  onClose: () => void
}

function getEnvironment():
  | 'production'
  | 'preview'
  | 'development' {
  if (window.location.hostname === 'localhost') {
    return 'development'
  }

  if (window.location.hostname.includes('vercel.app')) {
    return 'production'
  }

  return 'preview'
}

function getBrowser() {
  const agent = navigator.userAgent

  if (agent.includes('Edg/')) return 'Microsoft Edge'
  if (agent.includes('Chrome/')) return 'Chrome'
  if (agent.includes('Firefox/')) return 'Firefox'
  if (agent.includes('Safari/')) return 'Safari'

  return 'Unknown'
}

export default function ReportBugModal({
  onClose,
}: Props) {
  const [title, setTitle] = useState('')
  const [module, setModule] =
    useState<BugModule>('dashboard')
  const [severity, setSeverity] =
    useState<BugSeverity>('medium')
  const [actualBehavior, setActualBehavior] =
    useState('')
  const [expectedBehavior, setExpectedBehavior] =
    useState('')
  const [stepsText, setStepsText] = useState('')
  const [additionalNotes, setAdditionalNotes] =
    useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [issueUrl, setIssueUrl] = useState('')
  const [issueNumber, setIssueNumber] =
    useState<number | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (title.trim().length < 10) {
      setError('Title must be at least 10 characters.')
      return
    }

    if (actualBehavior.trim().length < 20) {
      setError(
        'What happened must be at least 20 characters.'
      )
      return
    }

    if (expectedBehavior.trim().length < 10) {
      setError(
        'Expected behavior must be at least 10 characters.'
      )
      return
    }

    if (stepsText.trim().length < 20) {
      setError(
        'Steps to reproduce must be at least 20 characters.'
      )
      return
    }

    const stepsToReproduce = stepsText
      .split('\n')
      .map(step =>
        step.replace(/^\d+[.)]\s*/, '').trim()
      )
      .filter(Boolean)

    if (stepsToReproduce.length === 0) {
      setError(
        'Please provide at least one reproduction step.'
      )
      return
    }

    setSubmitting(true)

    try {
      const result = await submitBugReport({
        source: 'manual-report',
        title: title.trim(),
        module,
        severity,
        actualBehavior: actualBehavior.trim(),
        expectedBehavior: expectedBehavior.trim(),
        stepsToReproduce,
        additionalNotes:
          additionalNotes.trim() || undefined,

        context: {
          application: 'CRM Agent Lab',
          environment: getEnvironment(),
          pageUrl: window.location.href,
          route: window.location.pathname,
          browser: getBrowser(),
          userAgent: navigator.userAgent,
          reportedAt: new Date().toISOString(),
          supabaseConnected: isSupabaseConfigured,
        },
      })

      if (!result.issue) {
        throw new Error(
          'GitHub issue was not returned.'
        )
      }

      setIssueUrl(result.issue.url)
      setIssueNumber(result.issue.number)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit bug.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (issueUrl) {
    return (
      <div style={overlayStyle}>
        <div style={modalStyle}>
          <h2>Bug reported successfully</h2>

          <p>
            GitHub Issue #{issueNumber} was created.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 20,
            }}
          >
            <a
              className="primary"
              href={issueUrl}
              target="_blank"
              rel="noreferrer"
            >
              View Issue
            </a>

            <button onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2>Report Bug</h2>
            <p>
              Send a structured defect to the
              Bug Creation Agent.
            </p>
          </div>

          <button onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={formStyle}>
            <label>
              Title
              <input
                required
                maxLength={120}
                value={title}
                onChange={e =>
                  setTitle(e.target.value)
                }
                placeholder="Pipeline total incorrect after adding lead"
              />
            </label>

            <label>
              Module
              <select
                value={module}
                onChange={e =>
                  setModule(
                    e.target.value as BugModule
                  )
                }
              >
                <option value="dashboard">
                  Dashboard
                </option>

                <option value="sales">
                  Sales
                </option>

                <option value="customer-service">
                  Customer Service
                </option>

                <option value="marketing">
                  Marketing
                </option>

                <option value="agent-control-center">
                  Agent Control Center
                </option>
              </select>
            </label>

            <label>
              Severity
              <select
                value={severity}
                onChange={e =>
                  setSeverity(
                    e.target.value as BugSeverity
                  )
                }
              >
                <option value="low">Low</option>
                <option value="medium">
                  Medium
                </option>
                <option value="high">High</option>
                <option value="critical">
                  Critical
                </option>
              </select>
            </label>

            <label>
              What happened
              <textarea
                required
                rows={4}
                value={actualBehavior}
                onChange={e =>
                  setActualBehavior(
                    e.target.value
                  )
                }
              />
            </label>

            <label>
              Expected behavior
              <textarea
                required
                rows={3}
                value={expectedBehavior}
                onChange={e =>
                  setExpectedBehavior(
                    e.target.value
                  )
                }
              />
            </label>

            <label>
              Steps to reproduce
              <textarea
                required
                rows={6}
                value={stepsText}
                onChange={e =>
                  setStepsText(e.target.value)
                }
                placeholder={`1. Open Sales
2. Add a lead
3. Enter value 50000
4. Save
5. Open Dashboard`}
              />
            </label>

            <label>
              Additional notes
              <textarea
                rows={3}
                maxLength={2000}
                value={additionalNotes}
                onChange={e =>
                  setAdditionalNotes(
                    e.target.value
                  )
                }
              />
            </label>

            {error && (
              <p style={{ color: 'crimson' }}>
                {error}
              </p>
            )}

            <div
              style={{
                display: 'flex',
                gap: 10,
              }}
            >
              <button
                className="primary"
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? 'Submitting...'
                  : 'Submit Bug'}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 20,
}

const modalStyle: React.CSSProperties = {
  background: 'white',
  width: '100%',
  maxWidth: 700,
  maxHeight: '90vh',
  overflowY: 'auto',
  borderRadius: 14,
  padding: 24,
}

const formStyle: React.CSSProperties = {
  display: 'grid',
  gap: 16,
}