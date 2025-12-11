import mixers from '../data/mixers.json';
import exchanges from '../data/exchanges.json';

// Normalize lists to lowercase for fast lookup
const MIXER_ADDRESSES = mixers.map((a) => a.toLowerCase());
const EXCHANGE_ADDRESSES = exchanges.map((a) => a.toLowerCase());

/**
 * Simplified classification - only types we can detect RELIABLY
 *
 * Priority order (first match wins):
 * 1. Exchange Wallet - hardcoded list (100% accurate)
 * 2. Fresh Wallet - < 5 transactions (100% accurate)
 * 3. Suspicious - mixer interaction (100% accurate)
 * 4. Whale - balance > 100 ETH (100% accurate)
 * 5. Unclassified - everything else
 *
 * Input: walletData from fetchWalletData()
 * Output: { type: string, confidence: 'high' | 'low' }
 */
export const classifyWallet = (walletData) => {
  const { address, balance, transactions } = walletData;

  // 1. Exchange Wallet – known addresses from static list
  if (EXCHANGE_ADDRESSES.includes(address.toLowerCase())) {
    return { type: 'Exchange Wallet', confidence: 'high' };
  }

  // 2. Suspicious – mixer interaction detected
  const hasMixerInteraction = transactions.some((tx) => {
    const from = tx.from?.toLowerCase();
    const to = tx.to?.toLowerCase();
    return MIXER_ADDRESSES.includes(from) || MIXER_ADDRESSES.includes(to);
  });

  if (hasMixerInteraction) {
    return { type: 'Suspicious', confidence: 'high' };
  }

  // 3. Bot - 500+ transactions in last 24 hours
  const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
  const txLast24h = transactions.filter(
    (tx) => Number(tx.timeStamp) > oneDayAgo
  );

  if (txLast24h.length >= 500) {
    return { type: 'Bot', confidence: 'high' };
  }

  // 4. Whale – high ETH balance
  if (balance > 100) {
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
