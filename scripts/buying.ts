/**
 * Gaga Finance - Buying Script
 * Buys listed NFTs from the marketplace
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
    getContractId,
} from './config.js';
import {
    sleep,
    formatSTX,
} from './utils/helpers.js';

interface WalletInfo {
    index: number;
    address: string;
    privateKey: string;
}

interface WalletFile {
    wallets: WalletInfo[];
}

interface ListingInfo {
    wallet: string;
    tokenId: number;
    price: string;
    listingId: number | null;
    success: boolean;
}

interface BuyResult {
    buyer: string;
    listingId: number;
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
 * Load listings from file
 */
function loadListings(): ListingInfo[] {
    if (!fs.existsSync(FILES.LISTINGS)) {
        throw new Error(`Listings file not found: ${FILES.LISTINGS}. Run listing script first.`);
    }

    const data = JSON.parse(fs.readFileSync(FILES.LISTINGS, 'utf-8')) as ListingInfo[];
    return data.filter(l => l.success);
}

/**
 * Buy a listing
 */
async function buyListing(
    privateKey: string,
    listingId: number,
    nonce: bigint
): Promise<{ txId: string }> {
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

/**
 * Main function
 */
async function main() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║           GAGA FINANCE - BUYING SCRIPT                       ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  Buying NFTs from marketplace on Stacks MAINNET              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    // Load wallets and listings
    const wallets = loadWallets();
    const listings = loadListings();

    console.log(`📁 Loaded ${wallets.length} wallets`);
    console.log(`📋 Loaded ${listings.length} active listings\n`);

    if (listings.length === 0) {
        console.log('❌ No listings available to buy. Run listing script first.\n');
        return;
    }

    console.log(`📝 Marketplace: ${getContractId(CONTRACTS.MARKETPLACE_CORE)}\n`);

    const results: BuyResult[] = [];
    let successCount = 0;
    let failCount = 0;

    // Each wallet tries to buy one listing (excluding their own)
    for (let i = 0; i < Math.min(wallets.length, listings.length); i++) {
        const wallet = wallets[i];

        // Find a listing not owned by this wallet
        const listing = listings.find(l => l.wallet !== wallet.address);

        if (!listing || listing.listingId === null) {
            console.log(`⏭️  Skipping wallet ${i + 1}: No suitable listing found`);
            continue;
        }

        console.log(`⏳ Wallet ${i + 1} buying listing ${listing.listingId}...`);
        console.log(`   Price: ${listing.price}`);

        try {
            const nonce = BigInt(0);

            const { txId } = await buyListing(wallet.privateKey, listing.listingId, nonce);

            results.push({
                buyer: wallet.address,
                listingId: listing.listingId,
                txId,
                success: true,
            });

            successCount++;
            console.log(`  ✅ TX: ${txId}`);

        } catch (error: any) {
            results.push({
                buyer: wallet.address,
                listingId: listing.listingId,
                txId: null,
                success: false,
                error: error.message,
            });

            failCount++;
            console.log(`  ❌ Error: ${error.message}`);
        }

        // Rate limiting
        await sleep(RATE_LIMIT.TX_DELAY_MS);
    }

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 BUYING SUMMARY');
    console.log('═'.repeat(60));
    console.log(`  Total Attempts: ${results.length}`);
    console.log(`  ✅ Successful:  ${successCount}`);
    console.log(`  ❌ Failed:      ${failCount}`);
    console.log('═'.repeat(60));

    // Save results
    const outputFile = 'buy-results.json';
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`\n📁 Results saved to: ${outputFile}\n`);
}

main().catch(console.error);
