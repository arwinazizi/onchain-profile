/**
 * Calculate wallet metrics from transaction data
 *
 * Input: walletData from fetchWalletData()
 * Output: {
 *   walletAgeDays: number,
 *   firstTransaction: string (date),
 *   lastTransaction: string (date),
 *   txPerWeek: number,
 *   uniqueTokens: number
 * }
 */
export const calculateMetrics = (walletData) => {
  const {
    transactions,
    tokenTransfers,
    firstTx,
    chain = 'ethereum',
  } = walletData;

  // Default values if no transactions
  if (!transactions.length && !firstTx) {
    return {
      walletAgeDays: 0,
      firstTransaction: null,
      lastTransaction: null,
      txPerWeek: 0,
      uniqueTokens: 0,
    };
  }

  // Use firstTx from dedicated API call (accurate)
  // Fall back to transactions array if firstTx is null
  const firstTxTime = firstTx
    ? Number(firstTx.timeStamp)
    : Math.min(...transactions.map((tx) => Number(tx.timeStamp)));

  // Last transaction from our transactions array (most recent)
  const lastTxTime = transactions.length
    ? Math.max(...transactions.map((tx) => Number(tx.timeStamp)))
    : firstTxTime;

  // Wallet age in days
  const now = Math.floor(Date.now() / 1000);
  const walletAgeDays = Math.floor((now - firstTxTime) / 86400);

  // Format dates
  const firstTransaction = new Date(firstTxTime * 1000).toLocaleDateString();
  const lastTransaction = new Date(lastTxTime * 1000).toLocaleDateString();

  // Transactions per week
  const weeks = walletAgeDays / 7 || 1; // Avoid division by zero
  const txPerWeek = Math.round((transactions.length / weeks) * 10) / 10;

  // Unique tokens — count unique contract addresses
  // For Ethereum: lowercase for comparison (case-insensitive)
  // For Solana: keep original case (case-sensitive)
  const uniqueTokenAddresses = new Set(
    tokenTransfers
      .map((tx) => {
        const addr = tx.contractAddress;
        if (!addr) return null;
        return chain === 'solana' ? addr : addr.toLowerCase();
      })
      .filter(Boolean)
  );
  const uniqueTokens = uniqueTokenAddresses.size;

  return {
    walletAgeDays,
    firstTransaction,
    lastTransaction,
    txPerWeek,
    uniqueTokens,
  };
};

export default { calculateMetrics };
