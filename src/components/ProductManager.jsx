import { useEffect, useMemo, useState } from 'react'

export default function ProductManager() {
  const token = localStorage.getItem('token') || ''
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])

  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ barcode: '', name: '', price: '', cost: '', stock: '', category: '', tax_rate: '' })
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState('')

  const load = async () => {
    try {
      const res = await fetch(`${baseUrl}/products`, { headers })
      if (res.ok) setProducts(await res.json())
    } catch {}
  }

  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      if (editing) {
        const res = await fetch(`${baseUrl}/products/${encodeURIComponent(editing)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify({ ...form, price: Number(form.price), cost: Number(form.cost), stock: Number(form.stock), tax_rate: Number(form.tax_rate) }) })
        if (!res.ok) throw new Error('Update failed')
      } else {
        const res = await fetch(`${baseUrl}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify({ ...form, price: Number(form.price), cost: Number(form.cost), stock: Number(form.stock), tax_rate: Number(form.tax_rate) }) })
        if (!res.ok) throw new Error('Create failed')
      }
      setForm({ barcode: '', name: '', price: '', cost: '', stock: '', category: '', tax_rate: '' })
      setEditing(null)
      load()
      setMsg('Saved!')
    } catch (e) { setMsg(e.message) }
  }

  const edit = (p) => {
    setEditing(p.barcode)
    setForm({ barcode: p.barcode, name: p.name, price: p.price, cost: p.cost, stock: p.stock, category: p.category || '', tax_rate: p.tax_rate || 0 })
  }

  const del = async (barcode) => {
    if (!confirm('Delete this product?')) return
    const res = await fetch(`${baseUrl}/products/${encodeURIComponent(barcode)}`, { method: 'DELETE', headers })
    if (res.ok) load()
  }

  const adjust = async (barcode, delta) => {
    const res = await fetch(`${baseUrl}/products/adjust-stock`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify({ barcode, delta }) })
    if (res.ok) load()
  }

  return (
    <div className="bg-white/10 rounded-2xl border border-white/20 p-6 text-white">
      <h3 className="text-xl font-bold mb-4">Products</h3>
      <form onSubmit={submit} className="grid md:grid-cols-6 gap-2">
        <input value={form.barcode} onChange={e=>setForm({...form, barcode:e.target.value})} placeholder="Barcode" className="px-2 py-2 rounded bg-white/10 border border-white/20" disabled={!!editing} />
        <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Name" className="px-2 py-2 rounded bg-white/10 border border-white/20 md:col-span-2" />
        <input value={form.price} onChange={e=>setForm({...form, price:e.target.value})} placeholder="Price" className="px-2 py-2 rounded bg-white/10 border border-white/20" />
        <input value={form.cost} onChange={e=>setForm({...form, cost:e.target.value})} placeholder="Cost" className="px-2 py-2 rounded bg-white/10 border border-white/20" />
        <input value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} placeholder="Stock" className="px-2 py-2 rounded bg-white/10 border border-white/20" />
        <input value={form.category} onChange={e=>setForm({...form, category:e.target.value})} placeholder="Category" className="px-2 py-2 rounded bg-white/10 border border-white/20" />
        <input value={form.tax_rate} onChange={e=>setForm({...form, tax_rate:e.target.value})} placeholder="Tax % (0-1)" className="px-2 py-2 rounded bg-white/10 border border-white/20" />
        <button className="md:col-span-6 py-2 rounded bg-emerald-600 hover:bg-emerald-500">{editing ? 'Update' : 'Add'} Product</button>
        {msg && <div className="md:col-span-6 text-amber-300">{msg}</div>}
      </form>

      <div className="mt-6 divide-y divide-white/10">
        {products.map(p => (
          <div key={p.barcode} className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium">{p.name} <span className="text-white/60 text-sm">({p.barcode})</span></div>
              <div className="text-white/60 text-sm">${p.price?.toFixed?.(2) ?? p.price} • Stock {p.stock}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => adjust(p.barcode, 1)} className="px-2 py-1 rounded bg-white/10">+1</button>
              <button onClick={() => adjust(p.barcode, -1)} className="px-2 py-1 rounded bg-white/10">-1</button>
              <button onClick={() => edit(p)} className="px-3 py-1 rounded bg-blue-600">Edit</button>
              <button onClick={() => del(p.barcode)} className="px-3 py-1 rounded bg-red-600">Delete</button>
            </div>
          </div>
        ))}
        {products.length === 0 && <div className="text-white/60">No products yet.</div>}
      </div>
    </div>
  )
}
