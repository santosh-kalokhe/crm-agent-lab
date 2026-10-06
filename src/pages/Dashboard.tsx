import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import KpiCard from '../components/KpiCard'

type Lead = {
  id: number
  status: string
  value: number
}

type CaseRecord = {
  id: number
  priority: string
  status: string
}

type Campaign = {
  id: number
  audience: number
  status: string
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [cases, setCases] = useState<CaseRecord[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadDashboard() {
    if (!supabase) {
      setError('Supabase is not configured')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const [
      { data: leadData, error: leadError },
      { data: caseData, error: caseError },
      { data: campaignData, error: campaignError },
    ] = await Promise.all([
      supabase.from('leads').select('id,status,value'),
      supabase.from('cases').select('id,priority,status'),
      supabase.from('campaigns').select('id,audience,status'),
    ])

    const firstError =
      leadError || caseError || campaignError

    if (firstError) {
      console.error('Dashboard load error:', firstError)
      setError(firstError.message)
      setLoading(false)
      return
    }

    setLeads((leadData as Lead[]) ?? [])
    setCases((caseData as CaseRecord[]) ?? [])
    setCampaigns((campaignData as Campaign[]) ?? [])

    setLoading(false)
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const metrics = useMemo(() => {
    const pipeline = leads.reduce(
      (sum, lead) => sum + Number(lead.value || 0),
      0
    )

    const openCases = cases.filter(
      item =>
        item.status !== 'Closed' &&
        item.status !== 'Resolved'
    ).length

    const highPriorityCases = cases.filter(
      item =>
        item.priority === 'High' ||
        item.priority === 'Critical'
    ).length

    const activeCampaigns = campaigns.filter(
      item => item.status === 'Active'
    ).length

    const totalAudience = campaigns.reduce(
      (sum, item) => sum + Number(item.audience || 0),
      0
    )

    const wonLeads = leads.filter(
      lead => lead.status === 'Won'
    ).length

    const winRate =
      leads.length === 0
        ? 0
        : Math.round((wonLeads / leads.length) * 100)

    const pipelineByStatus = leads.reduce<
      Record<string, number>
    >((acc, lead) => {
      const status = lead.status || 'Unknown'

      acc[status] =
        (acc[status] || 0) +
        Number(lead.value || 0)

      return acc
    }, {})

    return {
      pipeline,
      openCases,
      highPriorityCases,
      activeCampaigns,
      totalAudience,
      wonLeads,
      winRate,
      pipelineByStatus,
    }
  }, [leads, cases, campaigns])

  const pipelineRows = [
    'New',
    'Contacted',
    'Qualified',
    'Proposal',
    'Won',
  ]

  const maxPipelineValue = Math.max(
    ...pipelineRows.map(
      status => metrics.pipelineByStatus[status] || 0
    ),
    1
  )

  if (loading) {
    return (
      <>
        <div className="pageHeader">
          <div>
            <h1>CRM Dashboard</h1>
            <p>Loading live CRM data...</p>
          </div>
        </div>

        <section className="card">
          <p>Loading dashboard...</p>
        </section>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="pageHeader">
          <div>
            <h1>CRM Dashboard</h1>
            <p>Business overview and operational health.</p>
          </div>
        </div>

        <section className="card">
          <p>Unable to load dashboard: {error}</p>

          <button
            className="primary"
            onClick={loadDashboard}
          >
            Retry
          </button>
        </section>
      </>
    )
  }

  return (
    <>
      <div className="pageHeader">
        <div>
          <h1>CRM Dashboard</h1>
          <p>Live business overview from Supabase.</p>
        </div>

        <button
          className="primary"
          onClick={loadDashboard}
        >
          Refresh
        </button>
      </div>

      <div className="kpiGrid">
        <KpiCard
          label="Pipeline"
          value={`$${metrics.pipeline.toLocaleString()}`}
          detail={`${leads.length} leads`}
        />

        <KpiCard
          label="Open Cases"
          value={String(metrics.openCases)}
          detail={`${metrics.highPriorityCases} high priority`}
        />

        <KpiCard
          label="Active Campaigns"
          value={String(metrics.activeCampaigns)}
          detail={`${metrics.totalAudience.toLocaleString()} total audience`}
        />

        <KpiCard
          label="Win Rate"
          value={`${metrics.winRate}%`}
          detail={`${metrics.wonLeads} won leads`}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 20,
        }}
      >
        <section className="card">
          <h2>Sales pipeline</h2>

          {pipelineRows.map(status => {
            const value =
              metrics.pipelineByStatus[status] || 0

            const width =
              (value / maxPipelineValue) * 100

            return (
              <div
                key={status}
                style={{
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 7,
                  }}
                >
                  <span>{status}</span>

                  <strong>
                    ${value.toLocaleString()}
                  </strong>
                </div>

                <div
                  style={{
                    width: '100%',
                    height: 8,
                    background: '#e5e7eb',
                    borderRadius: 999,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${width}%`,
                      height: '100%',
                      background: '#2563eb',
                      borderRadius: 999,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </section>

        <section className="card">
          <h2>Agentic SDLC readiness</h2>

          <div style={{ lineHeight: 2.2 }}>
            <div>🟢 CRM shell created</div>
            <div>🟢 Deployable frontend</div>
            <div>🟢 Supabase database connected</div>
            <div>🟢 Live dashboard</div>
            <div>🟢 Complete CRM CRUD</div>
            <div>⚪ Add GitHub issue workflow</div>
            <div>⚪ Add autonomous agents</div>
          </div>
        </section>
      </div>
    </>
  )
}
