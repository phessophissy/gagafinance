/**
 * Gaga Finance - Config
 * Shared configuration for all scripts
 */

import { StacksMainnet } from '@stacks/network';

// Network configuration
export const NETWORK = new StacksMainnet();

// Contract deployment address (update after deployment)
export const DEPLOYER_ADDRESS = 'SP2KYZRNME33Y39GP3RKC90DQJ45EF1N0NZNVRE09';

// Contract names
export const CONTRACTS = {
    NFT: 'nft',
    ESCROW: 'escrow',
    ROYALTY_ENGINE: 'royalty-engine',
    AUCTION: 'auction',
    MARKETPLACE_CORE: 'marketplace-core',
} as const;

// Full contract identifiers
export function getContractId(contractName: string): string {
    return `${DEPLOYER_ADDRESS}.${contractName}`;
}

// Transaction configuration
export const TX_CONFIG = {
    // Maximum fee in microSTX (0.001 STX = 1000 microSTX)
    MAX_FEE: 1000n,

    // Anchor mode
    ANCHOR_MODE: 3, // any

    // Post conditions mode
    POST_CONDITION_MODE: 1, // allow
};

// Rate limiting for mainnet safety
export const RATE_LIMIT = {
    // Delay between transactions in ms
    TX_DELAY_MS: 1000,

    // Maximum transactions per minute
    MAX_TX_PER_MINUTE: 30,

    // Batch size for operations
    BATCH_SIZE: 10,
};

// File paths
export const FILES = {
    WALLETS: 'wallets.json',
    LISTINGS: 'listings.json',
    AUCTIONS: 'auctions.json',
    TX_HISTORY: 'tx-history.json',
};

// Price ranges for simulation (in microSTX)
export const PRICE_RANGE = {
    MIN_LISTING_PRICE: 100000n,    // 0.1 STX
    MAX_LISTING_PRICE: 10000000n,  // 10 STX
    MIN_AUCTION_START: 50000n,     // 0.05 STX
    MAX_AUCTION_START: 5000000n,   // 5 STX
};

// Auction configuration
export const AUCTION_CONFIG = {
    MIN_DURATION_BLOCKS: 144,      // ~1 day
    MAX_DURATION_BLOCKS: 1008,     // ~7 days
    DEFAULT_DURATION: 288,         // ~2 days
};


