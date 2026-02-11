/**
 * Gaga Finance - Listing Script
 * Creates fixed-price listings on the marketplace
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

interface ListingResult {
    wallet: string;
    tokenId: number;
    price: string;
    listingId: number | null;
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
 * Create a listing
 */
async function createListing(
    privateKey: string,
    tokenId: number,
    price: bigint,
    nonce: bigint
): Promise<{ txId: string }> {
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

/**
 * Main function
 */
async function main() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║           GAGA FINANCE - LISTING SCRIPT                      ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  Creating marketplace listings on Stacks MAINNET             ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    // Load wallets
    const wallets = loadWallets();
    console.log(`📁 Loaded ${wallets.length} wallets\n`);

    // Parse arguments
    const args = process.argv.slice(2);
    let listingsPerWallet = 1;
    let startTokenId = 1;

    for (const arg of args) {
        if (arg.startsWith('--count=')) {
            listingsPerWallet = parseInt(arg.split('=')[1], 10) || 1;
        }
        if (arg.startsWith('--start-token=')) {
            startTokenId = parseInt(arg.split('=')[1], 10) || 1;
        }
    }

    console.log(`📋 Creating ${listingsPerWallet} listing(s) per wallet...\n`);
    console.log(`📝 Marketplace: ${getContractId(CONTRACTS.MARKETPLACE_CORE)}\n`);

    const results: ListingResult[] = [];
    let successCount = 0;
    let failCount = 0;
    let tokenId = startTokenId;

    for (let i = 0; i < wallets.length; i++) {
        const wallet = wallets[i];

        for (let l = 0; l < listingsPerWallet; l++) {
            // Generate random price
            const price = randomBigInt(PRICE_RANGE.MIN_LISTING_PRICE, PRICE_RANGE.MAX_LISTING_PRICE);

            console.log(`⏳ Creating listing for wallet ${i + 1}/${wallets.length}...`);
            console.log(`   Token ID: ${tokenId}, Price: ${formatSTX(price)}`);

            try {
                const nonce = BigInt(l);

                const { txId } = await createListing(wallet.privateKey, tokenId, price, nonce);

                results.push({
                    wallet: wallet.address,
                    tokenId,
                    price: formatSTX(price),
                    listingId: null, // Will be known after confirmation
                    txId,
                    success: true,
                });

                successCount++;
                console.log(`  ✅ TX: ${txId}`);

            } catch (error: any) {
                results.push({
                    wallet: wallet.address,
                    tokenId,
                    price: formatSTX(price),
                    listingId: null,
                    txId: null,
                    success: false,
                    error: error.message,
                });

                failCount++;
                console.log(`  ❌ Error: ${error.message}`);
            }

            tokenId++;

            // Rate limiting
            await sleep(RATE_LIMIT.TX_DELAY_MS);
        }
    }

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 LISTING SUMMARY');
    console.log('═'.repeat(60));
    console.log(`  Total Attempts: ${results.length}`);
    console.log(`  ✅ Successful:  ${successCount}`);
    console.log(`  ❌ Failed:      ${failCount}`);
    console.log('═'.repeat(60));

    // Save results
    fs.writeFileSync(FILES.LISTINGS, JSON.stringify(results, null, 2));
    console.log(`\n📁 Results saved to: ${FILES.LISTINGS}\n`);
}

main().catch(console.error);
