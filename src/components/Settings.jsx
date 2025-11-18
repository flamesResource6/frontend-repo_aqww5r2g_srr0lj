import { useEffect, useState } from 'react'

export default function Settings() {
  const token = localStorage.getItem('token') || ''
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const [form, setForm] = useState({ company_name: '', currency: 'USD', tax_rate_default: 0, enable_gamified_sounds: true, theme: 'indigo' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const load = async () => {
    try {
      const res = await fetch(`${baseUrl}/settings`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setForm(data)
      }
    } catch {}
  }

  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    try {
      const res = await fetch(`${baseUrl}/settings`, { method: 'PUT', headers, body: JSON.stringify({ ...form, tax_rate_default: Number(form.tax_rate_default) }) })
      if (!res.ok) throw new Error('Failed to save settings')
      setMsg('Settings saved!')
    } catch (e) {
      setMsg(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/10 rounded-2xl border border-white/20 p-6 text-white">
      <h3 className="text-xl font-bold mb-4">Store Settings</h3>
      <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/70 mb-1">Company Name</label>
          <input value={form.company_name} onChange={e=>setForm({...form, company_name:e.target.value})} className="w-full px-3 py-2 rounded bg-white/10 border border-white/20" />
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-1">Currency</label>
          <input value={form.currency} onChange={e=>setForm({...form, currency:e.target.value})} className="w-full px-3 py-2 rounded bg-white/10 border border-white/20" />
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-1">Default Tax Rate (0-1)</label>
          <input type="number" step="0.01" value={form.tax_rate_default} onChange={e=>setForm({...form, tax_rate_default:e.target.value})} className="w-full px-3 py-2 rounded bg-white/10 border border-white/20" />
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-1">Theme</label>
          <select value={form.theme} onChange={e=>setForm({...form, theme:e.target.value})} className="w-full px-3 py-2 rounded bg-white/10 border border-white/20">
            <option value="indigo">Indigo</option>
            <option value="emerald">Emerald</option>
            <option value="rose">Rose</option>
            <option value="slate">Slate</option>
          </select>
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <input id="sounds" type="checkbox" checked={!!form.enable_gamified_sounds} onChange={e=>setForm({...form, enable_gamified_sounds:e.target.checked})} />
          <label htmlFor="sounds">Enable gamified sounds</label>
        </div>
        <button disabled={loading} className="md:col-span-2 py-2 rounded bg-blue-600 hover:bg-blue-500">{loading ? 'Saving...' : 'Save Settings'}</button>
        {msg && <div className="md:col-span-2 text-amber-300">{msg}</div>}
      </form>
    </div>
  )
}
