/**
 * Find top connected wallets (counterparties)
 * 
 * Input: walletData from fetchWalletData()
 * Output: {
 *  topSendsTo: [{ address, count }],
 *  topReceivesFrom: [{ address, count }]
 * }
 * 
 */

export const getConnectedWallets = (walletData) => {
    const { address, transactions } = walletData;
    const walletLower = address.toLowerCase();

    const sendsTo = {};
    const receivesFrom = {};

    transactions.forEach((tx) => {
        const from = tx.from?.toLowerCase();
        const to = tx.to?.toLowerCase();

        // Skip if no destination (contract creation)
        if (!to) return;

        if (from === walletLower && to !== walletLower) {
            // outgoing transaction
            sendsTo[to] = (sendsTo[to] || 0) + 1;
        } else if (to === walletLower && from !== walletLower) {
            // Incoming transaction
            receivesFrom[from] = (receivesFrom[from] || 0) + 1;
        }
    });

    // Sort and get top 5
    const topSendsTo = Object.entries(sendsTo)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([addr, count]) => [{ address: addr, count }]);

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