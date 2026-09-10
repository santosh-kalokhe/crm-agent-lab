import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Lead = {
  id: number
  name: string
  company: string | null
  email: string | null
  status: string
  value: number
}

export default function Sales() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('New')
  const [value, setValue] = useState('0')

  async function loadLeads() {
    if (!supabase) {
      console.error('Supabase is not configured')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading leads:', error)
    } else {
      setLeads(data ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadLeads()
  }, [])

  async function addLead(e: React.FormEvent) {
    e.preventDefault()

    if (!supabase) {
      alert('Supabase is not configured')
      return
    }

    const { error } = await supabase.from('leads').insert({
      name,
      company,
      email,
      status,
      value: Number(value),
    })

    if (error) {
      console.error(error)
      alert(`Could not add lead: ${error.message}`)
      return
    }

    setName('')
    setCompany('')
    setEmail('')
    setStatus('New')
    setValue('0')
    setShowForm(false)

    await loadLeads()
  }

  return (
    <>
      <div className="pageHeader">
        <div>
          <h1>Sales</h1>
          <p>Manage leads and opportunities.</p>
        </div>

        <button
          className="primary"
          onClick={() => setShowForm(!showForm)}
        >
          + Add lead
        </button>
      </div>

      {showForm && (
        <section className="card" style={{ marginBottom: '20px' }}>
          <h2>New Lead</h2>

          <form onSubmit={addLead}>
            <div style={{ display: 'grid', gap: '12px', maxWidth: '500px' }}>
              <input
                required
                placeholder="Lead name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                placeholder="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>New</option>
                <option>Contacted</option>
                <option>Qualified</option>
                <option>Proposal</option>
                <option>Won</option>
                <option>Lost</option>
              </select>

              <input
                type="number"
                min="0"
                placeholder="Potential value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />

              <button className="primary" type="submit">
                Save Lead
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="card tableCard">
        {loading ? (
          <p>Loading leads...</p>
        ) : leads.length === 0 ? (
          <p>No leads yet. Click "+ Add lead" to create the first one.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Lead</th>
                <th>Company</th>
                <th>Email</th>
                <th>Status</th>
                <th>Potential</th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <strong>{lead.name}</strong>
                  </td>
                  <td>{lead.company || '-'}</td>
                  <td>{lead.email || '-'}</td>
                  <td>
                    <span className="pill">{lead.status}</span>
                  </td>
                  <td>
                    ${Number(lead.value || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  )
}