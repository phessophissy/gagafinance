/**
 * Gaga Finance - Wallet Connection using @stacks/connect
 * 
 * This module provides wallet connection functionality using the official
 * @stacks/connect library for integration with Hiro Wallet and Leather Wallet.
 * 
 * For browser-based applications, this enables:
 * - Wallet authentication
 * - Transaction signing
 * - Contract interactions
 */

import {
    AppConfig,
    UserSession,
    showConnect,
    openContractCall,
} from '@stacks/connect';
import {
    AnchorMode,
    PostConditionMode,
    principalCV,
    contractPrincipalCV,
    uintCV,
} from '@stacks/transactions';
import {
    NETWORK,
    DEPLOYER_ADDRESS,
    CONTRACTS,
} from './config.js';
import { logger } from './utils/logger.js';

// App configuration for @stacks/connect
const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

// ============================================
// WALLET CONNECTION
// ============================================

/**
 * Check if user is signed in
 */
export function isUserSignedIn(): boolean {
    return userSession.isUserSignedIn();
}

/**
 * Get current user's Stacks address
 */
export function getUserAddress(): string | null {
    if (!userSession.isUserSignedIn()) {
        return null;
    }
    const userData = userSession.loadUserData();
    return userData.profile.stxAddress.mainnet;
}

/**
 * Connect to wallet using @stacks/connect
 * Opens Hiro Wallet or Leather Wallet popup for authentication
 */
export function connectWallet(onSuccess?: () => void): void {
    showConnect({
        appDetails: {
            name: 'Gaga Finance NFT Marketplace',
            icon: 'https://gagafinance.io/logo.png', // Update with actual logo
        },
        redirectTo: '/',
        onFinish: (data) => {
            logger.success('✅ Wallet connected successfully');
            const address = getUserAddress();
            logger.info('User address:', address);
            if (onSuccess) onSuccess();
        },
        onCancel: () => {
            logger.warn('❌ Wallet connection cancelled');
        },
        userSession,
    });
}

/**
 * Disconnect wallet
 */
export function disconnectWallet(): void {
    userSession.signUserOut('/');
}

// ============================================
// CONTRACT INTERACTIONS
// ============================================

/**
 * Mint an NFT to the connected wallet
 * Uses @stacks/connect to prompt user for transaction signing
 */
export function mintNFT(recipient: string, onFinish?: (txId: string) => void): void {
    openContractCall({
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        contractAddress: DEPLOYER_ADDRESS,
        contractName: CONTRACTS.NFT,
        functionName: 'mint',
        functionArgs: [principalCV(recipient)],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
            logger.success('✅ Mint transaction submitted:', data.txId);
            if (onFinish) onFinish(data.txId);
        },
        onCancel: () => {
            logger.warn('❌ Mint transaction cancelled');
        },
    });
}

/**
 * Create a marketplace listing
 */
export function createListing(
    tokenId: number,
    priceInMicroSTX: number,
    onFinish?: (txId: string) => void
): void {
    openContractCall({
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        contractAddress: DEPLOYER_ADDRESS,
        contractName: CONTRACTS.MARKETPLACE_CORE,
        functionName: 'create-listing',
        functionArgs: [
            contractPrincipalCV(DEPLOYER_ADDRESS, CONTRACTS.NFT),
            uintCV(tokenId),
            uintCV(priceInMicroSTX),
        ],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
            logger.success('✅ Listing created:', data.txId);
            if (onFinish) onFinish(data.txId);
        },
        onCancel: () => {
            logger.warn('❌ Listing cancelled');
        },
    });
}

/**
 * Buy a listing
 */
export function buyListing(
    listingId: number,
    onFinish?: (txId: string) => void
): void {
    openContractCall({
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        contractAddress: DEPLOYER_ADDRESS,
        contractName: CONTRACTS.MARKETPLACE_CORE,
        functionName: 'buy-listing',
        functionArgs: [
            uintCV(listingId),
            contractPrincipalCV(DEPLOYER_ADDRESS, CONTRACTS.NFT),
        ],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
            logger.success('✅ Purchase complete:', data.txId);
            if (onFinish) onFinish(data.txId);
        },
        onCancel: () => {
            logger.warn('❌ Purchase cancelled');
        },
    });
}

/**
 * Create an auction
 */
export function createAuction(
    tokenId: number,
    startPriceMicroSTX: number,
    reservePriceMicroSTX: number,
    durationBlocks: number,
    onFinish?: (txId: string) => void
): void {
    openContractCall({
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        contractAddress: DEPLOYER_ADDRESS,
        contractName: CONTRACTS.AUCTION,
        functionName: 'create-auction',
        functionArgs: [
            contractPrincipalCV(DEPLOYER_ADDRESS, CONTRACTS.NFT),
            uintCV(tokenId),
            uintCV(startPriceMicroSTX),
            uintCV(reservePriceMicroSTX),
            uintCV(durationBlocks),
        ],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
            logger.success('✅ Auction created:', data.txId);
            if (onFinish) onFinish(data.txId);
        },
        onCancel: () => {
            logger.warn('❌ Auction creation cancelled');
        },
    });
}

/**
 * Place a bid on an auction
 */
export function placeBid(
    auctionId: number,
    bidAmountMicroSTX: number,
    onFinish?: (txId: string) => void
): void {
    openContractCall({
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        contractAddress: DEPLOYER_ADDRESS,
        contractName: CONTRACTS.AUCTION,
        functionName: 'place-bid',
        functionArgs: [
            uintCV(auctionId),
            uintCV(bidAmountMicroSTX),
        ],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
            logger.success('✅ Bid placed:', data.txId);
            if (onFinish) onFinish(data.txId);
        },
        onCancel: () => {
            logger.warn('❌ Bid cancelled');
        },
    });
}

// ============================================
// EXPORTS
// ============================================

export {
    userSession,
    appConfig,
    DEPLOYER_ADDRESS,
    CONTRACTS,
    NETWORK,
};

// Usage example (for browser):
/*
import { connectWallet, mintNFT, getUserAddress } from './wallet-connect';

// Connect wallet button
document.getElementById('connect-btn').onclick = () => {
    connectWallet(() => {
        const address = getUserAddress();
        console.log('Connected:', address);
    });
};

// Mint NFT button
document.getElementById('mint-btn').onclick = () => {
    const address = getUserAddress();
    if (address) {
        mintNFT(address, (txId) => {
            console.log('Minted! TX:', txId);
        });
    }
};
*/
