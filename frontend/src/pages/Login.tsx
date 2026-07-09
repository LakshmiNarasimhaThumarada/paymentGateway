import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Lock, Mail, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react'

const Login: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      console.error(err)
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message)
      } else {
        setError('Connection failed. Please ensure the backend is running.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-purple-900/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-900/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-950/40">
            <Lock className="h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
          Sign in to PaySecure
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Or{' '}
          <Link to="/register" className="font-semibold text-purple-400 hover:text-purple-300 transition duration-150">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-slate-900/40 backdrop-blur-2xl py-8 px-6 border border-slate-900 rounded-3xl shadow-2xl sm:px-10">
          
          {error && (
            <div className="mb-6 bg-rose-950/30 border border-rose-900/50 p-4 rounded-xl flex items-start gap-3 text-rose-400 animate-fade-in">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-xs font-medium leading-relaxed">{error}</div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950 border border-slate-800/80 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-purple-500 text-sm transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800/80 rounded-xl py-2.5 pl-10 pr-10 text-slate-200 focus:outline-none focus:border-purple-500 text-sm transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded bg-slate-950 border-slate-800 text-purple-600 focus:ring-purple-500/20"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-400">
                  Remember me
                </label>
              </div>

              <div className="text-xs">
                <Link to="/forgot-password" className="font-medium text-slate-500 hover:text-slate-300 transition">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white font-semibold text-sm shadow-lg shadow-purple-950/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="mt-8 pt-6 border-t border-slate-900/60">
            <h4 className="text-[10px] font-mono uppercase text-slate-500 tracking-wider mb-3">Quick Demo Credentials</h4>
            <div className="grid grid-cols-1 gap-2 text-[11px] text-slate-400 font-mono">
              <div className="flex justify-between bg-slate-950/40 p-2 rounded-lg border border-slate-900/60">
                <span>admin@paysecure.com</span>
                <span className="text-purple-400 font-semibold">ADMIN</span>
              </div>
              <div className="flex justify-between bg-slate-950/40 p-2 rounded-lg border border-slate-900/60">
                <span>engineer@paysecure.com</span>
                <span className="text-blue-400 font-semibold">ENGINEER</span>
              </div>
              <div className="flex justify-between bg-slate-950/40 p-2 rounded-lg border border-slate-900/60">
                <span>auditor@paysecure.com</span>
                <span className="text-emerald-400 font-semibold">AUDITOR</span>
              </div>
              <div className="text-center text-[10px] text-slate-600 mt-1">Password for all: <code className="bg-slate-950 px-1 py-0.5 rounded text-slate-400">Password123</code></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Login
