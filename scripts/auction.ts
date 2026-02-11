/**
 * Gaga Finance - Auction Script
 * Creates auctions, places bids, and finalizes auctions
 */

import * as fs from 'fs';
import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    contractPrincipalCV,
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
    getContractId,
} from './config.js';
import {
    sleep,
    formatSTX,
    randomBigInt,
} from './utils/helpers.js';

interface WalletInfo {
    index: number;
    address: string;
    privateKey: string;
}

interface WalletFile {
    wallets: WalletInfo[];
}

interface AuctionResult {
    action: 'create' | 'bid' | 'settle';
    wallet: string;
    auctionId: number | null;
    tokenId?: number;
    bidAmount?: string;
    txId: string | null;
    success: boolean;
    error?: string;
}

/**
 * Load wallets from file
 */
function loadWallets(): WalletInfo[] {
    if (!fs.existsSync(FILES.WALLETS)) {
        throw new Error(`Wallet file not found: ${FILES.WALLETS}. Run wallet-generator first.`);
    }

    const data = JSON.parse(fs.readFileSync(FILES.WALLETS, 'utf-8')) as WalletFile;
    return data.wallets;
}

/**
 * Create an auction
 */
async function createAuction(
    privateKey: string,
    tokenId: number,
    startPrice: bigint,
    reservePrice: bigint,
    durationBlocks: number,
    nonce: bigint
): Promise<{ txId: string }> {
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

/**
 * Place a bid on an auction
 */
async function placeBid(
    privateKey: string,
    auctionId: number,
    bidAmount: bigint,
    nonce: bigint
): Promise<{ txId: string }> {
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

/**
 * Settle (finalize) an auction
 */
async function settleAuction(
    privateKey: string,
    auctionId: number,
    nonce: bigint
): Promise<{ txId: string }> {
    const txOptions = {
        contractAddress: DEPLOYER_ADDRESS,
        contractName: CONTRACTS.AUCTION,
        functionName: 'settle-auction',
        functionArgs: [
            uintCV(auctionId),
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

/**
 * Main function
 */
async function main() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║           GAGA FINANCE - AUCTION SCRIPT                      ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  Creating auctions and placing bids on Stacks MAINNET        ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    // Load wallets
    const wallets = loadWallets();
    console.log(`📁 Loaded ${wallets.length} wallets\n`);

    if (wallets.length < 3) {
        console.log('❌ Need at least 3 wallets for auction demo\n');
        return;
    }

    // Parse arguments
    const args = process.argv.slice(2);
    let mode: 'create' | 'bid' | 'settle' | 'full' = 'full';
    let auctionId = 1;
    let tokenId = 1;

    for (const arg of args) {
        if (arg.startsWith('--mode=')) {
            mode = arg.split('=')[1] as any;
        }
        if (arg.startsWith('--auction-id=')) {
            auctionId = parseInt(arg.split('=')[1], 10) || 1;
        }
        if (arg.startsWith('--token-id=')) {
            tokenId = parseInt(arg.split('=')[1], 10) || 1;
        }
    }

    console.log(`📝 Auction Contract: ${getContractId(CONTRACTS.AUCTION)}\n`);
    console.log(`🎯 Mode: ${mode}\n`);

    const results: AuctionResult[] = [];
    let successCount = 0;
    let failCount = 0;

    if (mode === 'create' || mode === 'full') {
        // Create auction with first wallet
        const seller = wallets[0];
        const startPrice = randomBigInt(PRICE_RANGE.MIN_AUCTION_START, PRICE_RANGE.MAX_AUCTION_START);
        const reservePrice = startPrice + startPrice / 2n; // 50% higher

        console.log('📦 CREATING AUCTION');
        console.log(`   Seller: ${seller.address}`);
        console.log(`   Token ID: ${tokenId}`);
        console.log(`   Start Price: ${formatSTX(startPrice)}`);
        console.log(`   Reserve: ${formatSTX(reservePrice)}`);
        console.log(`   Duration: ${AUCTION_CONFIG.DEFAULT_DURATION} blocks\n`);

        try {
            const { txId } = await createAuction(
                seller.privateKey,
                tokenId,
                startPrice,
                reservePrice,
                AUCTION_CONFIG.DEFAULT_DURATION,
                BigInt(0)
            );

            results.push({
                action: 'create',
                wallet: seller.address,
                auctionId: null,
                tokenId,
                txId,
                success: true,
            });

            successCount++;
            console.log(`  ✅ Auction created! TX: ${txId}\n`);

        } catch (error: any) {
            results.push({
                action: 'create',
                wallet: seller.address,
                auctionId: null,
                tokenId,
                txId: null,
                success: false,
                error: error.message,
            });

            failCount++;
            console.log(`  ❌ Error: ${error.message}\n`);
        }

        await sleep(RATE_LIMIT.TX_DELAY_MS);
    }

    if (mode === 'bid' || mode === 'full') {
        // Place bids from other wallets
        console.log('💰 PLACING BIDS');

        let currentBid = randomBigInt(PRICE_RANGE.MIN_AUCTION_START, PRICE_RANGE.MAX_AUCTION_START);

        for (let i = 1; i < Math.min(wallets.length, 4); i++) {
            const bidder = wallets[i];
            currentBid = currentBid + currentBid / 10n; // 10% increment

            console.log(`   Bidder ${i}: ${bidder.address}`);
            console.log(`   Bid Amount: ${formatSTX(currentBid)}`);

            try {
                const { txId } = await placeBid(
                    bidder.privateKey,
                    auctionId,
                    currentBid,
                    BigInt(0)
                );

                results.push({
                    action: 'bid',
                    wallet: bidder.address,
                    auctionId,
                    bidAmount: formatSTX(currentBid),
                    txId,
                    success: true,
                });

                successCount++;
                console.log(`  ✅ Bid placed! TX: ${txId}\n`);

            } catch (error: any) {
                results.push({
                    action: 'bid',
                    wallet: bidder.address,
                    auctionId,
                    bidAmount: formatSTX(currentBid),
                    txId: null,
                    success: false,
                    error: error.message,
                });

                failCount++;
                console.log(`  ❌ Error: ${error.message}\n`);
            }

            await sleep(RATE_LIMIT.TX_DELAY_MS);
        }
    }

    if (mode === 'settle') {
        // Settle auction (anyone can call after end)
        console.log('🏁 SETTLING AUCTION');

        const settler = wallets[0];

        try {
            const { txId } = await settleAuction(
                settler.privateKey,
                auctionId,
                BigInt(0)
            );

            results.push({
                action: 'settle',
                wallet: settler.address,
                auctionId,
                txId,
                success: true,
            });

            successCount++;
            console.log(`  ✅ Auction settled! TX: ${txId}\n`);

        } catch (error: any) {
            results.push({
                action: 'settle',
                wallet: settler.address,
                auctionId,
                txId: null,
                success: false,
                error: error.message,
            });

            failCount++;
            console.log(`  ❌ Error: ${error.message}\n`);
        }
    }

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 AUCTION SUMMARY');
    console.log('═'.repeat(60));
    console.log(`  Total Attempts: ${results.length}`);
    console.log(`  ✅ Successful:  ${successCount}`);
    console.log(`  ❌ Failed:      ${failCount}`);
    console.log('═'.repeat(60));

    // Save results
    fs.writeFileSync(FILES.AUCTIONS, JSON.stringify(results, null, 2));
    console.log(`\n📁 Results saved to: ${FILES.AUCTIONS}\n`);
}

main().catch(console.error);
