import axios from 'axios';

const API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY;
const BASE_URL = 'https://api.etherscan.io/v2/api';

// Create request with specific chainId
const makeRequest = (chainId, params) => {
  return axios.get(BASE_URL, {
    params: {
      apikey: API_KEY,
      chainid: chainId,
      ...params,
    },
  });
};

// Get first ever transaction (for accurate wallet age)
export const getFirstTransaction = async (address, chainId = 1) => {
  const response = await makeRequest(chainId, {
    module: 'account',
    action: 'txlist',
    address,
    startblock: 0,
    endblock: 99999999,
    page: 1,
    offset: 1,
    sort: 'asc',
  });
  return response.data.result[0] || null;
};

// Get ETH balance
export const getBalance = async (address, chainId = 1) => {
  const response = await makeRequest(chainId, {
    module: 'account',
    action: 'balance',
    address,
    tag: 'latest',
  });
  return response.data.result;
};

// Get transaction list
export const getTransactions = async (address, chainId = 1) => {
  const response = await makeRequest(chainId, {
    module: 'account',
    action: 'txlist',
    address,
    startblock: 0,
    endblock: 99999999,
    page: 1,
    offset: 10000,
    sort: 'desc',
  });
  return response.data.result;
};

// Get ERC-20 token transfers
export const getTokenTransfers = async (address, chainId = 1) => {
  const response = await makeRequest(chainId, {
    module: 'account',
    action: 'tokentx',
    address,
    startblock: 0,
    endblock: 99999999,
    page: 1,
    offset: 10000,
    sort: 'desc',
  });
  return response.data.result;
};

// Get NFT transfers
export const getNFTTransfers = async (address, chainId = 1) => {
  const response = await makeRequest(chainId, {
    module: 'account',
    action: 'tokennfttx',
    address,
    startblock: 0,
    endblock: 99999999,
    page: 1,
    offset: 10000,
    sort: 'desc',
  });
  return response.data.result;
};

// Check if address is contract
export const isContract = async (address, chainId = 1) => {
  const response = await makeRequest(chainId, {
    module: 'proxy',
    action: 'eth_getCode',
    address,
    tag: 'latest',
  });
  const code = response.data.result;
  return code && code !== '0x' && code.length > 2;
};

// Get ETH price
export const getEthPrice = async (chainId = 1) => {
  const response = await makeRequest(chainId, {
    module: 'stats',
    action: 'ethprice',
  });
  return response.data.result.ethusd;
};

export default {
  getFirstTransaction,
  getBalance,
  getTransactions,
  getTokenTransfers,
  getNFTTransfers,
  isContract,
  getEthPrice,
};