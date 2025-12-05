import etherscan from "./etherscan";

export const fetchWalletData = async (address) => {
    const [
        balance,
        transactions,
        tokentransfers,
        nftTransfers,
        contractCheck
    ] = await Promise.all([
        etherscan.getBalance(address),
        etherscan.getTransactions(address),
        etherscan.getTokenTransfers(address),
        etherscan.getNFTTransfers(address),
        etherscan.isContract(address)
    ]);

    return {
        address,
        balance: Number(balance) / 1e18,
        transactions: Array.isArray(transactions) ? transactions : [],
        tokenTransfers: Array.isArray(tokenTransfers) ? tokenTransfers : [],
        nftTransfers: Array.isArray(nftTransfers) ? nftTransfers : [],
        isContract: contractCheck
    };
}