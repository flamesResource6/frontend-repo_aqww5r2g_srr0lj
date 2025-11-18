import { useEffect, useMemo, useState } from 'react'
import Scanner from './Scanner'

export default function POS() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [items, setItems] = useState([])
  const [manualBarcode, setManualBarcode] = useState('')
  const [paid, setPaid] = useState('')
  const [message, setMessage] = useState('')

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const authHeader = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])

  const addByBarcode = async (barcode) => {
    if (!barcode) return
    try {
      const res = await fetch(`${baseUrl}/products/by-barcode/${encodeURIComponent(barcode)}`, { headers: authHeader })
      if (!res.ok) throw new Error('Product not found')
      const prod = await res.json()
      setItems(prev => {
        const idx = prev.findIndex(p => p.barcode === prod.barcode)
        if (idx >= 0) {
          const copy = [...prev]
          copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 }
          return copy
        }
        return [...prev, { barcode: prod.barcode, name: prod.name, price: prod.price, quantity: 1, tax_rate: prod.tax_rate || 0 }]
      })
    } catch (e) {
      setMessage(e.message)
    }
  }

  const total = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
    const tax = items.reduce((s, i) => s + (i.price * i.quantity) * (i.tax_rate || 0), 0)
    return { subtotal, tax, total: subtotal + tax }
  }, [items])

  const checkout = async () => {
    try {
      const res = await fetch(`${baseUrl}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ items, paid_amount: Number(paid || 0), payment_method: 'cash' })
      })
      if (!res.ok) throw new Error('Checkout failed')
      const data = await res.json()
      setMessage(`Sale complete. Total ${data.total.toFixed(2)}`)
      setItems([])
      setPaid('')
    } catch (e) {
      setMessage(e.message)
    }
  }

  const remove = (barcode) => setItems(i => i.filter(x => x.barcode !== barcode))

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <Scanner onDetected={b => addByBarcode(b)} />
        <div className="mt-4 flex gap-2">
          <input value={manualBarcode} onChange={e=>setManualBarcode(e.target.value)} placeholder="Type barcode" className="flex-1 px-3 py-2 rounded bg-white/10 border border-white/20 text-white" />
          <button onClick={() => { addByBarcode(manualBarcode); setManualBarcode('') }} className="px-4 rounded bg-blue-600">Add</button>
        </div>
        <div className="mt-6 bg-white/10 rounded-xl border border-white/20 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 text-white/80">Cart</div>
          <div className="divide-y divide-white/10">
            {items.map(i => (
              <div key={i.barcode} className="flex items-center justify-between px-4 py-3 text-white">
                <div>
                  <div className="font-medium">{i.name}</div>
                  <div className="text-white/60 text-sm">{i.barcode}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-white/80">x{i.quantity}</div>
                  <div className="w-24 text-right">${(i.price * i.quantity).toFixed(2)}</div>
                  <button onClick={() => remove(i.barcode)} className="text-red-300 hover:text-red-200">Remove</button>
                </div>
              </div>
            ))}
            {items.length === 0 && <div className="px-4 py-6 text-white/60">No items yet</div>}
          </div>
        </div>
      </div>

      <div className="bg-white/10 rounded-2xl border border-white/20 p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Checkout</h3>
        <div className="space-y-2 text-white/90">
          <div className="flex justify-between"><span>Subtotal</span><span>${total.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Tax</span><span>${total.tax.toFixed(2)}</span></div>
          <div className="flex justify-between font-semibold text-white"><span>Total</span><span>${total.total.toFixed(2)}</span></div>
        </div>
        <input value={paid} onChange={e=>setPaid(e.target.value)} placeholder="Paid amount" className="mt-4 w-full px-3 py-2 rounded bg-white/10 border border-white/20" />
        <button onClick={checkout} className="mt-3 w-full py-2 rounded bg-emerald-600 hover:bg-emerald-500">Complete Sale</button>
        {message && <div className="mt-3 text-sm text-amber-300">{message}</div>}
      </div>
    </div>
  )
}
