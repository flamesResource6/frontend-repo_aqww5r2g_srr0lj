import { useState } from 'react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const safeFetchJSON = async (url, options) => {
    const res = await fetch(url, options)
    let bodyText = ''
    try { bodyText = await res.text() } catch {}
    let data
    try { data = bodyText ? JSON.parse(bodyText) : {} } catch { data = { detail: bodyText || 'Request failed' } }
    if (!res.ok) {
      const msg = (data && (data.detail || data.message)) || bodyText || 'Request failed'
      throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
    }
    return data
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = { email: (email || '').trim().toLowerCase(), password: password || '' }
      const data = await safeFetchJSON(`${baseUrl}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      localStorage.setItem('token', data.access_token)
      onLogin(data.access_token)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const register = async () => {
    setLoading(true)
    setError('')
    try {
      const payload = { email: (email || '').trim().toLowerCase(), password: password || '' }
      const data = await safeFetchJSON(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      localStorage.setItem('token', data.access_token)
      onLogin(data.access_token)
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Secure Sign In</h2>
      <form onSubmit={submit} className="space-y-3">
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 focus:outline-none" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 focus:outline-none" />
        {error && <div className="text-red-300 text-sm">{error}</div>}
        <button disabled={loading} className="w-full py-2 rounded bg-blue-600 hover:bg-blue-500 transition">{loading ? 'Please wait...' : 'Login'}</button>
      </form>
      <button onClick={register} disabled={loading} className="mt-3 w-full py-2 rounded bg-slate-700 hover:bg-slate-600 transition">Register</button>
    </div>
  )
}
