import { useState, useEffect } from 'react'
import {
  Activity,
  CheckCircle,
  XCircle,
  Database,
  Cpu,
  Clock,
  CreditCard,
  ArrowRight,
  History,
  DollarSign,
  AlertCircle,
  Check,
  RefreshCw,
  Wifi,
  WifiOff,
  Terminal,
  Lock,
  ShieldCheck,
  Layers
} from 'lucide-react'

interface DbInfo {
  status: string
  databaseProduct?: string
  databaseVersion?: string
  error?: string
}

interface SystemInfo {
  os: string
  javaVersion: string
  cores: number
  freeMemory: number
  totalMemory: number
}

interface BackendHealth {
  status: string
  application: string
  activeProfiles: string[]
  timestamp: string
  database: DbInfo
  system: SystemInfo
}

interface Transaction {
  id: string
  amount: number
  currency: string
  status: string
  cardBrand: string
  cardNumber: string
  timestamp: string
  errorCode?: string
}

function App() {
  // Connection and API health states
  const [health, setHealth] = useState<BackendHealth | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  // Payment form states
  const [amount, setAmount] = useState<string>('45.00')
  const [currency, setCurrency] = useState<string>('USD')
  const [cardBrand, setCardBrand] = useState<string>('Visa')
  const [cardNumber, setCardNumber] = useState<string>('4242 4242 4242 4242')
  const [cardHolder, setCardHolder] = useState<string>('Alex Johnson')
  const [expiry, setExpiry] = useState<string>('12/29')
  const [cvv, setCvv] = useState<string>('382')
  
  // Action & feedback states
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean
    message: string
    txId?: string
  } | null>(null)

  // Fetch health and transactions
  const checkHealth = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/health')
      if (response.ok) {
        const data: BackendHealth = await response.json()
        setHealth(data)
        setConnectionStatus('connected')
      } else {
        setConnectionStatus('disconnected')
        setHealth(null)
      }
    } catch (error) {
      console.error('Failed to fetch backend health:', error)
      setConnectionStatus('disconnected')
      setHealth(null)
    } finally {
      setIsRefreshing(false)
      setLastChecked(new Date())
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/payments/history')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    }
  }

  // Handle payments
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setPaymentResult(null)

    try {
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency,
          cardBrand,
          cardNumber: cardNumber.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPaymentResult({
          success: true,
          message: data.message || 'Payment processed successfully.',
          txId: data.id,
        })
        // Clear transaction input
        setAmount((Math.floor(Math.random() * 200) + 5).toFixed(2))
        fetchTransactions()
      } else {
        setPaymentResult({
          success: false,
          message: data.message || 'Payment failed.',
          txId: data.id,
        })
        fetchTransactions()
      }
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentResult({
        success: false,
        message: 'Could not connect to backend payment processor.',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Auto-fetch on mount
  useEffect(() => {
    checkHealth()
    fetchTransactions()

    // Poll health status every 8 seconds
    const interval = setInterval(() => {
      checkHealth()
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  // Calculate statistics
  const successCount = transactions.filter(t => t.status === 'Completed').length
  const successRate = transactions.length > 0 ? Math.round((successCount / transactions.length) * 100) : 100
  const totalVolume = transactions
    .filter(t => t.status === 'Completed')
    .reduce((acc, t) => acc + t.amount, 0)
    .toFixed(2)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 selection:bg-purple-500 selection:text-white">
      {/* Upper ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-900/20">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                PaySecure
              </span>
              <span className="text-[10px] block font-mono text-slate-500">PAYMENT GATEWAY PORTAL</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Status indicator */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
              connectionStatus === 'connected' 
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50' 
                : connectionStatus === 'disconnected' 
                ? 'bg-rose-950/40 text-rose-400 border-rose-800/50' 
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}>
              {connectionStatus === 'connected' ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Backend: Connected</span>
                </>
              ) : connectionStatus === 'disconnected' ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <span>Backend: Disconnected</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin text-purple-400" />
                  <span>Checking Connection...</span>
                </>
              )}
            </div>

            <button
              onClick={() => {
                checkHealth()
                fetchTransactions()
              }}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition duration-150 disabled:opacity-50 hover:text-white cursor-pointer"
              title="Refresh connection status"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Connection Failure Banner */}
        {connectionStatus === 'disconnected' && (
          <div className="mb-8 rounded-2xl bg-gradient-to-r from-rose-950/40 to-slate-950 border border-rose-800/40 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl shadow-rose-950/5">
            <div className="flex gap-4">
              <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400 shrink-0">
                <WifiOff className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-rose-300 text-lg">Unable to connect to Spring Boot backend</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                  The frontend is listening on port 5173 and trying to proxy `/api` calls to the Spring Boot backend on <code className="bg-slate-900 px-1.5 py-0.5 rounded text-rose-300">http://localhost:8081</code>. Ensure your backend application is compiled and running.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
              <div className="text-xs text-slate-500 font-mono">
                Troubleshooting command:
              </div>
              <code className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-purple-400 font-mono select-all">
                cd backend &amp;&amp; ./mvnw spring-boot:run
              </code>
            </div>
          </div>
        )}

        {/* Dashboard KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-900 rounded-2xl p-6 hover:border-slate-800/80 transition duration-300 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm font-medium">Gateway Volume</span>
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold font-mono">${totalVolume}</span>
              <span className="text-xs text-slate-500 block mt-1">Processed successfully</span>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-900 rounded-2xl p-6 hover:border-slate-800/80 transition duration-300 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm font-medium">Transaction Success Rate</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold font-mono">{successRate}%</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-xs text-slate-500 font-mono">{successCount} of {transactions.length} passed</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-900 rounded-2xl p-6 hover:border-slate-800/80 transition duration-300 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm font-medium">Active Environment</span>
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <Layers className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold capitalize">
                {health?.activeProfiles?.[0] || 'dev'}
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                Database: {health?.database?.databaseProduct || (connectionStatus === 'connected' ? 'H2 In-Memory' : 'None')}
              </span>
            </div>
          </div>
        </section>

        {/* Workspace content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (2/3 width) - Config & Payment Forms */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Connection Diagnostics Card */}
            <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-900 rounded-3xl p-6 md:p-8">
              <h2 className="text-xl font-bold flex items-center gap-2.5 text-slate-100">
                <ShieldCheck className="h-5 w-5 text-purple-400" />
                Gateway System Diagnostics
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Real-time API telemetry and container configuration.
              </p>

              {connectionStatus === 'connected' && health ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Left sub-details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-900/60">
                      <Cpu className="h-5 w-5 text-purple-400 shrink-0" />
                      <div>
                        <div className="text-xs text-slate-500 uppercase font-mono">Server Runtime</div>
                        <div className="text-sm font-semibold text-slate-200">Java {health.system.javaVersion} on {health.system.os}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-900/60">
                      <Clock className="h-5 w-5 text-purple-400 shrink-0" />
                      <div>
                        <div className="text-xs text-slate-500 uppercase font-mono">Backend Time</div>
                        <div className="text-sm font-semibold font-mono text-slate-200">
                          {new Date(health.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-900/60">
                      <Terminal className="h-5 w-5 text-purple-400 shrink-0" />
                      <div>
                        <div className="text-xs text-slate-500 uppercase font-mono">CPU Cores Allocated</div>
                        <div className="text-sm font-semibold text-slate-200">{health.system.cores} Cores</div>
                      </div>
                    </div>
                  </div>

                  {/* Right sub-details */}
                  <div className="space-y-4">
                    <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                      health.database.status === 'CONNECTED'
                        ? 'bg-emerald-950/20 border-emerald-900/40'
                        : 'bg-rose-950/20 border-rose-900/40'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Database className={`h-5 w-5 ${health.database.status === 'CONNECTED' ? 'text-emerald-400' : 'text-rose-400'}`} />
                          <span className="font-semibold text-sm">Database Engine</span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          health.database.status === 'CONNECTED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {health.database.status}
                        </span>
                      </div>

                      <div className="mt-3">
                        {health.database.status === 'CONNECTED' ? (
                          <div className="text-xs text-slate-400">
                            Type: <strong className="text-slate-300">{health.database.databaseProduct}</strong> <br/>
                            Ver: <strong className="text-slate-300 font-mono text-[10px]">{health.database.databaseVersion}</strong>
                          </div>
                        ) : (
                          <div className="text-xs text-rose-300">
                            Error: {health.database.error || 'Connection refused.'}
                            <div className="mt-2 text-[10px] text-slate-400 font-sans leading-normal">
                              Tip: The project is currently trying to connect to MySQL database. Change the profile to <code className="bg-slate-950 px-1 py-0.5 rounded text-slate-300">dev</code> in <code className="text-purple-400">application.properties</code> to run on in-memory H2 database.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 flex flex-col items-center justify-center p-8 bg-slate-950/40 border border-slate-900/60 rounded-2xl text-center">
                  <div className="animate-pulse p-3 bg-slate-900 rounded-full border border-slate-800 text-slate-500 mb-3">
                    <WifiOff className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-400">No Telemetry Available</h4>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Waiting for the Spring Boot backend to go online. Diagnostics updates automatically.
                  </p>
                </div>
              )}
            </div>

            {/* Payment Gateway Form */}
            <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-900 rounded-3xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

              <h2 className="text-xl font-bold flex items-center gap-2.5 text-slate-100">
                <CreditCard className="h-5 w-5 text-purple-400" />
                Simulate Secure Transaction
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Test processing engine by running mock card authorizations.
              </p>

              <form onSubmit={handlePayment} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Amount</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-8 pr-4 text-slate-200 font-mono focus:outline-none focus:border-purple-500 text-sm transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none focus:border-purple-500 text-sm transition"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Card Network</label>
                    <select
                      value={cardBrand}
                      onChange={(e) => {
                        setCardBrand(e.target.value)
                        if (e.target.value === 'Visa') setCardNumber('4242 4242 4242 4242')
                        else if (e.target.value === 'Mastercard') setCardNumber('5555 5555 5555 5555')
                        else setCardNumber('3782 822463 10005')
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none focus:border-purple-500 text-sm transition"
                    >
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="Amex">American Express</option>
                    </select>
                  </div>
                </div>

                {/* Simulated Credit Card Graphic */}
                <div className="bg-gradient-to-r from-slate-900 to-purple-950 border border-purple-900/30 rounded-2xl p-6 text-white shadow-lg shadow-purple-950/10 flex flex-col justify-between h-44 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-xl pointer-events-none"></div>
                  
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5">
                      <div className="h-6 w-8 bg-amber-500/25 border border-amber-500/40 rounded-md"></div>
                      <div className="text-[9px] font-mono text-slate-400">EMV CHIP</div>
                    </div>
                    <span className="font-extrabold italic text-sm text-purple-300 uppercase tracking-widest">{cardBrand}</span>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="bg-transparent border-b border-transparent hover:border-purple-900/60 focus:border-purple-500 font-mono text-xl text-slate-100 tracking-widest w-full focus:outline-none py-1 transition"
                      placeholder="Card Number"
                    />
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[8px] font-mono text-slate-400 uppercase">Card Holder</div>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="bg-transparent border-b border-transparent hover:border-purple-900/60 focus:border-purple-500 font-mono text-xs text-slate-200 focus:outline-none w-36 transition"
                      />
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <div className="text-[8px] font-mono text-slate-400 uppercase">Expiry</div>
                        <input
                          type="text"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-purple-900/60 focus:border-purple-500 font-mono text-xs text-slate-200 w-10 text-center focus:outline-none transition"
                        />
                      </div>
                      <div>
                        <div className="text-[8px] font-mono text-slate-400 uppercase">CVV</div>
                        <input
                          type="password"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-purple-900/60 focus:border-purple-500 font-mono text-xs text-slate-200 w-8 text-center focus:outline-none transition"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Endpoints secure. Sandbox environment mock client.</span>
                  </div>
                  <button
                    type="submit"
                    disabled={isProcessing || connectionStatus !== 'connected'}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white font-semibold text-sm shadow-lg shadow-purple-950/20 hover:shadow-purple-500/20 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Processing Auth...</span>
                      </>
                    ) : (
                      <>
                        <span>Authorize Payment</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Payment Response Indicator */}
              {paymentResult && (
                <div className={`mt-6 p-4 rounded-xl border animate-fade-in ${
                  paymentResult.success
                    ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-400'
                    : 'bg-rose-950/30 border-rose-900/40 text-rose-400'
                }`}>
                  <div className="flex items-start gap-3">
                    {paymentResult.success ? (
                      <CheckCircle className="h-5 w-5 mt-0.5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 mt-0.5 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-sm">
                        {paymentResult.success ? 'Authorization Approved' : 'Authorization Declined'}
                      </div>
                      <div className="text-xs text-slate-300 mt-1">{paymentResult.message}</div>
                      {paymentResult.txId && (
                        <div className="text-[10px] text-slate-500 font-mono mt-2">
                          Transaction ID: <span className="text-slate-400 select-all">{paymentResult.txId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right Column (1/3 width) - Timeline & Help Guides */}
          <div className="space-y-8">
            
            {/* Recent Transactions Feed */}
            <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-900 rounded-3xl p-6">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-100 mb-4">
                <History className="h-4 w-4 text-purple-400" />
                Live Transaction Log
              </h3>

              <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="bg-slate-950/40 border border-slate-900 p-3 rounded-xl hover:border-slate-800 transition duration-150"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300 font-mono text-xs font-semibold">{tx.id}</span>
                          <span className="text-[10px] text-slate-500">•</span>
                          <span className="text-[10px] text-slate-400 font-mono">{tx.cardBrand}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-sans ${
                          tx.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {tx.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-end mt-2">
                        <div className="text-xs text-slate-500 font-mono">
                          {tx.cardNumber}
                        </div>
                        <div className="font-mono text-sm font-extrabold text-slate-200">
                          {tx.currency === 'USD' ? '$' : tx.currency === 'EUR' ? '€' : '£'}
                          {tx.amount.toFixed(2)}
                        </div>
                      </div>

                      {tx.errorCode && (
                        <div className="text-[9px] text-rose-400/90 font-mono mt-1 bg-rose-950/20 px-1.5 py-0.5 rounded border border-rose-950">
                          Code: {tx.errorCode}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    No transactions captured. Authorize a transaction to start log feeds.
                  </div>
                )}
              </div>
            </div>

            {/* Profiles & Database Setup Guide */}
            <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-900 rounded-3xl p-6">
              <h3 className="text-sm font-bold flex items-center gap-2 text-slate-200 mb-3">
                <AlertCircle className="h-4 w-4 text-purple-400" />
                Developer Environment Info
              </h3>
              
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                <div>
                  <strong className="text-slate-300 block mb-0.5">Active Profile: H2 (Default)</strong>
                  Currently configured to use <strong className="text-purple-400">dev</strong> profile using H2 database.
                  No database setups required!
                </div>
                <div>
                  <strong className="text-slate-300 block mb-0.5">Switching to MySQL</strong>
                  To use your original MySQL database instead:
                  <ol className="list-decimal pl-4 space-y-1 mt-1 text-[11px] text-slate-400">
                    <li>Ensure MySQL is running on port 3306</li>
                    <li>Update your credentials in <code className="bg-slate-950 px-1 py-0.5 rounded text-slate-300 font-mono text-[10px]">application-mysql.properties</code></li>
                    <li>Run the backend using the mysql profile:</li>
                  </ol>
                  <code className="block bg-slate-950 border border-slate-900 p-2 rounded mt-1.5 text-[10px] text-purple-400 font-mono select-all">
                    ./mvnw spring-boot:run -Dspring.profiles.active=mysql
                  </code>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center text-xs text-slate-600 border-t border-slate-900/40 pt-8">
        <div>PaySecure Gateway Client Portal • Connected Secure API Shell</div>
        <div className="mt-1 text-slate-700">Spring Boot 3.3 + React 19 + Tailwind CSS v4</div>
      </footer>
    </div>
  )
}

export default App
