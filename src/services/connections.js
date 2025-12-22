/**
 * Find top connected wallets (counterparties)
 *
 * For Ethereum: Uses transactions (from/to) and tokenTransfers
 * For Solana: Uses tokenTransfers AND nativeTransfers (SOL movements)
 *
 * Input: walletData from fetchWalletData()
 * Output: {
 *   topSendsTo: [{ address, count }],
 *   topReceivesFrom: [{ address, count }]
 * }
 */

// Minimum threshold to filter dust spam (in lamports)
// 1,000,000 lamports = 0.001 SOL
const DUST_THRESHOLD_LAMPORTS = 1000000;

export const getConnectedWallets = (walletData) => {
  const {
    address,
    transactions,
    tokenTransfers,
    nativeTransfers = [],
    chain = 'ethereum',
  } = walletData;

  const sendsTo = {};
  const receivesFrom = {};

  // Helper to compare addresses (case-insensitive for ETH, exact for SOL)
  const normalizeAddr = (addr) => {
    if (!addr) return null;
    return chain === 'solana' ? addr : addr.toLowerCase();
  };

  const walletAddr = normalizeAddr(address);

  if (chain === 'ethereum') {
    // --- ETHEREUM LOGIC (unchanged) ---

    // 1. Simple ETH transfers (value > 0, no contract call)
    const simpleTransfers = transactions.filter((tx) => {
      return tx.value !== '0' && tx.input === '0x' && tx.to;
    });

    simpleTransfers.forEach((tx) => {
      const from = normalizeAddr(tx.from);
      const to = normalizeAddr(tx.to);

      if (from === walletAddr && to && to !== walletAddr) {
        sendsTo[to] = (sendsTo[to] || 0) + 1;
      } else if (to === walletAddr && from && from !== walletAddr) {
        receivesFrom[from] = (receivesFrom[from] || 0) + 1;
      }
    });

    // 2. ERC-20 token transfers
    tokenTransfers.forEach((tx) => {
      const from = normalizeAddr(tx.from);
      const to = normalizeAddr(tx.to);

      if (!to) return;

      if (from === walletAddr && to !== walletAddr) {
        sendsTo[to] = (sendsTo[to] || 0) + 1;
      } else if (to === walletAddr && from && from !== walletAddr) {
        receivesFrom[from] = (receivesFrom[from] || 0) + 1;
      }
    });
  } else if (chain === 'solana') {
    // --- SOLANA LOGIC (with dust filter) ---

    // Filter native transfers to exclude dust
    const filteredNativeTransfers = nativeTransfers.filter(
      (tx) => tx.amount >= DUST_THRESHOLD_LAMPORTS
    );

    // Combine token transfers AND filtered native SOL transfers
    const allTransfers = [...tokenTransfers, ...filteredNativeTransfers];

    allTransfers.forEach((tx) => {
      const from = normalizeAddr(tx.from);
      const to = normalizeAddr(tx.to);

      if (!from || !to) return;

      if (from === walletAddr && to !== walletAddr) {
        sendsTo[to] = (sendsTo[to] || 0) + 1;
      } else if (to === walletAddr && from !== walletAddr) {
        receivesFrom[from] = (receivesFrom[from] || 0) + 1;
      }
    });
  }

  // Sort and get top 5
  const topSendsTo = Object.entries(sendsTo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([addr, count]) => ({ address: addr, count }));

  const topReceivesFrom = Object.entries(receivesFrom)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([addr, count]) => ({ address: addr, count }));

  return {
    topSendsTo,
    topReceivesFrom,
  };
};

export default { getConnectedWallets };
