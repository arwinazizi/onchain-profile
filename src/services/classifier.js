import mixers from '../data/mixers.json';
import exchanges from '../data/exchanges.json';

// Normalize lists to lowercase for fast lookup
const MIXER_ADDRESSES = mixers.map((a) => a.toLowerCase());
const EXCHANGE_ADDRESSES = exchanges.map((a) => a.toLowerCase());

/**
 * Main classification entrypoint.
 * Input: walletData from fetchWalletData()
 * Output: { type: string, confidence: 'low' | 'medium' | 'high' }
 */
export const classifyWallet = (walletData) => {
  const { balance, transactions, tokenTransfers, nftTransfers, isContract } =
    walletData;

  // 1. Contract – strongest signal, early exit
  if (isContract) {
    return { type: 'Contract', confidence: 'high' };
  }

  // 2. Known exchange wallet – from our static list
  if (EXCHANGE_ADDRESSES.includes(walletData.address.toLowerCase())) {
    return { type: 'Exchange Wallet', confidence: 'high' };
  }

  // 3. Suspicious – mixer interaction overrides "fresh" etc.
  const hasMixerInteraction = transactions.some((tx) => {
    const from = tx.from?.toLowerCase();
    const to = tx.to?.toLowerCase();
    return MIXER_ADDRESSES.includes(from) || MIXER_ADDRESSES.includes(to);
  });

  if (hasMixerInteraction) {
    return { type: 'Suspicious', confidence: 'high' };
  }

  // 4. Fresh Wallet – very few transactions
  if (transactions.length < 5) {
    return { type: 'Fresh Wallet', confidence: 'high' };
  }

  // 5. Bot – rapid, around-the-clock activity
  const botScore = calculateBotScore(transactions);
  if (botScore > 0.7) {
    return {
      type: 'Bot',
      confidence: botScore > 0.9 ? 'high' : 'medium',
    };
  }

  // 6. Whale – simple ETH balance threshold (can later switch to USD)
  if (balance > 100) {
    return { type: 'Whale', confidence: 'high' };
  }

  // 7. NFT Collector – majority of activity is NFT-related
  const nftRatio = nftTransfers.length / (transactions.length || 1);
  if (nftRatio > 0.5 && nftTransfers.length > 10) {
    return { type: 'NFT Collector', confidence: 'high' };
  }

  // 8. Active Trader – frequent tx and token transfers
  const traderScore = calculateTraderScore(transactions, tokenTransfers);
  if (traderScore > 0.7) {
    return {
      type: 'Active Trader',
      confidence: traderScore > 0.9 ? 'high' : 'medium',
    };
  }

  // 9. Hodler – old wallet, low outgoing activity
  const hodlerScore = calculateHodlerScore(transactions, walletData.address);
  if (hodlerScore > 0.7) {
    return {
      type: 'Hodler',
      confidence: hodlerScore > 0.9 ? 'high' : 'medium',
    };
  }

  // 10. Fallback – we didn't detect anything strong
  return { type: 'Unclassified', confidence: 'low' };
};

/**
 * Bot score:
 * - Looks at last 30 days of activity
 * - Measures rapid txs (< 60s apart)
 * - Measures spread of active hours (bots often run around the clock)
 */
const calculateBotScore = (transactions) => {
  if (transactions.length < 50) return 0;

  const now = Date.now();

  const last30Days = transactions.filter((tx) => {
    const ts = Number(tx.timeStamp); // seconds
    const txDateMs = ts * 1000;
    const diffDays = (now - txDateMs) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  });

  if (last30Days.length < 20) return 0;

  // Sort by timestamp descending (newest first)
  const sorted = [...last30Days].sort(
    (a, b) => Number(b.timeStamp) - Number(a.timeStamp)
  );

  // Rapid transactions: < 60 seconds apart
  let rapidCount = 0;
  for (let i = 1; i < sorted.length; i++) {
    const t1 = Number(sorted[i - 1].timeStamp);
    const t2 = Number(sorted[i].timeStamp);
    const diff = t1 - t2;
    if (diff > 0 && diff < 60) rapidCount++;
  }
  const rapidRatio = rapidCount / sorted.length; // 0–1

  // Active hour spread: how many unique UTC hours are used
  const hours = new Set(
    sorted.map((tx) => {
      const ts = Number(tx.timeStamp);
      return new Date(ts * 1000).getUTCHours();
    })
  );
  const hourSpread = hours.size / 24; // 0–1

  // Weighted score: prioritize rapid frequency, then hour spread
  return rapidRatio * 0.6 + hourSpread * 0.4;
};

/**
 * Trader score:
 * - Frequent activity in last 30 days
 * - Significant share of txs involve token transfers
 */
const calculateTraderScore = (transactions, tokenTransfers) => {
  if (transactions.length < 20) return 0;

  const now = Date.now();

  const last30Days = transactions.filter((tx) => {
    const ts = Number(tx.timeStamp);
    const txDateMs = ts * 1000;
    const diffDays = (now - txDateMs) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  });

  if (last30Days.length === 0) return 0;

  // Tx frequency: tx/day, normalized with cap at 10/day
  const txFrequency = last30Days.length / 30;
  const freqScore = Math.min(txFrequency / 10, 1); // 0–1

  // Token activity: how many txs have tokens relative to all txs
  const tokenActivity = tokenTransfers.length / (transactions.length || 1);
  const tokenScore = Math.min(tokenActivity, 1); // 0–1

  return freqScore * 0.5 + tokenScore * 0.5;
};

/**
 * Hodler score:
 * - Wallet age > 180 days
 * - Few outgoing transactions relative to total
 */
const calculateHodlerScore = (transactions, walletAddress) => {
  if (transactions.length === 0) return 0;

  const oldest = transactions[transactions.length - 1];
  const walletAgeDays =
    (Date.now() / 1000 - Number(oldest.timeStamp)) / (60 * 60 * 24);

  // Not old enough to be a hodler
  if (walletAgeDays < 180) return 0;

  const lowerAddr = walletAddress.toLowerCase();

  const outgoing = transactions.filter(
    (tx) => tx.from?.toLowerCase() === lowerAddr
  );
  const outgoingRatio = outgoing.length / transactions.length; // 0–1

  // Age score: cap at 1 for >= 1 year
  const ageScore = Math.min(walletAgeDays / 365, 1);
  // Inactive score: 1 = never sends, 0 = always sending
  const inactiveScore = 1 - outgoingRatio;

  return ageScore * 0.4 + inactiveScore * 0.6;
};

export default { classifyWallet };
