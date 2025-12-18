import mixersEth from '../data/mixers.json';
import exchangesEth from '../data/exchanges.json';
import mixersSol from '../data/solana-mixers.json';
import exchangesSol from '../data/solana-exchanges.json';

// Ethereum addresses (lowercase)
const ETH_MIXERS = mixersEth.map((a) => a.toLowerCase());
const ETH_EXCHANGES = exchangesEth.map((a) => a.toLowerCase());

// Solana addresses (case-sensitive, but we'll lowercase for comparison)
const SOL_MIXERS = mixersSol.map((a) => a.toLowerCase());
const SOL_EXCHANGES = exchangesSol.map((a) => a.toLowerCase());

/**
 * Classification priority order:
 * 1. Exchange Wallet - hardcoded list
 * 2. Suspicious - mixer interaction
 * 3. Bot - 500+ tx in 24 hours
 * 4. Whale - balance > 100 ETH or > 1000 SOL
 * 5. Fresh Wallet - < 5 transactions
 * 6. Unclassified - fallback
 */
export const classifyWallet = (walletData) => {
  const { address, balance, transactions, chain = 'ethereum' } = walletData;

  // Select correct address lists based on chain
  const mixerAddresses = chain === 'solana' ? SOL_MIXERS : ETH_MIXERS;
  const exchangeAddresses = chain === 'solana' ? SOL_EXCHANGES : ETH_EXCHANGES;

  // Whale threshold differs by chain
  const whaleThreshold = chain === 'solana' ? 1000 : 100; // 1000 SOL or 100 ETH

  // 1. Exchange Wallet – known addresses from static list
  if (exchangeAddresses.includes(address.toLowerCase())) {
    return { type: 'Exchange Wallet', confidence: 'high' };
  }

  // 2. Suspicious – mixer interaction detected
  const hasMixerInteraction = transactions.some((tx) => {
    const from = tx.from?.toLowerCase();
    const to = tx.to?.toLowerCase();
    return mixerAddresses.includes(from) || mixerAddresses.includes(to);
  });

  if (hasMixerInteraction) {
    return { type: 'Suspicious', confidence: 'high' };
  }

  // 3. Bot – 500+ transactions in last 24 hours
  const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
  const txLast24h = transactions.filter(
    (tx) => Number(tx.timeStamp) > oneDayAgo
  );

  if (txLast24h.length >= 500) {
    return { type: 'Bot', confidence: 'high' };
  }

  // 4. Whale – high balance
  if (balance > whaleThreshold) {
    return { type: 'Whale', confidence: 'high' };
  }

  // 5. Fresh Wallet – very few transactions
  if (transactions.length < 5) {
    return { type: 'Fresh Wallet', confidence: 'high' };
  }

  // 6. Unclassified – no strong pattern detected
  return { type: 'Unclassified', confidence: 'low' };
};

export default { classifyWallet };
