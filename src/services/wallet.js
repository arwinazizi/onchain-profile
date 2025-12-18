import etherscan from './etherscan';
import solana from './solana';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch Ethereum wallet data
 */
export const fetchEthWalletData = async (address) => {
  // Stagger calls to avoid rate limit (5 calls/sec max)

  const balance = await etherscan.getBalance(address);
  await delay(250);

  const transactions = await etherscan.getTransactions(address);
  await delay(250);

  const tokenTransfers = await etherscan.getTokenTransfers(address);
  await delay(250);

  const nftTransfers = await etherscan.getNFTTransfers(address);
  await delay(250);

  // NOTE: Removed isContract check - we weren't using it for classification
  // If needed later, add it back

  const firstTx = await etherscan.getFirstTransaction(address);

  return {
    address,
    chain: 'ethereum',
    balance: Number(balance) / 1e18,
    transactions: Array.isArray(transactions) ? transactions : [],
    tokenTransfers: Array.isArray(tokenTransfers) ? tokenTransfers : [],
    nftTransfers: Array.isArray(nftTransfers) ? nftTransfers : [],
    firstTx,
  };
};

/**
 * Fetch Solana wallet data
 */
export const fetchSolWalletData = async (address) => {
  // Get SOL balance (in lamports, convert to SOL)
  const balanceLamports = await solana.getBalance(address);
  await delay(200);

  // Get transaction signatures
  const signatures = await solana.getTransactions(address);
  await delay(200);

  // Get first transaction for wallet age
  const firstTx = await solana.getFirstTransaction(address);
  await delay(200);

  // Get enhanced transaction data (includes token transfers)
  const enhancedTxs = await solana.getEnhancedTransactions(address);
  await delay(200);

  // Get token balances
  const tokenAccounts = await solana.getTokenBalances(address);

  // Transform signatures to transaction-like objects
  // NOTE: Solana txs don't have simple from/to like Ethereum
  // We use timestamps for metrics and enhanced txs for connections
  const transactions = signatures.map((sig) => ({
    hash: sig.signature,
    timeStamp: sig.blockTime?.toString() || '0',
    // No from/to for Solana basic transactions
  }));

  // Extract token transfers from enhanced transactions
  // These DO have from/to which we use for connections
  const tokenTransfers = [];
  enhancedTxs.forEach((tx) => {
    if (tx.tokenTransfers) {
      tx.tokenTransfers.forEach((transfer) => {
        tokenTransfers.push({
          contractAddress: transfer.mint, // Token mint address (like ERC-20 contract)
          from: transfer.fromUserAccount || '',
          to: transfer.toUserAccount || '',
          value: transfer.tokenAmount?.toString() || '0',
          timeStamp: tx.timestamp?.toString() || '0',
        });
      });
    }
  });

  // Format firstTx to match Ethereum structure
  const formattedFirstTx = firstTx
    ? { timeStamp: firstTx.blockTime?.toString() || '0' }
    : null;

  return {
    address,
    chain: 'solana',
    balance: balanceLamports / 1e9, // Convert lamports to SOL
    transactions,
    tokenTransfers,
    nftTransfers: [], // Could add NFT parsing later
    firstTx: formattedFirstTx,
    tokenAccounts: tokenAccounts.length,
  };
};

/**
 * Fetch wallet data for any chain
 */
export const fetchWalletData = async (address, chain = 'ethereum') => {
  if (chain === 'solana') {
    return fetchSolWalletData(address);
  }
  return fetchEthWalletData(address);
};

export default { fetchWalletData, fetchEthWalletData, fetchSolWalletData };
