import { useState, useEffect } from 'react'
import { getPipelines, createPipeline, triggerPipeline, getRuns, deletePipeline } from './api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const STATUS_COLORS = {
  success: '#22c55e',
  failed:  '#ef4444',
  running: '#f59e0b',
  pending: '#6366f1',
  never:   '#64748b',
}

const Badge = ({ status }) => (
  <span style={{
    background: STATUS_COLORS[status] + '22',
    color: STATUS_COLORS[status],
    border: `1px solid ${STATUS_COLORS[status]}44`,
    padding: '2px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 500,
    textTransform: 'capitalize'
  }}>{status}</span>
)

const Card = ({ children, style }) => (
  <div style={{
    background: '#1a1d2e',
    border: '1px solid #2d3154',
    borderRadius: 12,
    padding: '20px 24px',
    ...style
  }}>{children}</div>
)

export default function App() {
  const [pipelines, setPipelines] = useState([])
  const [selected,  setSelected]  = useState(null)
  const [runs,      setRuns]      = useState([])
  const [loading,   setLoading]   = useState(false)
  const [form,      setForm]      = useState({ name: '', description: '', source: 'CSV' })
  const [showForm,  setShowForm]  = useState(false)
  const [activeLog, setActiveLog] = useState(null)

  const fetchPipelines = async () => {
    const res = await getPipelines()
    setPipelines(res.data)
  }

  const fetchRuns = async (id) => {
    const res = await getRuns(id)
    setRuns(res.data)
  }

  useEffect(() => { fetchPipelines() }, [])

  useEffect(() => {
    if (selected) fetchRuns(selected.id)
  }, [selected])

  const handleSelect = (p) => {
    setSelected(p)
    setActiveLog(null)
  }

  const handleTrigger = async (e, pipeline) => {
    e.stopPropagation()
    setLoading(true)
    await triggerPipeline(pipeline.id)
    setTimeout(async () => {
      await fetchPipelines()
      if (selected?.id === pipeline.id) await fetchRuns(pipeline.id)
      setLoading(false)
    }, 2000)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    await createPipeline(form)
    setForm({ name: '', description: '', source: 'CSV' })
    setShowForm(false)
    fetchPipelines()
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    await deletePipeline(id)
    if (selected?.id === id) setSelected(null)
    fetchPipelines()
  }

  const chartData = runs.slice(0, 7).reverse().map((r, i) => ({
    name: `Run ${i + 1}`,
    records: r.records_processed,
    status: r.status,
  }))

  const stats = {
    total:   pipelines.length,
    active:  pipelines.filter(p => p.status === 'active').length,
    success: runs.filter(r => r.status === 'success').length,
    failed:  runs.filter(r => r.status === 'failed').length,
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#e2e8f0' }}>Pipeline Manager</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>ETL pipeline monitoring dashboard</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: '#6366f1', color: '#fff', border: 'none',
          padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
          fontSize: 14, fontWeight: 500
        }}>
          {showForm ? '✕ Cancel' : '+ New Pipeline'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>Create Pipeline</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { key: 'name', placeholder: 'Pipeline name', required: true },
              { key: 'description', placeholder: 'Description' },
            ].map(f => (
              <input key={f.key} placeholder={f.placeholder} required={f.required}
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                style={{
                  flex: 1, minWidth: 180, background: '#0f1117',
                  border: '1px solid #2d3154', borderRadius: 8,
                  padding: '8px 12px', color: '#e2e8f0', fontSize: 14
                }}
              />
            ))}
            <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}
              style={{
                background: '#0f1117', border: '1px solid #2d3154',
                borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: 14
              }}>
              {['CSV', 'S3', 'API', 'Database'].map(s => <option key={s}>{s}</option>)}
            </select>
            <button type="submit" style={{
              background: '#22c55e', color: '#fff', border: 'none',
              padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14
            }}>Create</button>
          </form>
        </Card>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Pipelines', value: stats.total,   color: '#6366f1' },
          { label: 'Active',          value: stats.active,  color: '#22c55e' },
          { label: 'Successful Runs', value: stats.success, color: '#22c55e' },
          { label: 'Failed Runs',     value: stats.failed,  color: '#ef4444' },
        ].map(s => (
          <Card key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 20 }}>

        {/* Pipeline list */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: '#94a3b8' }}>PIPELINES</h2>
          {pipelines.length === 0 && (
            <Card><p style={{ color: '#64748b', fontSize: 14 }}>No pipelines yet. Create one above.</p></Card>
          )}
          {pipelines.map(p => (
            <div key={p.id}
              onClick={() => handleSelect(p)}
              style={{
                background: '#1a1d2e',
                border: `1px solid ${selected?.id === p.id ? '#6366f1' : '#2d3154'}`,
                borderRadius: 12,
                padding: '16px 20px',
                marginBottom: 10,
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'border-color .2s'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 6 }}>{p.name}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Badge status={p.last_run_status} />
                    <span style={{ fontSize: 11, color: '#64748b' }}>Source: {p.source}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={(e) => handleTrigger(e, p)} disabled={loading}
                    style={{
                      background: '#6366f122', color: '#6366f1',
                      border: '1px solid #6366f144', borderRadius: 6,
                      padding: '4px 10px', cursor: 'pointer', fontSize: 12
                    }}>▶ Run</button>
                  <button onClick={(e) => handleDelete(e, p.id)}
                    style={{
                      background: '#ef444422', color: '#ef4444',
                      border: '1px solid #ef444444', borderRadius: 6,
                      padding: '4px 10px', cursor: 'pointer', fontSize: 12
                    }}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right panel */}
        <div>
          {!selected ? (
            <Card style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#64748b' }}>← Select a pipeline to view details</p>
            </Card>
          ) : (
            <>
              <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: '#94a3b8' }}>
                {selected.name.toUpperCase()} — RUN HISTORY
              </h2>

              {/* Chart */}
              {chartData.length > 0 && (
                <Card style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>Records processed per run</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#1a1d2e', border: '1px solid #2d3154', borderRadius: 8 }} labelStyle={{ color: '#e2e8f0' }} />
                      <Bar dataKey="records" radius={[4,4,0,0]}>
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={STATUS_COLORS[entry.status]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Runs */}
              {runs.length === 0 && (
                <Card><p style={{ color: '#64748b', fontSize: 14 }}>No runs yet. Click ▶ Run to trigger.</p></Card>
              )}
              {runs.map(r => (
                <Card key={r.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <Badge status={r.status} />
                      <span style={{ fontSize: 12, color: '#64748b' }}>{r.records_processed} records</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        {r.started_at ? new Date(r.started_at).toLocaleTimeString() : '—'}
                      </span>
                      <button onClick={() => setActiveLog(activeLog === r.id ? null : r.id)}
                        style={{
                          background: '#1e2235', color: '#94a3b8',
                          border: '1px solid #2d3154', borderRadius: 6,
                          padding: '2px 8px', cursor: 'pointer', fontSize: 11
                        }}>
                        {activeLog === r.id ? 'Hide log' : 'View log'}
                      </button>
                    </div>
                  </div>
                  {activeLog === r.id && (
                    <pre style={{
                      background: '#0f1117', border: '1px solid #2d3154',
                      borderRadius: 6, padding: 12, fontSize: 11, color: '#94a3b8',
                      overflowX: 'auto', whiteSpace: 'pre-wrap',
                      maxHeight: 200, overflowY: 'auto'
                    }}>{r.log || r.error_message || 'No log available'}</pre>
                  )}
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}