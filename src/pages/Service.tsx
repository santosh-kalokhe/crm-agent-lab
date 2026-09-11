import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'

type CaseRecord = {
  id: number
  case_number: string
  customer: string
  title: string
  priority: string
  status: string
}

const emptyForm = {
  case_number: '',
  customer: '',
  title: '',
  priority: 'Medium',
  status: 'Open',
}

export default function Service() {
  const [cases, setCases] = useState<CaseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)

  async function loadCases() {
    if (!supabase) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      alert(error.message)
    } else {
      setCases(data ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadCases()
  }, [])

  function startCreate() {
    setEditingId(null)

    setForm({
      ...emptyForm,
      case_number: `CASE-${Date.now()}`,
    })

    setShowForm(true)
  }

  function startEdit(item: CaseRecord) {
    setEditingId(item.id)

    setForm({
      case_number: item.case_number,
      customer: item.customer,
      title: item.title,
      priority: item.priority,
      status: item.status,
    })

    setShowForm(true)
  }

  function cancelForm() {
    setEditingId(null)
    setShowForm(false)
    setForm(emptyForm)
  }

  async function saveCase(e: FormEvent) {
    e.preventDefault()

    if (!supabase) return

    const payload = {
      case_number: form.case_number,
      customer: form.customer,
      title: form.title,
      priority: form.priority,
      status: form.status,
    }

    const result = editingId
      ? await supabase
          .from('cases')
          .update(payload)
          .eq('id', editingId)
      : await supabase
          .from('cases')
          .insert(payload)

    if (result.error) {
      alert(result.error.message)
      return
    }

    cancelForm()
    await loadCases()
  }

  async function deleteCase(id: number) {
    if (!supabase) return

    if (!confirm('Delete this case?')) return

    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    await loadCases()
  }

  return (
    <>
      <div className="pageHeader">
        <div>
          <h1>Customer Service</h1>
          <p>Manage customer support cases.</p>
        </div>

        <button className="primary" onClick={startCreate}>
          + New case
        </button>
      </div>

      {showForm && (
        <section className="card" style={{ marginBottom: 20 }}>
          <h2>{editingId ? 'Edit Case' : 'New Case'}</h2>

          <form onSubmit={saveCase}>
            <div
              style={{
                display: 'grid',
                gap: 12,
                maxWidth: 600,
              }}
            >
              <input
                required
                placeholder="Case number"
                value={form.case_number}
                onChange={(e) =>
                  setForm({
                    ...form,
                    case_number: e.target.value,
                  })
                }
              />

              <input
                required
                placeholder="Customer"
                value={form.customer}
                onChange={(e) =>
                  setForm({
                    ...form,
                    customer: e.target.value,
                  })
                }
              />

              <input
                required
                placeholder="Case title"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
              />

              <select
                value={form.priority}
                onChange={(e) =>
                  setForm({
                    ...form,
                    priority: e.target.value,
                  })
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
                <option>Closed</option>
              </select>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="primary" type="submit">
                  {editingId ? 'Update Case' : 'Save Case'}
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
          <p>Loading cases...</p>
        ) : cases.length === 0 ? (
          <p>No cases yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Case</th>
                <th>Customer</th>
                <th>Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {cases.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.case_number}</strong>
                  </td>
                  <td>{item.customer}</td>
                  <td>{item.title}</td>
                  <td>
                    <span className="pill">{item.priority}</span>
                  </td>
                  <td>{item.status}</td>
                  <td>
                    <button onClick={() => startEdit(item)}>
                      Edit
                    </button>{' '}
                    <button onClick={() => deleteCase(item.id)}>
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