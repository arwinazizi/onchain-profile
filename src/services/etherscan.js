import axios from 'axios'

const API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY;
const BASE_URL = 'https://api.etherscan.io/v2/api';

const etherscan = axios.create({
    baseURL: BASE_URL,
    params: {
        apikey: API_KEY,
        chainid: 1
    }
});

// Get ETH balance
export const getBalance = async (address) => {
    const response = await etherscan.get('', {
        params: {
            module: 'account',
            action: 'balance',
            address,
            tag: 'latest'
        }
    });
    return response.data.result;
}

// Get transaction list
export const getTransactions = async () => {
    const response = await etherscan.get('', {
      params: {
        module: 'account',
        action: 'txlist',
        address,
        startblock: 0,
        endblock: 99999999,
        page: 1,

      },
    });
    return response.data.result;
};

// Get ERC-20 token transfers
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
            sort: 'desc'
        }
    });
    return response.data.result;
};

// Get NFT transfers
export const getNFTTransfers = async (address) => {
    const response = await etherscan.get('', {
        param: {
            module: 'account',
            action: 'tokennfttx',
            address,
            startblock: 0,
            endblock: 99999999,
            page: 1,
            offset: 10000,
            sort: 'desc'
        }
    });
    return response.data.result;
}

// Check if address is contract
export const isContract = async (address) => {
    const response = await etherscan.get('', {
        params: {
            module: 'proxy',
            action: 'eth_getCode',
            address,
            tag: 'latest'
        }
    });
    return response.data.result !== '0x';
}

// Get ETH price
export const getEthPrice = async () => {
    const respone = await etherscan.get('', {
        param: {
            module: 'stats',
            action: 'ethprice'
        }
    });
    return response.data.result.ethusd;
};

export default {
    getBalance,
    getTransactions,
    getTokenTransfers,
    getNFTTransfers,
    isContract,
    getEthPrice
};