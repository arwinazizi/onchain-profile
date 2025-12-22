# Onchain-Profile

A multi-chain wallet analysis tool that simplifies Ethereum & Solana blockchain data into behavioral profiles based on transaction patterns and on-chain activity.

# About

This project was built as a degree project for the Blockchain Development program at Medieinstitutet (BCU24D). It analyzes wallet addresses and classifies them into different behavioral types to help users understand wallet activity patterns

# Features

Multi-chain support - Analyze wallets on both Ethereum and Solana

Wallet classification - Categorizes wallets into behavioral types

Connected wallets - Shows top addresses the wallet interacts with

Risk indicators - Flags suspicious activity patterns

Transaction metrics - Displays key wallet statistics

# Wallet Classifications

Type and descriptions

Whale - High-value wallet holding significant assets (>$100kor>100ETH/1000SOL)

Bot - Automated wallet with high transaction frequency(>500 tx last 24hours)

Exchange - Hardcoded known centralized exchanges

Suspicious - Wallet interacting with known mixers or flagged addresses

Fresh - New wallet with minimal transaction history (<5 transactions)

Unclassified - Regular wallet not matching any of the types.


## Tech Stack

- React + Vite
- Tailwind CSS
- Etherscan API
- Helius Solana RPC

# Getting Started

Prerequisites:

Node.js(v18+)
npm or yarn
API keys for Etherscan and Helius

# Installation 

// clone the repo 
git clone https://github.com/yourusername/onchain-profile.git

// Navigate to project folder
cd onchain-profile

// Install dependencies
npm install

// Create .env file with your API keys
cp env.example .env

// Running the app
npm run dev

# Enviroment variables

Create a .env file in the root directory:

VITE_ETHERSCAN_API_KEY=your_etherscan_api_key
VITE_HELIUS_API_KEY=your_helius_api_key


# How it works 

Classification Logic

Check if Exchange - Compares wallet address against known exchange addresses
Check if Suspicious - Looks for interactions with known mixer contracts (e.g., Tornado Cash, only for ethereum right now)
Check if Bot - Analyzes transaction frequency patterns
Check if Whale - Evaluates wallet balance
Check if Fresh - Counts total transactions
Default - Unclassified if no patterns match

# Limitations

Exchange detection relies on a static list of known addresses - new exchange wallets may not be recognized

Solana mixer detection is limited as most Solana privacy services use dynamic deposit addresses

API rate limits may affect analysis of very active wallets

Classification thresholds are simplified for demonstration purposes



# Future Improvements

Paid API for more data, for example get all the wallets history instead of latest 10 000 transactions and get to use the "exchange" tag API to immediately get to see if a wallet is tagged as an exchange wallet instead of manually hardcoding known exchange wallets.

Add more wallet classification types (Hodler, NFT collector, Active Trader, Degen)

Support more chains(Base, Tron, Sui, Bsc etc...)


# Status

Polish/testing/deployment

# Project Structure

src/
├── App.jsx                     # Main app orchestrator
├── main.jsx                    # Entry point
├── index.css                   # Tailwind import
├── components/
│   ├── index.js                # Barrel export
│   ├── ClassificationBadge.jsx # Wallet type badge
│   ├── ChainSelector.jsx       # ETH/SOL toggle
│   ├── WalletHeader.jsx        # Address display
│   ├── WalletMetrics.jsx       # Stats grid
│   ├── ConnectedWallets.jsx    # Top counterparties
│   └── RiskIndicators.jsx      # Mixer detection
├── services/
│   ├── wallet.js               # Data fetching orchestrator
│   ├── etherscan.js            # Ethereum API calls
│   ├── solana.js               # Solana/Helius API calls
│   ├── classifier.js           # Wallet classification logic
│   ├── connections.js          # Connected wallets analysis
│   └── metrics.js              # Wallet metrics calculation
├── data/
│   ├── exchanges.json          # Known ETH exchange addresses
│   ├── mixers.json             # Known ETH mixer addresses
│   ├── solana-exchanges.json   # Known SOL exchange addresses
│   └── solana-mixers.json      # SOL mixers (empty - limitation)
└── utils/
    └── validation.js           # Address validation



# License 

MIT

