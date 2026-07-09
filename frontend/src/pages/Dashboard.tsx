import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  LogOut,
  User,
  Shield,
  Activity,
  Database,
  Cpu,
  Layers,
  Terminal,
  Settings,
  AlertOctagon,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Lock,
  Download,
  Users
} from 'lucide-react'

interface UserResponse {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
}

const Dashboard: React.FC = () => {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()

  // State variables
  const [adminUsers, setAdminUsers] = useState<UserResponse[]>([])
  const [isAdminLoading, setIsAdminLoading] = useState(false)
  const [drStatus, setDrStatus] = useState<'idle' | 'running' | 'success' | 'failed'>('idle')
  const [drLogs, setDrLogs] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'token'>('overview')
  const [error, setError] = useState<string | null>(null)
  
  // Decoded token values (for demonstration)
  const [tokenHeader, setTokenHeader] = useState<any>(null)
  const [tokenPayload, setTokenPayload] = useState<any>(null)

  // Parse JWT token for display
  useEffect(() => {
    if (token) {
      try {
        const parts = token.split('.')
        if (parts.length === 3) {
          const header = JSON.parse(atob(parts[0]))
          const payload = JSON.parse(atob(parts[1]))
          setTokenHeader(header)
          setTokenPayload(payload)
        }
      } catch (err) {
        console.error('Failed to parse token payload:', err)
      }
    }
  }, [token])

  // Fetch admin user list
  const fetchAllUsers = async () => {
    if (user?.role !== 'ADMIN') return
    setIsAdminLoading(true)
    setError(null)
    try {
      const response = await api.get('/api/admin/users')
      setAdminUsers(response.data)
    } catch (err: any) {
      console.error(err)
      setError('Failed to fetch user list. Access denied.')
    } finally {
      setIsAdminLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchAllUsers()
    }
  }, [user])

  // Handle Disaster Recovery simulation (Platform Engineer)
  const startDrSimulation = () => {
    setDrStatus('running')
    setDrLogs([])
    
    const logs = [
      'Initializing Disaster Recovery drill sequence...',
      'Validating backup systems in AWS region us-east-2...',
      'Suspending secondary API router pools (H2 fallback online)...',
      'Synchronizing transaction log streams from memory database...',
      'Simulating network failure in primary zone (us-east-1)...',
      'Redirecting DNS weight configurations to backup instances...',
      'Verifying H2 backup cache integration... OK',
      'Disaster Recovery failover completed successfully.'
    ]

    logs.forEach((log, index) => {
      setTimeout(() => {
        setDrLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`])
        if (index === logs.length - 1) {
          setDrStatus('success')
        }
      }, (index + 1) * 800)
    })
  }

  // Handle Logout
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Set colors based on role
  const getRoleStyle = (roleName: string) => {
    switch (roleName) {
      case 'ADMIN':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          badge: 'bg-amber-500 text-slate-950 font-bold',
          border: 'border-amber-500/20'
        }
      case 'PLATFORM_ENGINEER':
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          badge: 'bg-blue-500 text-white font-bold',
          border: 'border-blue-500/20'
        }
      case 'AUDITOR':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          badge: 'bg-emerald-500 text-slate-950 font-bold',
          border: 'border-emerald-500/20'
        }
      default:
        return {
          bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
          badge: 'bg-slate-500 text-white font-bold',
          border: 'border-slate-500/20'
        }
    }
  }

  const roleStyle = getRoleStyle(user?.role || '')

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 relative overflow-hidden">
      {/* Upper background ambient glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-900/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                PaySecure
              </span>
              <span className="text-[10px] block font-mono text-slate-500">MANAGEMENT CONSOLE</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline">{user?.email}</span>
              <span className={`text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider ${roleStyle.badge}`}>
                {user?.role.replace('_', ' ')}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition duration-150 cursor-pointer flex items-center gap-2"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-xs hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Welcome Section */}
        <section className="bg-slate-900/35 border border-slate-900 rounded-3xl p-6 md:p-8 mb-8 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100">
                Welcome back, {user?.firstName} {user?.lastName}!
              </h1>
              <p className="text-slate-400 text-sm mt-1.5">
                Session Token active. Authorized for secure gateway API access.
              </p>
            </div>

            {/* Quick tabs */}
            <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-900 self-start md:self-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'overview' ? 'bg-slate-900 text-purple-400 border border-slate-800' : 'text-slate-400 hover:text-slate-200'
                } cursor-pointer`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('actions')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'actions' ? 'bg-slate-900 text-purple-400 border border-slate-800' : 'text-slate-400 hover:text-slate-200'
                } cursor-pointer`}
              >
                {user?.role.replace('_', ' ')} Actions
              </button>
              <button
                onClick={() => setActiveTab('token')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'token' ? 'bg-slate-900 text-purple-400 border border-slate-800' : 'text-slate-400 hover:text-slate-200'
                } cursor-pointer`}
              >
                Inspect Token
              </button>
            </div>
          </div>
        </section>

        {/* Tab Contents */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Side: General Profile Card */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 md:p-8">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-400" />
                  Account Security Context
                </h3>
                <p className="text-xs text-slate-400 mt-1">Telemetry summary of your active secure session.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-900/70">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">First Name</div>
                    <div className="text-sm font-semibold text-slate-200 mt-1">{user?.firstName}</div>
                  </div>
                  <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-900/70">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Last Name</div>
                    <div className="text-sm font-semibold text-slate-200 mt-1">{user?.lastName}</div>
                  </div>
                  <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-900/70 col-span-1 md:col-span-2">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Registered Email</div>
                    <div className="text-sm font-semibold text-slate-200 mt-1">{user?.email}</div>
                  </div>
                  <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-900/70 col-span-1 md:col-span-2 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Security Role</div>
                      <div className="text-sm font-semibold text-slate-200 mt-1 capitalize">{user?.role.replace('_', ' ')}</div>
                    </div>
                    <span className={`text-[10px] uppercase font-mono px-3 py-1 rounded-full border ${roleStyle.bg}`}>
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* General Telemetry diagnostics */}
              <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 md:p-8">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-400" />
                  API Gateway Telemetry
                </h3>
                <p className="text-xs text-slate-400 mt-1">Status of connection endpoints.</p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-900/70 text-center">
                    <div className="text-[10px] text-slate-500 font-mono uppercase">API Status</div>
                    <span className="inline-flex items-center gap-1.5 mt-2 bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-900/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                      ONLINE
                    </span>
                  </div>

                  <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-900/70 text-center">
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Role Permissions</div>
                    <span className="inline-flex items-center gap-1.5 mt-2 bg-purple-500/10 text-purple-400 text-xs px-2.5 py-1 rounded-full border border-purple-900/30">
                      ACTIVE
                    </span>
                  </div>

                  <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-900/70 text-center">
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Auth Token</div>
                    <span className="inline-flex items-center gap-1.5 mt-2 bg-blue-500/10 text-blue-400 text-xs px-2.5 py-1 rounded-full border border-blue-900/30">
                      JWT VERIFIED
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Role Badge & Help Info */}
            <div className="space-y-8">
              <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6">
                <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-purple-400" />
                  Role Privileges
                </h3>
                
                <div className="space-y-4">
                  <div className={`p-4 rounded-2xl border ${roleStyle.bg} flex flex-col justify-between`}>
                    <div className="text-sm font-bold tracking-tight">
                      Active: {user?.role.replace('_', ' ')}
                    </div>
                    <div className="text-[11px] mt-2 leading-relaxed opacity-80">
                      {user?.role === 'ADMIN' && (
                        <span>You have <strong>full administrative access</strong>. You are authorized to query the secured user database list and manage user permissions.</span>
                      )}
                      {user?.role === 'PLATFORM_ENGINEER' && (
                        <span>You are authorized for **operations and monitoring** tasks, including running system disaster recovery simulation drills.</span>
                      )}
                      {user?.role === 'AUDITOR' && (
                        <span>You have <strong>read-only compliance access</strong>. You can export audit sheets, inspect compliance parameters, and verify security protocols.</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900 text-xs space-y-2 text-slate-400">
                    <div className="font-semibold text-slate-300">Need to test a different role?</div>
                    <p className="leading-normal">
                      Log out and use one of the other seeded accounts (Admin, Platform Engineer, or Auditor) to view their corresponding custom dashboard features!
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab: Actions (Dynamic Render based on User Role) */}
        {activeTab === 'actions' && (
          <div className="space-y-8">
            
            {/* ================= ADMIN INTERFACE ================= */}
            {user?.role === 'ADMIN' && (
              <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                      <Users className="h-5 w-5 text-amber-400" />
                      User Directory Administration
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">Secured database API endpoint: <code className="bg-slate-950 text-amber-400 text-xs px-1 rounded">/api/admin/users</code></p>
                  </div>
                  <button
                    onClick={fetchAllUsers}
                    disabled={isAdminLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition duration-150 disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`h-3 w-3 ${isAdminLoading ? 'animate-spin' : ''}`} />
                    <span>Sync List</span>
                  </button>
                </div>

                {error && (
                  <div className="mb-6 bg-rose-950/30 border border-rose-900/50 p-4 rounded-xl flex items-center gap-3 text-rose-400">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span className="text-xs font-semibold">{error}</span>
                  </div>
                )}

                {isAdminLoading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-3" />
                    <p className="text-slate-400 text-xs">Fetching users from repository...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-900 rounded-2xl">
                    <table className="min-w-full divide-y divide-slate-900 text-left text-xs text-slate-400">
                      <thead className="bg-slate-950/60 text-slate-500 uppercase tracking-wider font-mono">
                        <tr>
                          <th className="px-6 py-4">ID</th>
                          <th className="px-6 py-4">Name</th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4">Assigned Role</th>
                          <th className="px-6 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 bg-slate-900/10">
                        {adminUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-900/40 transition">
                            <td className="px-6 py-4 font-mono">{u.id}</td>
                            <td className="px-6 py-4 font-semibold text-slate-200">{u.firstName} {u.lastName}</td>
                            <td className="px-6 py-4 font-mono">{u.email}</td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                                u.role === 'ADMIN' ? 'bg-amber-500/10 border-amber-900/30 text-amber-400' :
                                u.role === 'PLATFORM_ENGINEER' ? 'bg-blue-500/10 border-blue-900/30 text-blue-400' :
                                'bg-emerald-500/10 border-emerald-900/30 text-emerald-400'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-950 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full">
                                <span className="h-1 w-1 rounded-full bg-emerald-400"></span>
                                ACTIVE
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ================= PLATFORM ENGINEER INTERFACE ================= */}
            {user?.role === 'PLATFORM_ENGINEER' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* DR Simulation */}
                <div className="md:col-span-2 bg-slate-900/30 border border-slate-900 rounded-3xl p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-blue-400" />
                      Disaster Recovery Failover Simulation
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">
                      Platform engineers are authorized to run disaster recovery sandbox drills.
                    </p>

                    {/* Console log display */}
                    <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 mt-6 font-mono text-xs text-blue-400 h-48 overflow-y-auto space-y-1">
                      {drLogs.length > 0 ? (
                        drLogs.map((log, i) => (
                          <div key={i} className="animate-fade-in">{log}</div>
                        ))
                      ) : (
                        <div className="text-slate-600 italic">DR simulation console idle. Press start to run.</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      {drStatus === 'running' && <RefreshCw className="h-3 w-3 animate-spin text-blue-400" />}
                      {drStatus === 'success' && <CheckCircle className="h-4 w-4 text-emerald-400" />}
                      <span>DR Engine Status: <strong className="uppercase text-slate-300">{drStatus}</strong></span>
                    </span>

                    <button
                      onClick={startDrSimulation}
                      disabled={drStatus === 'running'}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-semibold text-xs shadow-lg shadow-blue-950/20 transition disabled:opacity-50 cursor-pointer"
                    >
                      {drStatus === 'running' ? 'Simulating...' : 'Trigger DR Failover'}
                    </button>
                  </div>
                </div>

                {/* Operations Telemetry */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-md font-bold text-slate-200 flex items-center gap-2 mb-3">
                      <Settings className="h-4 w-4 text-blue-400" />
                      System Cluster Health
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900">
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>API RATE LIMITS</span>
                          <span className="text-emerald-400">99.8% REMAINING</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-800">
                          <div className="bg-emerald-500 h-full w-[99.8%] rounded-full"></div>
                        </div>
                      </div>

                      <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900">
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>DISK BUFFER IO</span>
                          <span className="text-blue-400">NORMAL</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-800">
                          <div className="bg-blue-500 h-full w-[34%] rounded-full"></div>
                        </div>
                      </div>

                      <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900">
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>NODE REPLICATIONS</span>
                          <span className="text-blue-400">3 ACTIVE</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 leading-normal border-t border-slate-900/60 pt-4 mt-4">
                    Diagnostics retrieved directly via H2 database instance cluster.
                  </div>
                </div>

              </div>
            )}

            {/* ================= AUDITOR INTERFACE ================= */}
            {user?.role === 'AUDITOR' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Compliance Report Export */}
                <div className="md:col-span-2 bg-slate-900/30 border border-slate-900 rounded-3xl p-6 md:p-8">
                  <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                    SOC2 Compliance Audit Portal
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Auditors have read-only access to download compliance packets.
                  </p>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-900/60 rounded-xl hover:border-slate-800 transition">
                      <div>
                        <span className="font-semibold text-sm text-slate-200">Q2 2026 GDPR Audit Report</span>
                        <div className="text-[10px] text-slate-500 font-mono mt-1">SECUREHASH: 8ef621...</div>
                      </div>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-900/40 hover:bg-emerald-900/20 text-emerald-400 font-semibold text-xs transition cursor-pointer">
                        <Download className="h-3.5 w-3.5" />
                        <span>Export CSV</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-900/60 rounded-xl hover:border-slate-800 transition">
                      <div>
                        <span className="font-semibold text-sm text-slate-200">PCI-DSS Vulnerability Scanning Logs</span>
                        <div className="text-[10px] text-slate-500 font-mono mt-1">SECUREHASH: 3bf10a...</div>
                      </div>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-900/40 hover:bg-emerald-900/20 text-emerald-400 font-semibold text-xs transition cursor-pointer">
                        <Download className="h-3.5 w-3.5" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Audit Parameters list */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-md font-bold text-slate-200 flex items-center gap-2 mb-3">
                      <AlertOctagon className="h-4 w-4 text-emerald-400" />
                      Compliance Checks
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
                        <span className="text-[11px] text-slate-400">BCrypt Password Hash</span>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-900/30 px-2 py-0.5 rounded-full font-bold">COMPLIANT</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
                        <span className="text-[11px] text-slate-400">JWT Token Expiry (24h)</span>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-900/30 px-2 py-0.5 rounded-full font-bold">COMPLIANT</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
                        <span className="text-[11px] text-slate-400">SSL Connection Security</span>
                        <span className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-900/30 px-2 py-0.5 rounded-full font-bold">LOCAL DEV</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 mt-4 leading-normal">
                    SOC2 auditor clearance tokens are signed locally using standard JWT validation filters.
                  </p>
                </div>

              </div>
            )}

          </div>
        )}

        {/* Tab: Inspect Token */}
        {activeTab === 'token' && (
          <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 md:p-8 relative">
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-2">
              <Terminal className="h-5 w-5 text-purple-400" />
              JWT Session Token Inspection
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              This terminal decodes the actual JSON Web Token retrieved from the login service.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              
              {/* Token Decoded Blocks */}
              <div className="space-y-4">
                <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 font-mono text-xs">
                  <div className="text-purple-400 font-bold uppercase text-[10px] border-b border-slate-900 pb-2 mb-3">JWT Header</div>
                  <pre className="text-slate-300 overflow-x-auto">{tokenHeader ? JSON.stringify(tokenHeader, null, 2) : 'No token present'}</pre>
                </div>

                <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 font-mono text-xs">
                  <div className="text-blue-400 font-bold uppercase text-[10px] border-b border-slate-900 pb-2 mb-3">JWT Payload (Claims)</div>
                  <pre className="text-slate-300 overflow-x-auto">{tokenPayload ? JSON.stringify(tokenPayload, null, 2) : 'No token present'}</pre>
                </div>
              </div>

              {/* Raw Token Display */}
              <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 font-mono text-xs flex flex-col justify-between">
                <div>
                  <div className="text-pink-400 font-bold uppercase text-[10px] border-b border-slate-900 pb-2 mb-3">Raw Signed Token (Base64)</div>
                  <div className="text-slate-400 select-all break-all overflow-y-auto max-h-56 leading-relaxed bg-slate-950 p-2 border border-slate-900/60 rounded-xl">
                    {token}
                  </div>
                </div>

                <div className="mt-4 text-[10px] text-slate-500 leading-normal flex items-start gap-1.5 bg-slate-900/30 p-3 rounded-xl border border-slate-900/60">
                  <AlertOctagon className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>
                    This token is attached to the <strong>Authorization: Bearer &lt;token&gt;</strong> header on all outgoing Axios requests. The Spring Security filter checks this signature against the secret key on each call.
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center text-xs text-slate-600 border-t border-slate-900/40 pt-8">
        <div>PaySecure Security Management Dashboard</div>
        <div className="mt-1 text-slate-700">Spring Boot Security Session • JWT Verified</div>
      </footer>
    </div>
  )
}

export default Dashboard
