import axios from 'axios';

const API_KEY = import.meta.env.VITE_HELIUS_API_KEY;
const BASE_URL = `https://api.helius.xyz/v0`;
const RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${API_KEY}`;

/**
 * Get SOL balance for an address
 */
export const getBalance = async (address) => {
  const response = await axios.post(RPC_URL, {
    jsonrpc: '2.0',
    id: 1,
    method: 'getBalance',
    params: [address],
  });
  // Returns lamports (1 SOL = 1,000,000,000 lamports)
  return response.data.result?.value || 0;
};

/**
 * Get transaction signatures (list of tx hashes)
 */
export const getTransactions = async (address) => {
  const response = await axios.post(RPC_URL, {
    jsonrpc: '2.0',
    id: 1,
    method: 'getSignaturesForAddress',
    params: [address, { limit: 1000 }],
  });
  return response.data.result || [];
};

/**
 * Get first transaction (oldest) for wallet age
 */
export const getFirstTransaction = async (address) => {
  // Get signatures with 'before' param to paginate backwards
  // This is tricky - we get the last page of results
  let signatures = [];
  let before = null;

  // Keep fetching until we reach the beginning
  // Limit to 10 iterations to avoid infinite loop
  for (let i = 0; i < 10; i++) {
    const params = [address, { limit: 1000 }];
    if (before) {
      params[1].before = before;
    }

    const response = await axios.post(RPC_URL, {
      jsonrpc: '2.0',
      id: 1,
      method: 'getSignaturesForAddress',
      params,
    });

    const results = response.data.result || [];
    if (results.length === 0) break;

    signatures = results;
    before = results[results.length - 1].signature;

    // If we got less than 1000, we've reached the end
    if (results.length < 1000) break;
  }

  // Return the oldest transaction
  return signatures.length > 0 ? signatures[signatures.length - 1] : null;
};

/**
 * Get parsed transaction history with token transfers
 * Uses Helius enhanced API
 */
export const getEnhancedTransactions = async (address) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/addresses/${address}/transactions`,
      {
        params: {
          'api-key': API_KEY,
          limit: 100,
        },
      }
    );
    return response.data || [];
  } catch (err) {
    console.error('Enhanced transactions error:', err);
    return [];
  }
};

/**
 * Get token balances (SPL tokens)
 */
export const getTokenBalances = async (address) => {
  const response = await axios.post(RPC_URL, {
    jsonrpc: '2.0',
    id: 1,
    method: 'getTokenAccountsByOwner',
    params: [
      address,
      { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
      { encoding: 'jsonParsed' },
    ],
  });
  return response.data.result?.value || [];
};

/**
 * Check if address is a program (equivalent to contract)
 */
export const isProgram = async (address) => {
  try {
    const response = await axios.post(RPC_URL, {
      jsonrpc: '2.0',
      id: 1,
      method: 'getAccountInfo',
      params: [address, { encoding: 'jsonParsed' }],
    });
    const accountInfo = response.data.result?.value;
    return accountInfo?.executable || false;
  } catch {
    return false;
  }
};

export default {
  getBalance,
  getTransactions,
  getFirstTransaction,
  getEnhancedTransactions,
  getTokenBalances,
  isProgram,
};
