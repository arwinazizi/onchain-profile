import axios from 'axios';

const API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY;
const BASE_URL = 'https://api.etherscan.io/v2/api';

const etherscan = axios.create({
  baseURL: BASE_URL,
  params: {
    apikey: API_KEY,
    chainid: 1,
  },
});

/**
 * Get first ever transaction (for accurate wallet age)
 * Uses sort=asc to get oldest first, offset=1 to get just one
 */
export const getFirstTransaction = async (address) => {
  const response = await etherscan.get('', {
    params: {
      module: 'account',
      action: 'txlist',
      address,
      startblock: 0,
      endblock: 99999999,
      page: 1,
      offset: 1,
      sort: 'asc',
    },
  });
  return response.data.result[0] || null;
};

/**
 * Get ETH balance
 */
export const getBalance = async (address) => {
  const response = await etherscan.get('', {
    params: {
      module: 'account',
      action: 'balance',
      address,
      tag: 'latest',
    },
  });
  return response.data.result;
};

/**
 * Get transaction list (last 10,000)
 */
export const getTransactions = async (address) => {
  const response = await etherscan.get('', {
    params: {
      module: 'account',
      action: 'txlist',
      address,
      startblock: 0,
      endblock: 99999999,
      page: 1,
      offset: 10000,
      sort: 'desc',
    },
  });
  return response.data.result;
};

/**
 * Get ERC-20 token transfers (last 10,000)
 */
export const getTokenTransfers = async (address) => {
  const response = await etherscan.get('', {
    params: {
      module: 'account',
      action: 'tokentx',
      address,
      startblock: 0,
      endblock: 99999999,
      page: 1,
      offset: 10000,
      sort: 'desc',
    },
  });
  return response.data.result;
};

/**
 * Get NFT transfers (last 10,000)
 */
export const getNFTTransfers = async (address) => {
  const response = await etherscan.get('', {
    params: {
      module: 'account',
      action: 'tokennfttx',
      address,
      startblock: 0,
      endblock: 99999999,
      page: 1,
      offset: 10000,
      sort: 'desc',
    },
  });
  return response.data.result;
};

/**
 * Get ETH price in USD
 */
export const getEthPrice = async () => {
  const response = await etherscan.get('', {
    params: {
      module: 'stats',
      action: 'ethprice',
    },
  });
  return response.data.result.ethusd;
};

export default {
  getFirstTransaction,
  getBalance,
  getTransactions,
  getTokenTransfers,
  getNFTTransfers,
  getEthPrice,
};
