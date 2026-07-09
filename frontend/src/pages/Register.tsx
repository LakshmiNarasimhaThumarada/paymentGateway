import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Lock, Mail, User, AlertCircle, RefreshCw, UserCheck } from 'lucide-react'

interface Role {
  id: number
  name: string
}

const Register: React.FC = () => {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [roleId, setRoleId] = useState<number | ''>('')
  const [roles, setRoles] = useState<Role[]>([])

  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Fetch dynamic roles list
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('/api/auth/roles')
        setRoles(response.data)
        if (response.data.length > 0) {
          // Select default role (typically AUDITOR or the first one)
          const defaultRole = response.data.find((r: Role) => r.name === 'AUDITOR') || response.data[0]
          setRoleId(defaultRole.id)
        }
      } catch (err) {
        console.error('Failed to load roles:', err)
        // Fallback static roles if api fails
        setRoles([
          { id: 1, name: 'ADMIN' },
          { id: 2, name: 'PLATFORM_ENGINEER' },
          { id: 3, name: 'AUDITOR' }
        ])
        setRoleId(3) // Default to AUDITOR ID
      }
    }
    fetchRoles()
  }, [])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!firstName.trim()) errors.firstName = 'First name is required'
    if (!lastName.trim()) errors.lastName = 'Last name is required'
    if (!email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please provide a valid email address'
    }
    
    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long'
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (!roleId) {
      errors.roleId = 'Role selection is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setValidationErrors({})

    if (!validateForm()) return

    setIsLoading(true)
    try {
      await register({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        roleId: Number(roleId),
      })
      
      // Navigate to login with success state or message
      navigate('/login', { state: { registered: true } })
    } catch (err: any) {
      console.error(err)
      if (err.response && err.response.data) {
        const data = err.response.data
        if (data.errors) {
          // Binding validations from Spring Boot validator
          setValidationErrors(data.errors)
        } else if (data.message) {
          setError(data.message)
        } else {
          setError('Failed to create account. Please check your fields.')
        }
      } else {
        setError('Connection error. Please try again.')
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
            <UserCheck className="h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
          Create an Account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition duration-150">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4 sm:px-0">
        <div className="bg-slate-900/40 backdrop-blur-2xl py-8 px-6 border border-slate-900 rounded-3xl shadow-2xl sm:px-10">
          
          {error && (
            <div className="mb-6 bg-rose-950/30 border border-rose-900/50 p-4 rounded-xl flex items-start gap-3 text-rose-400 animate-fade-in">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-xs font-medium leading-relaxed">{error}</div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="firstName" className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className={`w-full bg-slate-950 border ${
                      validationErrors.firstName ? 'border-rose-900/80 focus:border-rose-500' : 'border-slate-800/80 focus:border-purple-500'
                    } rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none text-sm transition`}
                  />
                </div>
                {validationErrors.firstName && (
                  <p className="mt-1.5 text-[10px] text-rose-400 font-mono">{validationErrors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className={`w-full bg-slate-950 border ${
                      validationErrors.lastName ? 'border-rose-900/80 focus:border-rose-500' : 'border-slate-800/80 focus:border-purple-500'
                    } rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none text-sm transition`}
                  />
                </div>
                {validationErrors.lastName && (
                  <p className="mt-1.5 text-[10px] text-rose-400 font-mono">{validationErrors.lastName}</p>
                )}
              </div>
            </div>

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
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.doe@company.com"
                  className={`w-full bg-slate-950 border ${
                    validationErrors.email ? 'border-rose-900/80 focus:border-rose-500' : 'border-slate-800/80 focus:border-purple-500'
                  } rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none text-sm transition`}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1.5 text-[10px] text-rose-400 font-mono">{validationErrors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className={`w-full bg-slate-950 border ${
                      validationErrors.password ? 'border-rose-900/80 focus:border-rose-500' : 'border-slate-800/80 focus:border-purple-500'
                    } rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none text-sm transition`}
                  />
                </div>
                {validationErrors.password && (
                  <p className="mt-1.5 text-[10px] text-rose-400 font-mono">{validationErrors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className={`w-full bg-slate-950 border ${
                      validationErrors.confirmPassword ? 'border-rose-900/80 focus:border-rose-500' : 'border-slate-800/80 focus:border-purple-500'
                    } rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none text-sm transition`}
                  />
                </div>
                {validationErrors.confirmPassword && (
                  <p className="mt-1.5 text-[10px] text-rose-400 font-mono">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                Account Role
              </label>
              <select
                id="role"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-slate-950 border border-slate-800/80 rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none focus:border-purple-500 text-sm transition"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name.replace('_', ' ')}
                  </option>
                ))}
              </select>
              {validationErrors.roleId && (
                <p className="mt-1.5 text-[10px] text-rose-400 font-mono">{validationErrors.roleId}</p>
              )}
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
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Register</span>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  )
}

export default Register
