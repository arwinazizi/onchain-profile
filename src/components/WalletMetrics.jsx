/**
 * WalletMetrics - displays wallet statistics in a grid
 *
 * Props:
 *   balance: number
 *   symbol: string (ETH or SOL)
 *   metrics: { walletAgeDays, txPerWeek, uniqueTokens, firstTransaction }
 *   transactionCount: number
 */

function WalletMetrics({ balance, symbol, metrics, transactionCount }) {
  return (
    <div className='p-4 bg-gray-800 rounded'>
      <h2 className='text-lg font-semibold mb-3'>Metrics</h2>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <p className='text-gray-400 text-sm'>Balance</p>
          <p className='text-xl font-medium'>
            {balance.toFixed(4)} {symbol}
          </p>
        </div>
        <div>
          <p className='text-gray-400 text-sm'>Wallet Age</p>
          <p className='text-xl font-medium'>{metrics.walletAgeDays} days</p>
        </div>
        <div>
          <p className='text-gray-400 text-sm'>Transactions</p>
          <p className='text-xl font-medium'>
            {transactionCount >= 1000
              ? '1,000+'
              : transactionCount.toLocaleString()}
          </p>
        </div>
        <div>
          <p className='text-gray-400 text-sm'>Tx / Week</p>
          <p className='text-xl font-medium'>{metrics.txPerWeek}</p>
        </div>
        <div>
          <p className='text-gray-400 text-sm'>Token Interactions</p>
          <p className='text-xl font-medium'>{metrics.uniqueTokens}</p>
        </div>
        <div>
          <p className='text-gray-400 text-sm'>First Tx</p>
          <p className='text-xl font-medium'>
            {metrics.firstTransaction || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default WalletMetrics;
