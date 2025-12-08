import { useState } from 'react';
import { validateAddress } from './utils/validation';
import { fetchWalletData } from './services/wallet';
import { classifyWallet } from './services/classifier';

function App() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const validation = validateAddress(address);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    try {
      const walletData = await fetchWalletData(validation.address);
      const classification = classifyWallet(walletData);

      console.log('walletData:', walletData);
      console.log('classification:', classification);

      setResult({
        ...walletData,
        classification
      });
    } catch (err) {
      setError('Failed to fetch wallet data');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className='min-h-screen bg-gray-900 text-white p-8'>
      <h1 className='text-3xl font-bold'>Onchain-Profile</h1>
      <p className='text-gray-400 mt-2'>Paste a wallet address to analyze</p>

      <form onSubmit={handleSubmit} className='mt-6'>
        <input
          type='text'
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder='0x...'
          className='w-full max-w-xl px-4 py-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 outline-none'
        />
        <button
          type='submit'
          disabled={loading}
          className='mt-4 px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50'
        >
          {loading ? 'Loading...' : 'Analyze'}
        </button>
      </form>

      {error && <p className='mt-4 text-red-500'>{error}</p>}

      {result && (
        <div className='mt-6 p-4 bg-gray-800 rounded max-w-xl'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-semibold'>Wallet Profile</h2>
            <span
              className={`px-3 py-1 rounded text-sm font-medium ${
                result.classification.confidence === 'high'
                  ? 'bg-green-600'
                  : result.classification.confidence === 'medium'
                  ? 'bg-yellow-600'
                  : 'bg-gray-600'
              }`}
            >
              {result.classification.type}
            </span>
          </div>

          <div>
            <p>
              <span className='text-gray-500'>Address:</span> {result.address.slice(0, 10)}...{result.address.slice(-8)}
            </p>
            <p>
              <span className='text-gray-500'>Balance:</span> {result.balance.toFixed(4)} ETH
            </p>
            <p>
              <span className='text-gray-500'>Transaction:</span>{' '}
              {result.transactions.length === 10000 ? '10000+' : result.transactions.length}
            </p>
            <p>
              <span className='text-gray-500'>Token Transfers:</span> {' '}
              {result.tokenTransfers.length === 10000 ? '10000+' : result.tokenTransfers.length}
            </p>
            <p>
              <span className='text-gray-500'>NFT Transfers:</span> {''}
              {result.nftTransfers.length === 10000 ? '10000+' : result.nftTransfers.length}
            </p>
            <p>
              <span className='text-gray-500'>Is Contract</span> {result.isContract ? 'Yes' : 'No'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
