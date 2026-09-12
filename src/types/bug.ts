export type BugModule =
  | 'dashboard'
  | 'sales'
  | 'customer-service'
  | 'marketing'
  | 'agent-control-center'

export type BugSeverity =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'

export type BugReportPayload = {
  source: 'manual-report'
  title: string
  module: BugModule
  severity: BugSeverity
  actualBehavior: string
  expectedBehavior: string
  stepsToReproduce: string[]
  additionalNotes?: string
  context: {
    application: 'CRM Agent Lab'
    environment: 'production' | 'preview' | 'development'
    pageUrl: string
    route: string
    browser: string
    userAgent: string
    reportedAt: string
    supabaseConnected: boolean
  }
}

export type BugReportResponse = {
  success: boolean
  issue?: {
    number: number
    title: string
    url: string
  }
  error?: string
}