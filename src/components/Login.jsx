import { useState } from 'react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const form = new URLSearchParams()
      form.append('username', email)
      form.append('password', password)
      const res = await fetch(`${baseUrl}/auth/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form })
      if (!res.ok) throw new Error('Invalid credentials')
      const data = await res.json()
      localStorage.setItem('token', data.access_token)
      onLogin(data.access_token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const register = async () => {
    setLoading(true)
    setError('')
    try {
      const form = new URLSearchParams()
      form.append('username', email)
      form.append('password', password)
      const res = await fetch(`${baseUrl}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form })
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Registration failed')
      }
      const data = await res.json()
      localStorage.setItem('token', data.access_token)
      onLogin(data.access_token)
    } catch (err) {
      setError(err.message)
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
