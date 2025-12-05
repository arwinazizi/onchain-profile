import { useState } from 'react';
import { validateAddress } from './utils/validation';
import etherscan from './services/etherscan';

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
      const balance = await etherscan.getBalance(validation.address);
      const ethBalance = (Number(balance) / 1e18).toFixed(4);
      setResult({ balance: ethBalance });
    } catch (err) {
      setError('API call failed');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold">Onchain-Profile</h1>
      <p className="text-gray-400 mt-2">Paste a wallet address to analyze</p>

      <form onSubmit={handleSubmit} className="mt-6">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="0x..."
          className="w-full max-w-xl px-4 py-2 bg-gray-800 rounded border border-gray-700 focus:border-blue-500 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-4 px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Analyze'}
        </button>
      </form>

      {error && <p className="mt-4 text-red-500">{error}</p>}

      {result && (
        <div className="mt-6 p-4 bg-gray-800 rounded max-w-xl">
          <p>Balance: {result.balance} ETH</p>
        </div>
      )}
    </div>
  );
}

export default App;
