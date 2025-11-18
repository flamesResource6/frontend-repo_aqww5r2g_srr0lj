import { useEffect, useState } from 'react'
import Login from './components/Login'
import POS from './components/POS'
import ProductManager from './components/ProductManager'
import Settings from './components/Settings'
import Reports from './components/Reports'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [stats, setStats] = useState({ today_total: 0, transactions: 0, items_sold: 0 })
  const [tab, setTab] = useState('pos')

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (t) setToken(t)
  }, [])

  useEffect(() => {
    async function load() {
      if (!token) return
      try {
        const res = await fetch(`${baseUrl}/sales/summary`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) {
          setStats(await res.json())
        }
      } catch (e) {}
    }
    load()
  }, [token])

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 text-white">
            <h1 className="text-4xl font-black tracking-tight">Supermarket POS</h1>
            <p className="text-white/70">Fast barcode checkout with gamified vibes.</p>
          </div>
          <Login onLogin={setToken} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 text-white">
          <div>
            <h1 className="text-3xl font-black">Supermarket POS</h1>
            <p className="text-white/60 text-sm">Today: ${stats.today_total?.toFixed(2) || '0.00'} • Txns: {stats.transactions} • Items: {stats.items_sold}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTab('pos')} className={`px-3 py-2 rounded ${tab==='pos'?'bg-white/20':'bg-white/10'}`}>POS</button>
            <button onClick={() => setTab('products')} className={`px-3 py-2 rounded ${tab==='products'?'bg-white/20':'bg-white/10'}`}>Products</button>
            <button onClick={() => setTab('reports')} className={`px-3 py-2 rounded ${tab==='reports'?'bg-white/20':'bg-white/10'}`}>Reports</button>
            <button onClick={() => setTab('settings')} className={`px-3 py-2 rounded ${tab==='settings'?'bg-white/20':'bg-white/10'}`}>Settings</button>
            <button onClick={() => { localStorage.removeItem('token'); location.reload() }} className="px-4 py-2 rounded bg-white/10 border border-white/20 hover:bg-white/20">Logout</button>
          </div>
        </div>
        {tab === 'pos' && <POS />}
        {tab === 'products' && <ProductManager />}
        {tab === 'reports' && <Reports />}
        {tab === 'settings' && <Settings />}
      </div>
    </div>
  )
}

export default App
