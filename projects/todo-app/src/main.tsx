import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

const hasSupabaseEnv =
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

function EnvError() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 480 }}>
      <h2>缺少环境变量</h2>
      <p>请在 Vercel 项目 <strong>Settings → Environment Variables</strong> 中配置：</p>
      <ul>
        <li><code>VITE_SUPABASE_URL</code></li>
        <li><code>VITE_SUPABASE_ANON_KEY</code></li>
      </ul>
      <p>配置后重新部署即可。</p>
    </div>
  )
}

function Root() {
  const [AppModule, setAppModule] = useState<{
    App: React.ComponentType
    AuthProvider: React.ComponentType<{ children: React.ReactNode }>
  } | null>(null)

  useEffect(() => {
    if (!hasSupabaseEnv) return
    Promise.all([import('./App'), import('./contexts/AuthContext')]).then(([AppMod, AuthMod]) => {
      setAppModule({ App: AppMod.default, AuthProvider: AuthMod.AuthProvider })
    })
  }, [])

  if (!hasSupabaseEnv) return <EnvError />
  if (!AppModule) return <div style={{ padding: 24 }}>加载中…</div>
  const { App, AuthProvider } = AppModule
  return (
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />)
