import etherscan from './etherscan';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchWalletData = async (address) => {
  // Stagger calls to avoid rate limit
  const balance = await etherscan.getBalance(address);
  await delay(250);

  const transactions = await etherscan.getTransactions(address);
  await delay(250);

  const tokenTransfers = await etherscan.getTokenTransfers(address);
  await delay(250);

  const nftTransfers = await etherscan.getNFTTransfers(address);
  await delay(250);

  const contractCheck = await etherscan.isContract(address);

  const firstTx = await etherscan.getFirstTransaction(address);

  return {
    address,
    balance: Number(balance) / 1e18,
    transactions: Array.isArray(transactions) ? transactions : [],
    tokenTransfers: Array.isArray(tokenTransfers) ? tokenTransfers : [],
    nftTransfers: Array.isArray(nftTransfers) ? nftTransfers : [],
    isContract: contractCheck,
    firstTx,
  };
};
