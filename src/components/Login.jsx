import { useEffect, useMemo, useState } from 'react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [health, setHealth] = useState({ status: 'checking', message: 'Checking backend…' })

  const rawBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  // Detect mixed-content risk and provide a safer computed URL + warning
  const { baseUrl, mixedWarning } = useMemo(() => {
    const pageIsHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
    const urlIsHttp = /^http:\/\//i.test(rawBase)
    const warning = pageIsHttps && urlIsHttp
      ? 'Your page is HTTPS but API is HTTP. Browsers will block this. Switch API to HTTPS.'
      : ''
    return { baseUrl: rawBase, mixedWarning: warning }
  }, [rawBase])

  const withTimeout = async (promise, ms = 8000) => {
    const ctrl = new AbortController()
    const id = setTimeout(() => ctrl.abort('timeout'), ms)
    try {
      const res = await promise(ctrl.signal)
      return res
    } finally {
      clearTimeout(id)
    }
  }

  const safeFetchJSON = async (url, options) => {
    try {
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
    } catch (e) {
      if (e?.name === 'AbortError') {
        throw new Error('Request timed out. Check your connection and try again.')
      }
      if (e instanceof TypeError) {
        // Network-level failure (CORS, DNS, mixed content, ad blocker)
        throw new Error('Failed to reach the server. Check connectivity/CORS or try incognito.')
      }
      throw e
    }
  }

  const pingBackend = async () => {
    setHealth({ status: 'checking', message: 'Checking backend…' })
    try {
      const data = await withTimeout((signal) => fetch(`${baseUrl}/test`, { signal }), 6000).then(async r => {
        const text = await r.text()
        try { return JSON.parse(text) } catch { return { raw: text } }
      })
      const dbOk = data?.database?.includes('✅') || data?.connection_status === 'Connected'
      setHealth({ status: 'ok', message: dbOk ? 'Backend reachable ✓' : 'Backend reachable (DB not connected)' })
    } catch (e) {
      const msg = mixedWarning || (e?.message || 'Failed to reach backend')
      setHealth({ status: 'down', message: msg })
    }
  }

  useEffect(() => {
    pingBackend()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // Quick preflight check if previously failed
      if (health.status === 'down') {
        await pingBackend()
        if (health.status === 'down') throw new Error(health.message)
      }
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
      if (health.status === 'down') {
        await pingBackend()
        if (health.status === 'down') throw new Error(health.message)
      }
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

  const statusColor = health.status === 'ok' ? 'text-green-300' : health.status === 'down' ? 'text-amber-300' : 'text-white/70'

  return (
    <div className="max-w-md mx-auto bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 text-white">
      <div className={`mb-3 text-sm ${statusColor} flex items-start justify-between gap-2`}>
        <span>
          {health.message}
          {mixedWarning && (
            <>
              {' '}• Tip: ensure the API URL starts with https://
            </>
          )}
        </span>
        <button onClick={pingBackend} className="shrink-0 px-2 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/20">Retry</button>
      </div>
      <h2 className="text-2xl font-bold mb-4">Secure Sign In</h2>
      <form onSubmit={submit} className="space-y-3">
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 focus:outline-none" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 focus:outline-none" />
        {error && <div className="text-red-300 text-sm">{error}</div>}
        <button disabled={loading} className="w-full py-2 rounded bg-blue-600 hover:bg-blue-500 transition">{loading ? 'Please wait…' : 'Login'}</button>
      </form>
      <button onClick={register} disabled={loading} className="mt-3 w-full py-2 rounded bg-slate-700 hover:bg-slate-600 transition">Register</button>
    </div>
  )
}
