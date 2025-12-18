import axios from 'axios';

const API_KEY = import.meta.env.VITE_HELIUS_API_KEY;
const BASE_URL = `https://api.helius.xyz/v0`;
const RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${API_KEY}`;

/**
 * Get SOL balance for an address
 * Returns balance in lamports (1 SOL = 1,000,000,000 lamports)
 */
export const getBalance = async (address) => {
  const response = await axios.post(RPC_URL, {
    jsonrpc: '2.0',
    id: 1,
    method: 'getBalance',
    params: [address],
  });
  return response.data.result?.value || 0;
};

/**
 * Get transaction signatures (list of tx hashes)
 * Limited to 1000 most recent (Solana RPC limit)
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
 * Paginates backwards through history to find the very first tx
 */
export const getFirstTransaction = async (address) => {
  let signatures = [];
  let before = null;

  // Keep fetching until we reach the beginning
  // Limit to 10 iterations to avoid infinite loop (10,000 tx max)
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

  // Return the oldest transaction (last in the final batch)
  return signatures.length > 0 ? signatures[signatures.length - 1] : null;
};

/**
 * Get parsed transaction history with token transfers
 * Uses Helius enhanced API - provides rich data including from/to addresses
 * Limited to 100 transactions
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
 * Check if address is a program (equivalent to smart contract)
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
