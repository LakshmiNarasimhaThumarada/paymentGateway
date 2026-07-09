import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Unauthorized: React.FC = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden text-slate-100">
      {/* Background orbs */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-rose-950/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="text-center max-w-md z-10 bg-slate-900/45 border border-slate-900 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl animate-bounce">
            <AlertTriangle className="h-10 w-10" />
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-rose-400 font-sans tracking-tight">403 - Forbidden</h1>
        <p className="mt-4 text-slate-400 text-sm leading-relaxed">
          Access denied. You do not have the required permissions to view this resource.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition duration-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
          
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-950/30 border border-rose-900/50 hover:bg-rose-900/25 text-rose-400 font-semibold text-xs transition duration-200 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized
