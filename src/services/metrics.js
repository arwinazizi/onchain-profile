/*
Calculate wallet metrics from transaction data

Input: WalletData from fetchWalletData()

Output: {
walletAgeDays: number,
firstTransaction: string (date),
lastTransaction: string (date),
txPerWeek: number,
UniqueTokens: number
}
*/

export const calculateMetrics = (walletData) => {
    const { transactions, tokenTransfers } = walletData;

    // Default values if no transactions
    if (!transactions.length) {
        return {
            walletAgeDays: 0,
            firstTransaction: null,
            lastTransaction: null,
            txPerWeek: 0,
            uniqueTaaokens: 0,
        };
    }

    // Get timestamps (Etherscan returns unix seconds)
    const timestamps = transactions.map((tx) => Number(tx.timeStamp));
    const firstTxTime = Math.min(...timestamps);
    const lastTxTime = Math.max(...timestamps);

    // Wallet age in days
    const now = Math.floor(Date.now() / 1000);
    const walletAgeDays = Math.floor((now - firstTxTime) / 86400);

    // Format dates
    const firstTransaction = new Date(firstTxTime * 1000).toLocaleDateString();
    const lastTransaction = new Date(lastTxTime * 1000).toLocaleDateString();

    // Transactions per week
    const weeks = walletAgeDays / 7 || 1;
    const txPerWeek = Math.round((transactions.length / weeks) * 10) / 10;

    // Unique tokens (from token transfers)
    const uniqueTokens = new Set(
      tokenTransfers.map((tx) => tx.contractAddress?.toLowerCase())
    ).size;

    return {
        walletAgeDays,
        firstTransaction,
        lastTransaction,
        txPerWeek,
        uniqueTokens,
    };

};

export default { calculateMetrics };