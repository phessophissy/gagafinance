/**
 * Gaga Finance - Mainnet Interaction Script
 * Run: npx ts-node scripts/interact.ts
 */

import * as fs from 'fs';
import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    principalCV,
    contractPrincipalCV,
    uintCV,
    SignedContractCallOptions,
} from '@stacks/transactions';
import {
    NETWORK,
    DEPLOYER_ADDRESS,
    CONTRACTS,
    MAX_FEE
} from './config.js';
import { sleep, formatSTX } from './utils/helpers.js';
import { logger } from './utils/logger.js';

// ============================================
// LOAD WALLETS
// ============================================

interface Wallet {
    index: number;
    mnemonic: string;
    privateKey: string;
    address: string;
}

function loadWallets(): Wallet[] {
    if (!fs.existsSync('wallets.json')) {
        logger.error('❌ wallets.json not found. Run: npx ts-node scripts/quick-wallets.ts first');
        process.exit(1);
    }
    const data = JSON.parse(fs.readFileSync('wallets.json', 'utf-8'));
    return data.wallets;
}

// ============================================
// NONCE MANAGEMENT
// ============================================

async function getNonce(address: string): Promise<bigint> {
    try {
        const response = await fetch(`https://api.mainnet.hiro.so/extended/v1/address/${address}/nonces`);
        const data = await response.json();
        return BigInt(data.possible_next_nonce || 0);
    } catch (error) {
        logger.warn(`   ⚠️ Could not fetch nonce, using 0`);
        return BigInt(0);
    }
}

// ============================================
// TRANSACTION FUNCTIONS
// ============================================

async function mintNFT(senderKey: string, recipient: string, nonce: bigint): Promise<string> {
    logger.info(`   📦 Minting NFT to ${recipient.slice(0, 10)}...`);

    const txOptions: SignedContractCallOptions = {
        contractAddress: DEPLOYER_ADDRESS,
        contractName: CONTRACTS.NFT,
        functionName: 'mint',
        functionArgs: [principalCV(recipient)],
        senderKey: senderKey,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: MAX_FEE,
        nonce: nonce,
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction(transaction, NETWORK);

    if (result.error) {
        throw new Error(result.error);
    }

    return result.txid;
}

async function createListing(senderKey: string, tokenId: number, price: bigint, nonce: bigint): Promise<string> {
    logger.info(`   📋 Creating listing for token #${tokenId}...`);

    const txOptions: SignedContractCallOptions = {
        contractAddress: DEPLOYER_ADDRESS,
        contractName: CONTRACTS.MARKETPLACE_CORE,
        functionName: 'create-listing',
        functionArgs: [
            contractPrincipalCV(DEPLOYER_ADDRESS, CONTRACTS.NFT),
            uintCV(tokenId),
            uintCV(price),
        ],
        senderKey: senderKey,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: MAX_FEE,
        nonce: nonce,
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction(transaction, NETWORK);

    if (result.error) {
        throw new Error(result.error);
    }

    return result.txid;
}

async function createAuction(
    senderKey: string,
    tokenId: number,
    startPrice: bigint,
    reservePrice: bigint,
    duration: number,
    nonce: bigint
): Promise<string> {
    logger.info(`   🔨 Creating auction for token #${tokenId}...`);

    const txOptions: SignedContractCallOptions = {
        contractAddress: DEPLOYER_ADDRESS,
        contractName: CONTRACTS.AUCTION,
        functionName: 'create-auction',
        functionArgs: [
            contractPrincipalCV(DEPLOYER_ADDRESS, CONTRACTS.NFT),
            uintCV(tokenId),
            uintCV(startPrice),
            uintCV(reservePrice),
            uintCV(duration),
        ],
        senderKey: senderKey,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: MAX_FEE,
        nonce: nonce,
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction(transaction, NETWORK);

    if (result.error) {
        throw new Error(result.error);
    }

    return result.txid;
}

// ============================================
// MAIN
// ============================================

async function main() {
    logger.info('\n╔══════════════════════════════════════════════════════════╗');
    logger.info('║      GAGA FINANCE - MAINNET INTERACTION SCRIPT           ║');
    logger.info('╠══════════════════════════════════════════════════════════╣');
    logger.info('║  Running NFT minting and marketplace interactions        ║');
    logger.info('╚══════════════════════════════════════════════════════════╝\n');

    const wallets = loadWallets();
    logger.info(`📁 Loaded ${wallets.length} wallets\n`);

    const metrics = {
        mints: { attempted: 0, success: 0, txIds: [] as string[] },
        listings: { attempted: 0, success: 0, txIds: [] as string[] },
        auctions: { attempted: 0, success: 0, txIds: [] as string[] },
    };

    // =========== PHASE 1: MINTING ===========
    logger.info('═'.repeat(50));
    logger.info('📦 PHASE 1: MINTING NFTs');
    logger.info('═'.repeat(50));

    for (let i = 0; i < wallets.length; i++) {
        const wallet = wallets[i];
        metrics.mints.attempted++;

        logger.info(`\n🔹 Wallet ${i + 1}/${wallets.length} (${wallet.address})`);

        try {
            // Fetch nonce for this specific wallet (the sender), not the deployer
            const nonce = await getNonce(wallet.address);
            const txId = await mintNFT(wallet.privateKey, wallet.address, nonce);
            metrics.mints.success++;
            metrics.mints.txIds.push(txId);
            logger.success(`   ✅ TX: ${txId}`);
        } catch (error: any) {
            logger.error(`   ❌ Failed: ${error.message.substring(0, 100)}...`);
        }

        await sleep(1500); // Rate limiting
    }

    // =========== PHASE 2: LISTINGS ===========
    logger.info('\n' + '═'.repeat(50));
    logger.info('📋 PHASE 2: CREATING LISTINGS');
    logger.info('═'.repeat(50));

    for (let i = 0; i < Math.min(3, wallets.length); i++) {
        const wallet = wallets[i];
        const tokenId = i + 1;
        const price = BigInt(100000 + Math.floor(Math.random() * 400000)); // 0.1 - 0.5 STX
        metrics.listings.attempted++;

        logger.info(`\n🔹 Listing token #${tokenId} for ${formatSTX(price)}`);

        try {
            const nonce = await getNonce(wallet.address);
            const txId = await createListing(wallet.privateKey, tokenId, price, nonce);
            metrics.listings.success++;
            metrics.listings.txIds.push(txId);
            logger.success(`   ✅ TX: ${txId}`);
        } catch (error: any) {
            logger.error(`   ❌ Failed: ${error.message.substring(0, 100)}...`);
        }

        await sleep(1500);
    }

    // =========== PHASE 3: AUCTIONS ===========
    logger.info('\n' + '═'.repeat(50));
    logger.info('🔨 PHASE 3: CREATING AUCTIONS');
    logger.info('═'.repeat(50));

    for (let i = 0; i < Math.min(2, wallets.length); i++) {
        const wallet = wallets[wallets.length - 1 - i]; // Use last wallets
        const tokenId = wallets.length - i;
        const startPrice = BigInt(50000); // 0.05 STX
        const reservePrice = BigInt(100000); // 0.1 STX
        const duration = 144; // ~1 day
        metrics.auctions.attempted++;

        logger.info(`\n🔹 Auction for token #${tokenId}`);

        try {
            const nonce = await getNonce(wallet.address);
            const txId = await createAuction(wallet.privateKey, tokenId, startPrice, reservePrice, duration, nonce);
            metrics.auctions.success++;
            metrics.auctions.txIds.push(txId);
            logger.success(`   ✅ TX: ${txId}`);
        } catch (error: any) {
            logger.error(`   ❌ Failed: ${error.message.substring(0, 100)}...`);
        }

        await sleep(1500);
    }

    // =========== SUMMARY ===========
    logger.info('\n' + '═'.repeat(50));
    logger.info('📊 FINAL SUMMARY');
    logger.info('═'.repeat(50));
    logger.info(`\n   📦 Mints:    ${metrics.mints.success}/${metrics.mints.attempted} successful`);
    logger.info(`   📋 Listings: ${metrics.listings.success}/${metrics.listings.attempted} successful`);
    logger.info(`   🔨 Auctions: ${metrics.auctions.success}/${metrics.auctions.attempted} successful`);

    logger.info('\n📍 Contract Addresses:');
    logger.info(`   NFT:         ${DEPLOYER_ADDRESS}.${CONTRACTS.NFT}`);
    logger.info(`   Marketplace: ${DEPLOYER_ADDRESS}.${CONTRACTS.MARKETPLACE_CORE}`);
    logger.info(`   Auction:     ${DEPLOYER_ADDRESS}.${CONTRACTS.AUCTION}`);
    logger.info(`   Escrow:      ${DEPLOYER_ADDRESS}.${CONTRACTS.ESCROW}`);
    logger.info(`   Royalties:   ${DEPLOYER_ADDRESS}.${CONTRACTS.ROYALTY_ENGINE}`);

    // Save results
    const results = {
        timestamp: new Date().toISOString(),
        metrics,
        contracts: {
            nft: `${DEPLOYER_ADDRESS}.${CONTRACTS.NFT}`,
            marketplace: `${DEPLOYER_ADDRESS}.${CONTRACTS.MARKETPLACE_CORE}`,
            auction: `${DEPLOYER_ADDRESS}.${CONTRACTS.AUCTION}`,
            escrow: `${DEPLOYER_ADDRESS}.${CONTRACTS.ESCROW}`,
            royalty: `${DEPLOYER_ADDRESS}.${CONTRACTS.ROYALTY_ENGINE}`,
        }
    };

    fs.writeFileSync('interaction-results.json', JSON.stringify(results, null, 2));
    logger.success('\n✅ Results saved to interaction-results.json\n');
}

main().catch(logger.error);
