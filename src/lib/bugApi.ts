import type {
  BugReportPayload,
  BugReportResponse,
} from '../types/bug'

export async function submitBugReport(
  payload: BugReportPayload
): Promise<BugReportResponse> {
  const response = await fetch('/api/bugs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Unable to submit bug')
  }

  return data
}