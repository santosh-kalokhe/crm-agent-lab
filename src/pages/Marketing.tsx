import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'

type Campaign = {
  id: number
  name: string
  audience: number
  status: string
  responses: number
}

const emptyForm = {
  name: '',
  audience: '0',
  status: 'Draft',
  responses: '0',
}

export default function Marketing() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)

  async function loadCampaigns() {
    if (!supabase) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      alert(error.message)
    } else {
      setCampaigns(data ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadCampaigns()
  }, [])

  function startCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function startEdit(item: Campaign) {
    setEditingId(item.id)

    setForm({
      name: item.name,
      audience: String(item.audience),
      status: item.status,
      responses: String(item.responses),
    })

    setShowForm(true)
  }

  function cancelForm() {
    setEditingId(null)
    setShowForm(false)
    setForm(emptyForm)
  }

  async function saveCampaign(e: FormEvent) {
    e.preventDefault()

    if (!supabase) return

    const payload = {
      name: form.name,
      audience: Number(form.audience),
      status: form.status,
      responses: Number(form.responses),
    }

    const result = editingId
      ? await supabase
          .from('campaigns')
          .update(payload)
          .eq('id', editingId)
      : await supabase
          .from('campaigns')
          .insert(payload)

    if (result.error) {
      alert(result.error.message)
      return
    }

    cancelForm()
    await loadCampaigns()
  }

  async function deleteCampaign(id: number) {
    if (!supabase) return

    if (!confirm('Delete this campaign?')) return

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    await loadCampaigns()
  }

  return (
    <>
      <div className="pageHeader">
        <div>
          <h1>Marketing</h1>
          <p>Manage marketing campaigns.</p>
        </div>

        <button className="primary" onClick={startCreate}>
          + New campaign
        </button>
      </div>

      {showForm && (
        <section className="card" style={{ marginBottom: 20 }}>
          <h2>
            {editingId ? 'Edit Campaign' : 'New Campaign'}
          </h2>

          <form onSubmit={saveCampaign}>
            <div
              style={{
                display: 'grid',
                gap: 12,
                maxWidth: 600,
              }}
            >
              <input
                required
                placeholder="Campaign name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />

              <input
                type="number"
                min="0"
                placeholder="Audience"
                value={form.audience}
                onChange={(e) =>
                  setForm({
                    ...form,
                    audience: e.target.value,
                  })
                }
              />

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
              >
                <option>Draft</option>
                <option>Scheduled</option>
                <option>Active</option>
                <option>Paused</option>
                <option>Completed</option>
              </select>

              <input
                type="number"
                min="0"
                placeholder="Responses"
                value={form.responses}
                onChange={(e) =>
                  setForm({
                    ...form,
                    responses: e.target.value,
                  })
                }
              />

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="primary" type="submit">
                  {editingId
                    ? 'Update Campaign'
                    : 'Save Campaign'}
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
          <p>Loading campaigns...</p>
        ) : campaigns.length === 0 ? (
          <p>No campaigns yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Audience</th>
                <th>Status</th>
                <th>Responses</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {campaigns.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td>
                    {Number(item.audience).toLocaleString()}
                  </td>
                  <td>
                    <span className="pill">{item.status}</span>
                  </td>
                  <td>
                    {Number(item.responses).toLocaleString()}
                  </td>
                  <td>
                    <button onClick={() => startEdit(item)}>
                      Edit
                    </button>{' '}
                    <button
                      onClick={() =>
                        deleteCampaign(item.id)
                      }
                    >
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