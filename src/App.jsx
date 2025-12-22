import { useState } from 'react';
import { validateAddress } from './utils/validation';
import { fetchWalletData } from './services/wallet';
import { classifyWallet } from './services/classifier';
import { calculateMetrics } from './services/metrics';
import { getConnectedWallets } from './services/connections';

// Components
import {
  ChainSelector,
  WalletHeader,
  WalletMetrics,
  ConnectedWallets,
  RiskIndicators,
} from './components';

// Supported chains config
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

  const handleChainSelect = (newChain) => {
    setChain(newChain);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

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
      console.error('Error fetching wallet data:', err);
      setError(
        'Failed to fetch wallet data. Please check the address and try again.'
      );
    }
    setLoading(false);
  };

  const currentChain = CHAINS[chain];

  return (
    <div className='min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center'>
      <div className='w-full max-w-2xl'>
        <h1 className='text-3xl font-bold text-center'>Onchain-Profile</h1>
        <p className='text-gray-400 mt-2 text-center'>
          Analyze any wallet across multiple chains
        </p>

        <ChainSelector
          chains={CHAINS}
          selectedChain={chain}
          onSelect={handleChainSelect}
        />

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
            {loading ? 'Analyzing...' : `Analyze on ${currentChain.name}`}
          </button>
        </form>

        {error && <p className='mt-4 text-red-500 text-center'>{error}</p>}

        {result && (
          <div className='mt-6 space-y-6'>
            <WalletHeader
              address={result.address}
              chainName={CHAINS[result.chain]?.name || 'Unknown'}
              classificationType={result.classification.type}
            />

            <WalletMetrics
              balance={result.balance}
              symbol={CHAINS[result.chain]?.symbol}
              metrics={result.metrics}
              transactionCount={result.transactions.length}
            />

            <ConnectedWallets connections={result.connections} />

            <RiskIndicators
              isSuspicious={result.classification.type === 'Suspicious'}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
