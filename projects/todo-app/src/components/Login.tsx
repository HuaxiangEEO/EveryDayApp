import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: err } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password)
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
  }

  return (
    <div className="login">
      <div className="login-card">
        <h1 className="login-title">待办清单</h1>
        <p className="login-subtitle">使用邮箱登录或注册</p>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="login-input"
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="login-input"
            required
            minLength={6}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? '…' : isSignUp ? '注册' : '登录'}
          </button>
        </form>
        <button
          type="button"
          className="login-switch"
          onClick={() => { setIsSignUp(v => !v); setError(null) }}
        >
          {isSignUp ? '已有账号？去登录' : '没有账号？去注册'}
        </button>
      </div>
    </div>
  )
}
