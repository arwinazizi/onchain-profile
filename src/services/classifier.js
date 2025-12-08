import mixers from '../data/mixers.json';
import exchanges from '../data/exchanges.json';

const MIXER_ADDRESSES = mixers.map((a) => a.toLowerCase());
const EXCHANGE_ADDRESSES = exchanges.map((a) => a.toLowerCase());

export const classifyWallet = (walletData) => {
  const { balance, transactions, tokenTransfers, nftTransfers, isContract } =
    walletData;

  // 1. Contract
  if (isContract) {
    return { type: 'Contract', confidence: 'high' };
  }

  // 2. Exchange Wallet
  if (EXCHANGE_ADDRESSES.includes(walletData.address.toLowerCase())) {
    return { type: 'Exchange Wallet', confidence: 'high' };
  }

  // 3. Fresh Wallet
  if (transactions.length < 5) {
    return { type: 'Fresh Wallet', confidence: 'high' };
  }

  // 4. Suspicious (mixer interaction)
  const hasMixerInteraction = transactions.some(
    (tx) =>
      MIXER_ADDRESSES.includes(tx.to?.toLowerCase()) ||
      MIXER_ADDRESSES.includes(tx.from?.toLowerCase())
  );
  if (hasMixerInteraction) {
    return { type: 'Suspicious', confidence: 'high' };
  }

  // 5. Bot detection
  const botScore = calculateBotScore(transactions);
  if (botScore > 0.7) {
    return { type: 'Bot', confidence: botScore > 0.9 ? 'high' : 'medium' };
  }

  // 6. Whale (> 100 ETH for now, we'll add USD check later)
  if (balance > 100) {
    return { type: 'Whale', confidence: 'high' };
  }

  // 7. NFT Collector
  const nftRatio = nftTransfers.length / (transactions.length || 1);
  if (nftRatio > 0.5 && nftTransfers.length > 10) {
    return { type: 'NFT Collector', confidence: 'high' };
  }

  // 8. Active Trader
  const traderScore = calculateTraderScore(transactions, tokenTransfers);
  if (traderScore > 0.7) {
    return {
      type: 'Active Trader',
      confidence: traderScore > 0.9 ? 'high' : 'medium',
    };
  }

  // 9. Hodler
  const hodlerScore = calculateHodlerScore(transactions);
  if (hodlerScore > 0.7) {
    return {
      type: 'Hodler',
      confidence: hodlerScore > 0.9 ? 'high' : 'medium',
    };
  }

  // 10. Fallback
  return { type: 'Unclassified', confidence: 'low' };
};

// Bot: rapid transactions, 24/7 activity
const calculateBotScore = (transactions) => {
  if (transactions.length < 50) return 0;

  const last30Days = transactions.filter((tx) => {
    const txDate = new Date(tx.timeStamp * 1000);
    const now = new Date();
    const diffDays = (now - txDate) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  });

  if (last30Days.length < 20) return 0;

  // Check for rapid transactions (< 60 sec apart)
  let rapidCount = 0;
  for (let i = 1; i < last30Days.length; i++) {
    const diff = last30Days[i - 1].timeStamp - last30Days[i].timeStamp;
    if (diff < 60) rapidCount++;
  }
  const rapidRatio = rapidCount / last30Days.length;

  // Check active hours
  const hours = new Set(
    last30Days.map((tx) => {
      return new Date(tx.timeStamp * 1000).getUTCHours();
    })
  );
  const hourSpread = hours.size / 24;

  return rapidRatio * 0.6 + hourSpread * 0.4;
};

// Active Trader: frequent txs, token swaps
const calculateTraderScore = (transactions, tokenTransfers) => {
  if (transactions.length < 20) return 0;

  const last30Days = transactions.filter((tx) => {
    const txDate = new Date(tx.timeStamp * 1000);
    const now = new Date();
    const diffDays = (now - txDate) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  });

  const txFrequency = last30Days.length / 30; // txs per day
  const tokenActivity = tokenTransfers.length / (transactions.length || 1);

  const freqScore = Math.min(txFrequency / 10, 1);
  const tokenScore = Math.min(tokenActivity, 1);

  return freqScore * 0.5 + tokenScore * 0.5;
};

// Hodler: old wallet, low outgoing
const calculateHodlerScore = (transactions) => {
  if (transactions.length === 0) return 0;

  const oldest = transactions[transactions.length - 1];
  const walletAge = (Date.now() / 1000 - oldest.timeStamp) / (60 * 60 * 24);

  if (walletAge < 180) return 0;

  const outgoing = transactions.filter(
    (tx) => tx.from.toLowerCase() === transactions[0].from?.toLowerCase()
  );
  const outgoingRatio = outgoing.length / transactions.length;

  const ageScore = Math.min(walletAge / 365, 1);
  const inactiveScore = 1 - outgoingRatio;

  return ageScore * 0.4 + inactiveScore * 0.6;
};

export default { classifyWallet };
