import { useEffect, useMemo, useState } from 'react'

export default function Reports() {
  const token = localStorage.getItem('token') || ''
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])

  const [range, setRange] = useState({ start: '', end: '' })
  const [summary, setSummary] = useState({ revenue: 0, transactions: 0, items_sold: 0 })
  const [top, setTop] = useState([])

  const load = async () => {
    const q = new URLSearchParams()
    if (range.start) q.append('start', range.start)
    if (range.end) q.append('end', range.end)
    try {
      const [sRes, tRes] = await Promise.all([
        fetch(`${baseUrl}/sales/range-summary?${q.toString()}`, { headers }),
        fetch(`${baseUrl}/sales/top-products?days=30&limit=10`, { headers }),
      ])
      if (sRes.ok) setSummary(await sRes.json())
      if (tRes.ok) setTop(await tRes.json())
    } catch {}
  }

  useEffect(() => { load() }, [])

  const exportCsv = async () => {
    const q = new URLSearchParams()
    if (range.start) q.append('start', range.start)
    if (range.end) q.append('end', range.end)
    const res = await fetch(`${baseUrl}/sales/export?${q.toString()}`, { headers })
    const text = await res.text()
    const blob = new Blob([text], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sales.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="text-white">
      <div className="bg-white/10 rounded-2xl border border-white/20 p-6">
        <h3 className="text-xl font-bold mb-4">Reporting & Analytics</h3>
        <div className="grid md:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Start</label>
            <input type="datetime-local" value={range.start} onChange={e=>setRange({...range, start:e.target.value})} className="w-full px-3 py-2 rounded bg-white/10 border border-white/20" />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">End</label>
            <input type="datetime-local" value={range.end} onChange={e=>setRange({...range, end:e.target.value})} className="w-full px-3 py-2 rounded bg-white/10 border border-white/20" />
          </div>
          <button onClick={load} className="self-end py-2 rounded bg-blue-600 hover:bg-blue-500">Refresh</button>
          <button onClick={exportCsv} className="self-end py-2 rounded bg-emerald-600 hover:bg-emerald-500">Export CSV</button>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Stat title="Revenue" value={`$${Number(summary.revenue || 0).toFixed(2)}`} />
          <Stat title="Transactions" value={summary.transactions || 0} />
          <Stat title="Items Sold" value={summary.items_sold || 0} />
        </div>
      </div>

      <div className="mt-6 bg-white/10 rounded-2xl border border-white/20 p-6">
        <h4 className="text-lg font-semibold mb-3">Top Products</h4>
        <div className="divide-y divide-white/10">
          {top.map((t) => (
            <div key={t.barcode} className="flex justify-between py-2">
              <div>
                <div className="font-medium">{t.name}</div>
                <div className="text-white/60 text-sm">{t.barcode}</div>
              </div>
              <div className="text-right">
                <div className="text-white/90">Qty {t.qty}</div>
                <div className="text-white/60 text-sm">${Number(t.revenue).toFixed(2)}</div>
              </div>
            </div>
          ))}
          {top.length === 0 && <div className="text-white/60">No data yet.</div>}
        </div>
      </div>
    </div>
  )
}

function Stat({ title, value }) {
  return (
    <div className="rounded-xl bg-black/20 border border-white/10 p-4">
      <div className="text-white/70 text-sm">{title}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  )
}
