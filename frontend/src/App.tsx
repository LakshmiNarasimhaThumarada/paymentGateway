import { useState, useEffect, useRef } from 'react';
import './App.css';

type Region = 'US' | 'EU' | 'APAC';

interface Transaction {
  id: number;
  amount: number;
  currency: string;
  cardholderName: string;
  status: string;
  primaryRegion: Region;
  processedRegion: Region | null;
  routingLog: string;
  createdAt: string;
}

const API_BASE = 'http://localhost:8080/api';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');
  
  // Simulation State
  const [outages, setOutages] = useState<Record<Region, boolean>>({
    US: false,
    EU: false,
    APAC: false
  });

  // Payment Form State
  const [amount, setAmount] = useState<string>('99.99');
  const [currency, setCurrency] = useState<string>('USD');
  const [cardholderName, setCardholderName] = useState<string>('John Doe');
  const [targetRegion, setTargetRegion] = useState<Region>('US');

  // App Logic State
  const [loading, setLoading] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['System online. Ready to route payments.']);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // Fetch initial data
  useEffect(() => {
    fetchOutageStatus();
    fetchHistory();

    // Poll region status every 5 seconds
    const interval = setInterval(fetchOutageStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Sync target region when currency changes (UX optimization)
  const handleCurrencyChange = (curr: string) => {
    setCurrency(curr);
    if (curr === 'USD') setTargetRegion('US');
    else if (curr === 'EUR') setTargetRegion('EU');
    else if (curr === 'INR') setTargetRegion('APAC');
  };

  const fetchOutageStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/simulation/status`);
      if (res.ok) {
        const data = await res.json();
        setOutages(data);
      }
    } catch (err) {
      console.error('Error fetching region status:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/payments/history`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.reverse()); // Newest first
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const toggleOutage = async (region: Region, currentVal: boolean) => {
    const newVal = !currentVal;
    
    // Optimistic Update
    setOutages(prev => ({ ...prev, [region]: newVal }));
    setTerminalLogs(prev => [
      ...prev,
      `[SIMULATOR] Outage toggle: Setting Region ${region} to ${newVal ? 'OFFLINE' : 'ONLINE'}`
    ]);

    try {
      const res = await fetch(`${API_BASE}/simulation/outage?region=${region}&isOutage=${newVal}`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setOutages(data);
      } else {
        throw new Error('Server returned error status');
      }
    } catch (err) {
      // Revert on error
      setOutages(prev => ({ ...prev, [region]: currentVal }));
      setTerminalLogs(prev => [
        ...prev,
        `[SIMULATOR ERROR] Failed to toggle outage on server for ${region}`
      ]);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setTerminalLogs([
      `[CLIENT] Initiating transaction request...`,
      `[CLIENT] Amount: ${currency} ${amount}`,
      `[CLIENT] Target Processing Node: ${targetRegion}`,
      `[CLIENT] Sending payload to Payment Server...`
    ]);

    try {
      const res = await fetch(`${API_BASE}/payments/charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency,
          cardholderName,
          targetRegion
        })
      });

      if (!res.ok) {
        throw new Error('API server returned error');
      }

      const tx: Transaction = await res.json();

      // Play back the server routing log line by line for typewriter effect
      const serverLogs = tx.routingLog.split('\n').filter(line => line.trim() !== '');
      let lineIndex = 0;

      const printLog = () => {
        if (lineIndex < serverLogs.length) {
          setTerminalLogs(prev => [...prev, `[SERVER] ${serverLogs[lineIndex]}`]);
          lineIndex++;
          setTimeout(printLog, 300);
        } else {
          setLoading(false);
          fetchHistory(); // Refresh table
        }
      };

      setTimeout(printLog, 500);

    } catch (err) {
      setTerminalLogs(prev => [
        ...prev,
        `[ERROR] Connection failed to payments API. Please ensure the backend server is running.`
      ]);
      setLoading(false);
    }
  };

  const getLogClass = (log: string) => {
    if (log.includes('SUCCESS') || log.includes('successfully')) return 'terminal-line success';
    if (log.includes('FAILED') || log.includes('ERROR') || log.includes('FAIL')) return 'terminal-line error';
    if (log.includes('Action:') || log.includes('outage') || log.includes('Attempting')) return 'terminal-line warn';
    return 'terminal-line info';
  };

  // Stats calculation
  const totalProcessed = transactions.filter(t => t.status === 'SUCCESS').length;
  const totalVolume = transactions
    .filter(t => t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0)
    .toFixed(2);
  const failoverCount = transactions.filter(
    t => t.status === 'SUCCESS' && t.primaryRegion !== t.processedRegion
  ).length;

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-section">
          <div className="logo-icon">⚡</div>
          <div>
            <h1 className="logo-text">PaySecure</h1>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>Multi-Region Resilient Gateway</p>
          </div>
        </div>
        <div className="system-status">
          <div className={`pulse-dot ${Object.values(outages).every(v => v) ? 'error' : 'success'}`}></div>
          <span>
            {Object.values(outages).every(v => v) 
              ? 'All Regional Nodes Offline' 
              : 'Multi-Region Routing Active'}
          </span>
        </div>
      </header>

      <nav className="tabs-navigation">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Gateway Dashboard
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Transaction History ({transactions.length})
        </button>
      </nav>

      {activeTab === 'dashboard' ? (
        <div className="dashboard-grid">
          {/* Left Column: Config and Checkout */}
          <div>
            {/* Region Health Section */}
            <div className="card">
              <h2 className="card-title">
                Regional Gateway Health
                <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-muted)' }}>
                  (Dynamic Failover Infrastructure)
                </span>
              </h2>
              <div className="region-nodes-container">
                {(['US', 'EU', 'APAC'] as Region[]).map(region => {
                  const isOffline = outages[region];
                  const regionName = region === 'US' ? 'United States' : region === 'EU' ? 'Europe' : 'Asia-Pacific';
                  const provider = region === 'US' ? 'Stripe' : region === 'EU' ? 'Adyen' : 'Razorpay';
                  return (
                    <div key={region} className={`region-node-card ${isOffline ? 'offline' : ''}`}>
                      <div className="node-header">
                        <h3 className="node-title">{regionName}</h3>
                        <span className={`badge ${isOffline ? 'failed' : 'success'}`}>
                          <div className={`pulse-dot ${isOffline ? 'error' : 'success'}`}></div>
                          {isOffline ? 'Offline' : 'Healthy'}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Primary API: <strong>{provider}</strong>
                      </p>
                      
                      <div className="switch-container">
                        <span>Simulate Outage</span>
                        <label className="switch">
                          <input 
                            type="checkbox" 
                            checked={isOffline} 
                            onChange={() => toggleOutage(region, isOffline)}
                            disabled={loading}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div className="card" style={{ padding: '16px', marginBottom: 0 }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Settled</p>
                <h3 style={{ fontSize: '20px', margin: '4px 0 0 0' }}>{totalProcessed} Sales</h3>
              </div>
              <div className="card" style={{ padding: '16px', marginBottom: 0 }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Volume</p>
                <h3 style={{ fontSize: '20px', color: 'var(--color-success)', margin: '4px 0 0 0' }}>${totalVolume}</h3>
              </div>
              <div className="card" style={{ padding: '16px', marginBottom: 0 }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Failover Swaps</p>
                <h3 style={{ fontSize: '20px', color: failoverCount > 0 ? 'var(--color-warning)' : 'var(--text-primary)', margin: '4px 0 0 0' }}>
                  {failoverCount} Times
                </h3>
              </div>
            </div>

            {/* Checkout Sandbox */}
            <div className="card">
              <h2 className="card-title">Sandboxed Checkout Simulation</h2>
              <form onSubmit={handlePayment} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                <div>
                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={cardholderName} 
                      onChange={e => setCardholderName(e.target.value)} 
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label>Payment Amount</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="form-control" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>Currency</label>
                      <select 
                        className="form-control select-control" 
                        value={currency} 
                        onChange={e => handleCurrencyChange(e.target.value)}
                        disabled={loading}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="INR">INR (₹)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Target Region Node (Primary Router)</label>
                    <select 
                      className="form-control select-control" 
                      value={targetRegion} 
                      onChange={e => setTargetRegion(e.target.value as Region)}
                      disabled={loading}
                    >
                      <option value="US">US (Stripe Primary Router)</option>
                      <option value="EU">EU (Adyen Primary Router)</option>
                      <option value="APAC">APAC (Razorpay Primary Router)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div className="card-mockup">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="card-chip"></div>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', fontStyle: 'italic', opacity: 0.8 }}>VISA</span>
                    </div>
                    <div className="card-number">•••• •••• •••• 4242</div>
                    <div className="card-footer">
                      <div>
                        <div style={{ opacity: 0.6 }}>Cardholder</div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{cardholderName || 'John Doe'}</div>
                      </div>
                      <div>
                        <div style={{ opacity: 0.6 }}>Expiry</div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>12 / 29</div>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn" 
                    disabled={loading || Object.values(outages).every(v => v)}
                  >
                    {loading ? (
                      <>
                        <span className="pulse-dot success" style={{ animationDuration: '0.8s' }}></span>
                        Routing Payment...
                      </>
                    ) : Object.values(outages).every(v => v) ? (
                      'System Offline (All Nodes Down)'
                    ) : (
                      `Pay ${currency} ${amount}`
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Live Terminal Logger */}
          <div>
            <div className="card" style={{ height: 'calc(100% - 24px)', display: 'flex', flexDirection: 'column' }}>
              <h2 className="card-title">Live Failover Routing Terminal Logs</h2>
              <div className="terminal-window" style={{ flexGrow: 1 }}>
                <div className="terminal-header">
                  <div className="terminal-dots">
                    <div className="terminal-dot red"></div>
                    <div className="terminal-dot yellow"></div>
                    <div className="terminal-dot green"></div>
                  </div>
                  <div className="terminal-title">routing-failover-daemon.log</div>
                  <div style={{ width: '30px' }}></div>
                </div>
                
                {terminalLogs.map((log, index) => (
                  <div key={index} className={getLogClass(log)}>
                    {log}
                  </div>
                ))}
                
                {loading && (
                  <div className="terminal-line warn" style={{ display: 'inline-block' }}>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span> routing details in progress...
                  </div>
                )}
                <div ref={terminalEndRef} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History View */
        <div className="card">
          <h2 className="card-title">Audit Log Database</h2>
          
          <div className="table-container">
            {transactions.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                No transactions recorded in MySQL yet. Initiate a payment above to see the logs.
              </p>
            ) : (
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>Tx ID</th>
                    <th>Date</th>
                    <th>Cardholder</th>
                    <th>Amount</th>
                    <th>Target Region</th>
                    <th>Settlement Region</th>
                    <th>Route Details</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => {
                    const isFailover = tx.primaryRegion !== tx.processedRegion && tx.status === 'SUCCESS';
                    return (
                      <tr key={tx.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>#{tx.id}</td>
                        <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td>{tx.cardholderName}</td>
                        <td style={{ fontWeight: 600 }}>
                          {tx.currency} {tx.amount.toFixed(2)}
                        </td>
                        <td>
                          <span style={{ fontWeight: 500 }}>{tx.primaryRegion}</span>
                        </td>
                        <td>
                          {tx.status === 'SUCCESS' ? (
                            <span className={`badge ${isFailover ? 'failover' : 'direct'}`}>
                              {tx.processedRegion}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                        <td style={{ fontSize: '11px', color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tx.routingLog.split('\n')[1] || 'No routing log'}
                        </td>
                        <td>
                          <span className={`badge ${tx.status === 'SUCCESS' ? 'success' : 'failed'}`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
