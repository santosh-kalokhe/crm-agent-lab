import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'

type Lead = {
  id: number
  name: string
  company: string | null
  email: string | null
  status: string
  value: number
}

const emptyForm = {
  name: '',
  company: '',
  email: '',
  status: 'New',
  value: '0',
}

export default function Sales() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)

  async function loadLeads() {
    if (!supabase) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      alert(error.message)
    } else {
      setLeads(data ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadLeads()
  }, [])

  function startCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function startEdit(lead: Lead) {
    setEditingId(lead.id)
    setForm({
      name: lead.name,
      company: lead.company ?? '',
      email: lead.email ?? '',
      status: lead.status,
      value: String(lead.value ?? 0),
    })
    setShowForm(true)
  }

  function cancelForm() {
    setEditingId(null)
    setShowForm(false)
    setForm(emptyForm)
  }

  async function saveLead(e: FormEvent) {
    e.preventDefault()

    if (!supabase) return

    const payload = {
      name: form.name,
      company: form.company,
      email: form.email,
      status: form.status,
      value: Number(form.value),
    }

    const result = editingId
      ? await supabase
          .from('leads')
          .update(payload)
          .eq('id', editingId)
      : await supabase
          .from('leads')
          .insert(payload)

    if (result.error) {
      alert(result.error.message)
      return
    }

    cancelForm()
    await loadLeads()
  }

  async function deleteLead(id: number) {
    if (!supabase) return

    if (!confirm('Delete this lead?')) return

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    await loadLeads()
  }

  return (
    <>
      <div className="pageHeader">
        <div>
          <h1>Sales</h1>
          <p>Manage leads and opportunities.</p>
        </div>

        <button className="primary" onClick={startCreate}>
          + Add lead
        </button>
      </div>

      {showForm && (
        <section className="card" style={{ marginBottom: 20 }}>
          <h2>{editingId ? 'Edit Lead' : 'New Lead'}</h2>

          <form onSubmit={saveLead}>
            <div
              style={{
                display: 'grid',
                gap: 12,
                maxWidth: 600,
              }}
            >
              <input
                required
                placeholder="Lead name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <input
                placeholder="Company"
                value={form.company}
                onChange={(e) =>
                  setForm({ ...form, company: e.target.value })
                }
              />

              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
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
                value={form.value}
                onChange={(e) =>
                  setForm({ ...form, value: e.target.value })
                }
              />

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="primary" type="submit">
                  {editingId ? 'Update Lead' : 'Save Lead'}
                </button>

                <button type="button" onClick={cancelForm}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      <section className="card tableCard">
        {loading ? (
          <p>Loading leads...</p>
        ) : leads.length === 0 ? (
          <p>No leads yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Lead</th>
                <th>Company</th>
                <th>Email</th>
                <th>Status</th>
                <th>Potential</th>
                <th>Actions</th>
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
                    ${Number(lead.value).toLocaleString()}
                  </td>
                  <td>
                    <button onClick={() => startEdit(lead)}>
                      Edit
                    </button>{' '}
                    <button onClick={() => deleteLead(lead.id)}>
                      Delete
                    </button>
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