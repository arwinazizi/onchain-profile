import { useState } from 'react';
import { validateAddress } from './utils/validation';
import { fetchWalletData } from './services/wallet';
import { classifyWallet } from './services/classifier';
import { calculateMetrics } from './services/metrics';
import { getConnectedWallets } from './services/connections';

// Supported chains
const CHAINS = {
  ethereum: { name: 'Ethereum', symbol: 'ETH', color: 'bg-blue-600' },
  solana: { name: 'Solana', symbol: 'SOL', color: 'bg-purple-600' },
};

function App() {
  const [address, setAddress] = useState('');
  const [chain, setChain] = useState('ethereum');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    // Validate address based on chain
    const validation = validateAddress(address, chain);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    try {
      const walletData = await fetchWalletData(validation.address, chain);
      const classification = classifyWallet(walletData);
      const metrics = calculateMetrics(walletData);
      const connections = getConnectedWallets(walletData);

      setResult({
        ...walletData,
        classification,
        metrics,
        connections,
      });
    } catch (err) {
      setError('Failed to fetch wallet data. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

  // Helper to shorten addresses
  const shortAddr = (addr) => {
    if (!addr) return 'Unknown';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Copy address to clipboard
  const copyAddress = (addr) => {
    navigator.clipboard.writeText(addr);
  };

  const currentChain = CHAINS[chain];

  return (
    <div className='min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center'>
      <div className='w-full max-w-2xl'>
        <h1 className='text-3xl font-bold text-center'>Onchain-Profile</h1>
        <p className='text-gray-400 mt-2 text-center'>
          Analyze any wallet across multiple chains
        </p>

        {/* Chain Selector */}
        <div className='mt-6 flex justify-center gap-2'>
          {Object.entries(CHAINS).map(([key, chainInfo]) => (
            <button
              key={key}
              onClick={() => {
                setChain(key);
                setResult(null);
                setError(null);
              }}
              className={`px-4 py-2 rounded font-medium transition ${
                chain === key
                  ? `${chainInfo.color} text-white`
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {chainInfo.name}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className='mt-6'>
          <input
            type='text'
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={chain === 'ethereum' ? '0x...' : 'Solana address...'}
            className='w-full px-4 py-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 outline-none'
          />
          <button
            type='submit'
            disabled={loading}
            className={`mt-4 w-full px-6 py-2 rounded hover:opacity-90 disabled:opacity-50 ${currentChain.color}`}
          >
            {loading ? 'Loading...' : `Analyze on ${currentChain.name}`}
          </button>
        </form>

        {error && <p className='mt-4 text-red-500 text-center'>{error}</p>}

        {result && (
          <div className='mt-6 space-y-6'>
            {/* Header: Address + Classification + Chain */}
            <div className='p-4 bg-gray-800 rounded'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-400 text-sm'>
                    Address on {CHAINS[result.chain]?.name || 'Unknown'}
                  </p>
                  <p className='font-mono'>{shortAddr(result.address)}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    result.classification.type === 'Whale'
                      ? 'bg-purple-600'
                      : result.classification.type === 'Suspicious'
                      ? 'bg-red-600'
                      : result.classification.type === 'Exchange Wallet'
                      ? 'bg-blue-600'
                      : result.classification.type === 'Fresh Wallet'
                      ? 'bg-green-600'
                      : result.classification.type === 'Bot'
                      ? 'bg-orange-600'
                      : 'bg-gray-600'
                  }`}
                >
                  {result.classification.type}
                </span>
              </div>
            </div>

            {/* Metrics Section */}
            <div className='p-4 bg-gray-800 rounded'>
              <h2 className='text-lg font-semibold mb-3'>Metrics</h2>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-gray-400 text-sm'>Balance</p>
                  <p className='text-xl font-medium'>
                    {result.balance.toFixed(4)} {CHAINS[result.chain]?.symbol}
                  </p>
                </div>
                <div>
                  <p className='text-gray-400 text-sm'>Wallet Age</p>
                  <p className='text-xl font-medium'>
                    {result.metrics.walletAgeDays} days
                  </p>
                </div>
                <div>
                  <p className='text-gray-400 text-sm'>Transactions</p>
                  <p className='text-xl font-medium'>
                    {result.transactions.length >= 1000
                      ? '1,000+'
                      : result.transactions.length.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className='text-gray-400 text-sm'>Tx / Week</p>
                  <p className='text-xl font-medium'>
                    {result.metrics.txPerWeek}
                  </p>
                </div>
                <div>
                  <p className='text-gray-400 text-sm'>Token Interactions</p>
                  <p className='text-xl font-medium'>
                    {result.metrics.uniqueTokens}
                  </p>
                </div>
                <div>
                  <p className='text-gray-400 text-sm'>First Tx</p>
                  <p className='text-xl font-medium'>
                    {result.metrics.firstTransaction || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Connected Wallets Section */}
            <div className='p-4 bg-gray-800 rounded'>
              <h2 className='text-lg font-semibold mb-3'>Connected Wallets</h2>
              <div className='grid grid-cols-2 gap-6'>
                {/* Sends To */}
                <div>
                  <p className='text-gray-400 text-sm mb-2'>Top Sends To</p>
                  {result.connections.topSendsTo.length > 0 ? (
                    <ul className='space-y-1'>
                      {result.connections.topSendsTo.map((item, i) => (
                        <li
                          key={i}
                          className='flex justify-between items-center font-mono text-sm'
                        >
                          <button
                            onClick={() => copyAddress(item.address)}
                            className='hover:text-blue-400 cursor-pointer'
                            title={item.address}
                          >
                            {shortAddr(item.address)} 📋
                          </button>
                          <span className='text-gray-400'>{item.count} tx</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className='text-gray-500 text-sm'>
                      No outgoing transfers
                    </p>
                  )}
                </div>

                {/* Receives From */}
                <div>
                  <p className='text-gray-400 text-sm mb-2'>
                    Top Receives From
                  </p>
                  {result.connections.topReceivesFrom.length > 0 ? (
                    <ul className='space-y-1'>
                      {result.connections.topReceivesFrom.map((item, i) => (
                        <li
                          key={i}
                          className='flex justify-between items-center font-mono text-sm'
                        >
                          <button
                            onClick={() => copyAddress(item.address)}
                            className='hover:text-blue-400 cursor-pointer'
                            title={item.address}
                          >
                            {shortAddr(item.address)} 📋
                          </button>
                          <span className='text-gray-400'>{item.count} tx</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className='text-gray-500 text-sm'>
                      No incoming transfers
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Risk Indicator */}
            <div className='p-4 bg-gray-800 rounded'>
              <h2 className='text-lg font-semibold mb-3'>Risk Indicators</h2>
              <div className='flex items-center gap-2'>
                <span className='text-gray-400'>Mixer Interaction:</span>
                {result.classification.type === 'Suspicious' ? (
                  <span className='text-red-500 font-medium'>⚠️ Detected</span>
                ) : (
                  <span className='text-green-500 font-medium'>✓ None</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
