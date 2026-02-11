/**
 * Gaga Finance - Mint Script
 * Mints NFTs to wallets for marketplace testing
 */

import * as fs from 'fs';
import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    principalCV,
    ClarityValue,
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
import { logger } from './utils/logger.js';

interface WalletInfo {
    index: number;
    address: string;
    privateKey: string;
}

interface WalletFile {
    wallets: WalletInfo[];
}

interface MintResult {
    wallet: string;
    tokenId: number | null;
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
 * Mint NFT to a wallet
 */
async function mintNFT(
    privateKey: string,
    recipient: string,
    nonce: bigint
): Promise<{ txId: string }> {
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

/**
 * Main function
 */
async function main() {
    logger.info('\n╔══════════════════════════════════════════════════════════════╗');
    logger.info('║           GAGA FINANCE - NFT MINT SCRIPT                     ║');
    logger.info('╠══════════════════════════════════════════════════════════════╣');
    logger.info('║  Minting NFTs to wallets on Stacks MAINNET                   ║');
    logger.info('╚══════════════════════════════════════════════════════════════╝\n');

    // Load wallets
    const wallets = loadWallets();
    logger.info(`📁 Loaded ${wallets.length} wallets\n`);

    // Parse arguments
    const args = process.argv.slice(2);
    let mintsPerWallet = 1;

    for (const arg of args) {
        if (arg.startsWith('--count=')) {
            mintsPerWallet = parseInt(arg.split('=')[1], 10) || 1;
        }
    }

    logger.info(`🎨 Minting ${mintsPerWallet} NFT(s) per wallet...\n`);
    logger.info(`📝 Contract: ${getContractId(CONTRACTS.NFT)}\n`);

    const results: MintResult[] = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < wallets.length; i++) {
        const wallet = wallets[i];

        for (let m = 0; m < mintsPerWallet; m++) {
            logger.info(`⏳ Minting for wallet ${i + 1}/${wallets.length} (mint ${m + 1}/${mintsPerWallet})...`);

            try {
                // Note: In production, you'd need to track nonces properly
                const nonce = BigInt(m);

                const { txId } = await mintNFT(wallet.privateKey, wallet.address, nonce);

                results.push({
                    wallet: wallet.address,
                    tokenId: null, // Will be known after confirmation
                    txId,
                    success: true,
                });

                successCount++;
                logger.success(`  ✅ TX: ${txId}`);

            } catch (error: any) {
                results.push({
                    wallet: wallet.address,
                    tokenId: null,
                    txId: null,
                    success: false,
                    error: error.message,
                });

                failCount++;
                logger.error(`  ❌ Error: ${error.message}`);
            }

            // Rate limiting
            await sleep(RATE_LIMIT.TX_DELAY_MS);
        }
    }

    // Summary
    logger.info('\n' + '═'.repeat(60));
    logger.info('📊 MINT SUMMARY');
    logger.info('═'.repeat(60));
    logger.info(`  Total Attempts: ${results.length}`);
    logger.success(`  ✅ Successful:  ${successCount}`);
    logger.error(`  ❌ Failed:      ${failCount}`);
    logger.info('═'.repeat(60));

    // Save results
    const outputFile = 'mint-results.json';
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    logger.info(`\n📁 Results saved to: ${outputFile}\n`);
}

main().catch(logger.error);
