/**
 * Gaga Finance - Full Simulation Controller
 * Orchestrates mint → list → buy → auction flows with randomized participants
 * 
 * Usage: npm run simulate -- --wallets=25
 */

import * as fs from 'fs';
import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    contractPrincipalCV,
    principalCV,
    uintCV,
} from '@stacks/transactions';
import {
    NETWORK,
    DEPLOYER_ADDRESS,
    CONTRACTS,
    TX_CONFIG,
    RATE_LIMIT,
    FILES,
    PRICE_RANGE,
    AUCTION_CONFIG,
    sleep,
    formatSTX,
    randomBigInt,
    getContractId,
} from './config.js';

// ============================================
// TYPES
// ============================================

interface WalletInfo {
    index: number;
    address: string;
    privateKey: string;
}

interface WalletFile {
    wallets: WalletInfo[];
}

interface SimulationMetrics {
    totalMints: number;
    successfulMints: number;
    totalListings: number;
    successfulListings: number;
    totalSales: number;
    successfulSales: number;
    totalAuctions: number;
    successfulAuctions: number;
    totalBids: number;
    successfulBids: number;
    totalSTXVolume: bigint;
    protocolFeesEarned: bigint;
    startTime: Date;
    endTime?: Date;
}

interface SimulationConfig {
    walletCount: number;
    mintsPerWallet: number;
    listingsPerWallet: number;
    auctionsToCreate: number;
    bidsPerAuction: number;
    dryRun: boolean;
}

// ============================================
// HELPERS
// ============================================

function loadWallets(count?: number): WalletInfo[] {
    if (!fs.existsSync(FILES.WALLETS)) {
        throw new Error(`Wallet file not found: ${FILES.WALLETS}. Run wallet-generator first.`);
    }

    const data = JSON.parse(fs.readFileSync(FILES.WALLETS, 'utf-8')) as WalletFile;
    const wallets = data.wallets;

    if (count && count < wallets.length) {
        return wallets.slice(0, count);
    }

    return wallets;
}

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomElementExcluding<T>(array: T[], exclude: T): T {
    const filtered = array.filter(item => item !== exclude);
    return getRandomElement(filtered);
}

// ============================================
// TRANSACTION FUNCTIONS
// ============================================

async function mintNFT(
    privateKey: string,
    recipient: string,
    nonce: bigint,
    dryRun: boolean
): Promise<{ txId: string }> {
    if (dryRun) {
        return { txId: `DRY_RUN_MINT_${Date.now()}` };
    }

    const txOptions = {
        contractAddress: DEPLOYER_ADDRESS,
        contractName: CONTRACTS.NFT,
        functionName: 'mint',
        functionArgs: [principalCV(recipient)],
        senderKey: privateKey,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: TX_CONFIG.MAX_FEE,
        nonce,
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction(transaction, NETWORK);

    if ('error' in result) {
        throw new Error(result.error);
    }

    return { txId: result.txid };
}

async function createListing(
    privateKey: string,
    tokenId: number,
    price: bigint,
    nonce: bigint,
    dryRun: boolean
): Promise<{ txId: string }> {
    if (dryRun) {
        return { txId: `DRY_RUN_LIST_${Date.now()}` };
    }

    const nftContractPrincipal = contractPrincipalCV(DEPLOYER_ADDRESS, CONTRACTS.NFT);

    const txOptions = {
        contractAddress: DEPLOYER_ADDRESS,
        contractName: CONTRACTS.MARKETPLACE_CORE,
        functionName: 'create-listing',
        functionArgs: [
            nftContractPrincipal,
            uintCV(tokenId),
            uintCV(price),
        ],
        senderKey: privateKey,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: TX_CONFIG.MAX_FEE,
        nonce,
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction(transaction, NETWORK);

    if ('error' in result) {
        throw new Error(result.error);
    }

    return { txId: result.txid };
}

async function buyListing(
    privateKey: string,
    listingId: number,
    nonce: bigint,
    dryRun: boolean
): Promise<{ txId: string }> {
    if (dryRun) {
        return { txId: `DRY_RUN_BUY_${Date.now()}` };
    }

    const nftContractPrincipal = contractPrincipalCV(DEPLOYER_ADDRESS, CONTRACTS.NFT);

    const txOptions = {
        contractAddress: DEPLOYER_ADDRESS,
        contractName: CONTRACTS.MARKETPLACE_CORE,
        functionName: 'buy-listing',
        functionArgs: [
            uintCV(listingId),
            nftContractPrincipal,
        ],
        senderKey: privateKey,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: TX_CONFIG.MAX_FEE,
        nonce,
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction(transaction, NETWORK);

    if ('error' in result) {
        throw new Error(result.error);
    }

    return { txId: result.txid };
}

async function createAuction(
    privateKey: string,
    tokenId: number,
    startPrice: bigint,
    reservePrice: bigint,
    durationBlocks: number,
    nonce: bigint,
    dryRun: boolean
): Promise<{ txId: string }> {
    if (dryRun) {
        return { txId: `DRY_RUN_AUCTION_${Date.now()}` };
    }

    const nftContractPrincipal = contractPrincipalCV(DEPLOYER_ADDRESS, CONTRACTS.NFT);

    const txOptions = {
        contractAddress: DEPLOYER_ADDRESS,
        contractName: CONTRACTS.AUCTION,
        functionName: 'create-auction',
        functionArgs: [
            nftContractPrincipal,
            uintCV(tokenId),
            uintCV(startPrice),
            uintCV(reservePrice),
            uintCV(durationBlocks),
        ],
        senderKey: privateKey,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: TX_CONFIG.MAX_FEE,
        nonce,
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction(transaction, NETWORK);

    if ('error' in result) {
        throw new Error(result.error);
    }

    return { txId: result.txid };
}

async function placeBid(
    privateKey: string,
    auctionId: number,
    bidAmount: bigint,
    nonce: bigint,
    dryRun: boolean
): Promise<{ txId: string }> {
    if (dryRun) {
        return { txId: `DRY_RUN_BID_${Date.now()}` };
    }

    const txOptions = {
        contractAddress: DEPLOYER_ADDRESS,
        contractName: CONTRACTS.AUCTION,
        functionName: 'place-bid',
        functionArgs: [
            uintCV(auctionId),
            uintCV(bidAmount),
        ],
        senderKey: privateKey,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: TX_CONFIG.MAX_FEE,
        nonce,
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction(transaction, NETWORK);

    if ('error' in result) {
        throw new Error(result.error);
    }

    return { txId: result.txid };
}

// ============================================
// SIMULATION PHASES
// ============================================

async function runMintPhase(
    wallets: WalletInfo[],
    config: SimulationConfig,
    metrics: SimulationMetrics
): Promise<number[]> {
    console.log('\n' + '═'.repeat(60));
    console.log('📦 PHASE 1: MINTING NFTs');
    console.log('═'.repeat(60));

    const tokenIds: number[] = [];
    let tokenId = 1;

    for (const wallet of wallets) {
        for (let m = 0; m < config.mintsPerWallet; m++) {
            metrics.totalMints++;

            try {
                const { txId } = await mintNFT(
                    wallet.privateKey,
                    wallet.address,
                    BigInt(m),
                    config.dryRun
                );

                metrics.successfulMints++;
                tokenIds.push(tokenId);
                console.log(`  ✅ Minted token #${tokenId} to ${wallet.address.slice(0, 10)}... TX: ${txId.slice(0, 16)}...`);

            } catch (error: any) {
                console.log(`  ❌ Mint failed for ${wallet.address.slice(0, 10)}...: ${error.message}`);
            }

            tokenId++;
            await sleep(RATE_LIMIT.TX_DELAY_MS);
        }
    }

    return tokenIds;
}

async function runListingPhase(
    wallets: WalletInfo[],
    tokenIds: number[],
    config: SimulationConfig,
    metrics: SimulationMetrics
): Promise<{ listingId: number; price: bigint; seller: WalletInfo }[]> {
    console.log('\n' + '═'.repeat(60));
    console.log('📋 PHASE 2: CREATING LISTINGS');
    console.log('═'.repeat(60));

    const listings: { listingId: number; price: bigint; seller: WalletInfo }[] = [];
    let listingId = 1;
    let tokenIndex = 0;

    const shuffledWallets = shuffleArray(wallets);

    for (const wallet of shuffledWallets) {
        if (tokenIndex >= tokenIds.length) break;

        for (let l = 0; l < config.listingsPerWallet && tokenIndex < tokenIds.length; l++) {
            metrics.totalListings++;

            const tokenId = tokenIds[tokenIndex];
            const price = randomBigInt(PRICE_RANGE.MIN_LISTING_PRICE, PRICE_RANGE.MAX_LISTING_PRICE);

            try {
                const { txId } = await createListing(
                    wallet.privateKey,
                    tokenId,
                    price,
                    BigInt(l),
                    config.dryRun
                );

                metrics.successfulListings++;
                listings.push({ listingId, price, seller: wallet });
                console.log(`  ✅ Listed token #${tokenId} for ${formatSTX(price)} TX: ${txId.slice(0, 16)}...`);

                listingId++;

            } catch (error: any) {
                console.log(`  ❌ Listing failed for token #${tokenId}: ${error.message}`);
            }

            tokenIndex++;
            await sleep(RATE_LIMIT.TX_DELAY_MS);
        }
    }

    return listings;
}

async function runBuyingPhase(
    wallets: WalletInfo[],
    listings: { listingId: number; price: bigint; seller: WalletInfo }[],
    config: SimulationConfig,
    metrics: SimulationMetrics
): Promise<void> {
    console.log('\n' + '═'.repeat(60));
    console.log('💰 PHASE 3: BUYING LISTINGS');
    console.log('═'.repeat(60));

    const shuffledListings = shuffleArray(listings);
    const numToBuy = Math.floor(shuffledListings.length * 0.6); // Buy 60% of listings

    for (let i = 0; i < numToBuy; i++) {
        const listing = shuffledListings[i];
        const buyer = getRandomElementExcluding(wallets, listing.seller);

        metrics.totalSales++;

        try {
            const { txId } = await buyListing(
                buyer.privateKey,
                listing.listingId,
                BigInt(0),
                config.dryRun
            );

            metrics.successfulSales++;
            metrics.totalSTXVolume += listing.price;
            metrics.protocolFeesEarned += listing.price * 250n / 10000n; // 2.5% fee

            console.log(`  ✅ ${buyer.address.slice(0, 10)}... bought listing #${listing.listingId} for ${formatSTX(listing.price)}`);

        } catch (error: any) {
            console.log(`  ❌ Buy failed for listing #${listing.listingId}: ${error.message}`);
        }

        await sleep(RATE_LIMIT.TX_DELAY_MS);
    }
}

async function runAuctionPhase(
    wallets: WalletInfo[],
    remainingTokenIds: number[],
    config: SimulationConfig,
    metrics: SimulationMetrics
): Promise<void> {
    console.log('\n' + '═'.repeat(60));
    console.log('🔨 PHASE 4: AUCTIONS');
    console.log('═'.repeat(60));

    const numAuctions = Math.min(config.auctionsToCreate, remainingTokenIds.length, wallets.length);
    let auctionId = 1;

    for (let a = 0; a < numAuctions; a++) {
        const seller = wallets[a];
        const tokenId = remainingTokenIds[a];
        const startPrice = randomBigInt(PRICE_RANGE.MIN_AUCTION_START, PRICE_RANGE.MAX_AUCTION_START);
        const reservePrice = startPrice + startPrice / 2n;

        metrics.totalAuctions++;

        console.log(`\n  🎯 Auction #${auctionId}: Token #${tokenId}`);

        try {
            // Create auction
            const { txId } = await createAuction(
                seller.privateKey,
                tokenId,
                startPrice,
                reservePrice,
                AUCTION_CONFIG.DEFAULT_DURATION,
                BigInt(0),
                config.dryRun
            );

            metrics.successfulAuctions++;
            console.log(`     Created by ${seller.address.slice(0, 10)}... TX: ${txId.slice(0, 16)}...`);

            await sleep(RATE_LIMIT.TX_DELAY_MS);

            // Place bids
            let currentBid = startPrice;
            const bidders = shuffleArray(wallets.filter(w => w !== seller)).slice(0, config.bidsPerAuction);

            for (const bidder of bidders) {
                currentBid = currentBid + currentBid / 10n; // 10% increment
                metrics.totalBids++;

                try {
                    const { bidTxId } = await placeBid(
                        bidder.privateKey,
                        auctionId,
                        currentBid,
                        BigInt(0),
                        config.dryRun
                    ) as any;

                    metrics.successfulBids++;
                    console.log(`     💵 Bid: ${formatSTX(currentBid)} by ${bidder.address.slice(0, 10)}...`);

                } catch (error: any) {
                    console.log(`     ❌ Bid failed: ${error.message}`);
                }

                await sleep(RATE_LIMIT.TX_DELAY_MS);
            }

            // Track potential volume (auction not settled yet in demo)
            metrics.totalSTXVolume += currentBid;
            metrics.protocolFeesEarned += currentBid * 250n / 10000n;

        } catch (error: any) {
            console.log(`     ❌ Auction creation failed: ${error.message}`);
        }

        auctionId++;
    }
}

// ============================================
// MAIN
// ============================================

async function main() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║         GAGA FINANCE - FULL SIMULATION CONTROLLER            ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  Running complete marketplace simulation on Stacks MAINNET   ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');

    // Parse arguments
    const args = process.argv.slice(2);
    const config: SimulationConfig = {
        walletCount: 10,
        mintsPerWallet: 2,
        listingsPerWallet: 1,
        auctionsToCreate: 2,
        bidsPerAuction: 3,
        dryRun: false,
    };

    for (const arg of args) {
        if (arg.startsWith('--wallets=')) {
            config.walletCount = parseInt(arg.split('=')[1], 10) || 10;
        }
        if (arg.startsWith('--mints=')) {
            config.mintsPerWallet = parseInt(arg.split('=')[1], 10) || 2;
        }
        if (arg.startsWith('--dry-run')) {
            config.dryRun = true;
        }
    }

    console.log('\n📋 Configuration:');
    console.log(`   Wallets: ${config.walletCount}`);
    console.log(`   Mints per wallet: ${config.mintsPerWallet}`);
    console.log(`   Listings per wallet: ${config.listingsPerWallet}`);
    console.log(`   Auctions: ${config.auctionsToCreate}`);
    console.log(`   Bids per auction: ${config.bidsPerAuction}`);
    console.log(`   Dry run: ${config.dryRun}`);

    if (config.dryRun) {
        console.log('\n⚠️  DRY RUN MODE - No actual transactions will be broadcast\n');
    }

    // Initialize metrics
    const metrics: SimulationMetrics = {
        totalMints: 0,
        successfulMints: 0,
        totalListings: 0,
        successfulListings: 0,
        totalSales: 0,
        successfulSales: 0,
        totalAuctions: 0,
        successfulAuctions: 0,
        totalBids: 0,
        successfulBids: 0,
        totalSTXVolume: 0n,
        protocolFeesEarned: 0n,
        startTime: new Date(),
    };

    // Load wallets
    const wallets = loadWallets(config.walletCount);
    console.log(`\n📁 Loaded ${wallets.length} wallets`);

    // Run simulation phases
    const tokenIds = await runMintPhase(wallets, config, metrics);

    if (tokenIds.length > 0) {
        const listings = await runListingPhase(wallets, tokenIds, config, metrics);

        if (listings.length > 0) {
            await runBuyingPhase(wallets, listings, config, metrics);
        }

        // Use some tokens for auctions (tokens not listed)
        const auctionTokens = tokenIds.slice(Math.floor(tokenIds.length * 0.7));
        if (auctionTokens.length > 0) {
            await runAuctionPhase(wallets, auctionTokens, config, metrics);
        }
    }

    metrics.endTime = new Date();

    // Print final summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 SIMULATION COMPLETE - FINAL METRICS');
    console.log('═'.repeat(60));
    console.log(`\n  ⏱️  Duration: ${((metrics.endTime.getTime() - metrics.startTime.getTime()) / 1000).toFixed(1)}s`);
    console.log(`\n  📦 Minting:`);
    console.log(`     Total: ${metrics.totalMints} | Success: ${metrics.successfulMints}`);
    console.log(`\n  📋 Listings:`);
    console.log(`     Total: ${metrics.totalListings} | Success: ${metrics.successfulListings}`);
    console.log(`\n  💰 Sales:`);
    console.log(`     Total: ${metrics.totalSales} | Success: ${metrics.successfulSales}`);
    console.log(`\n  🔨 Auctions:`);
    console.log(`     Total: ${metrics.totalAuctions} | Success: ${metrics.successfulAuctions}`);
    console.log(`\n  💵 Bids:`);
    console.log(`     Total: ${metrics.totalBids} | Success: ${metrics.successfulBids}`);
    console.log(`\n  📈 Volume:`);
    console.log(`     Total STX Volume: ${formatSTX(metrics.totalSTXVolume)}`);
    console.log(`     Protocol Fees Earned: ${formatSTX(metrics.protocolFeesEarned)}`);
    console.log('\n' + '═'.repeat(60));

    // Save metrics
    const metricsFile = 'simulation-metrics.json';
    const metricsOutput = {
        ...metrics,
        totalSTXVolume: metrics.totalSTXVolume.toString(),
        protocolFeesEarned: metrics.protocolFeesEarned.toString(),
        startTime: metrics.startTime.toISOString(),
        endTime: metrics.endTime.toISOString(),
    };
    fs.writeFileSync(metricsFile, JSON.stringify(metricsOutput, null, 2));
    console.log(`\n📁 Metrics saved to: ${metricsFile}\n`);
}

main().catch(console.error);
