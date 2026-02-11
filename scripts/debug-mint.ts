/**
 * Debug script to test a single mint transaction with full error output
 * Run: npx ts-node scripts/debug-mint.ts
 */

import * as fs from 'fs';
import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    principalCV,
    SignedContractCallOptions,
} from '@stacks/transactions';
import { NETWORK, DEPLOYER_ADDRESS, MAX_FEE, CONTRACTS } from './config.js';
import { logger } from './utils/logger.js';

// Load first wallet
if (!fs.existsSync('wallets.json')) {
    logger.error('❌ wallets.json not found. Run: npx ts-node scripts/quick-wallets.ts first');
    process.exit(1);
}
const wallets = JSON.parse(fs.readFileSync('wallets.json', 'utf-8')).wallets;
const wallet = wallets[0];

logger.info('🔍 Debug: Testing single mint transaction');
logger.info(`   Wallet: ${wallet.address}`);
logger.info(`   Private Key (first 10 chars): ${wallet.privateKey.slice(0, 10)}...`);

async function getNonce(address: string): Promise<bigint> {
    try {
        const response = await fetch(`https://api.mainnet.hiro.so/extended/v1/address/${address}/nonces`);
        const data: any = await response.json();
        logger.debug(`   Nonce data: ${JSON.stringify(data)}`);
        return BigInt(data.possible_next_nonce || 0);
    } catch (e) {
        return BigInt(0);
    }
}

async function main() {
    try {
        const nonce = await getNonce(wallet.address);
        logger.info(`   Using nonce: ${nonce}`);

        const txOptions: SignedContractCallOptions = {
            contractAddress: DEPLOYER_ADDRESS,
            contractName: CONTRACTS.NFT,
            functionName: 'mint',
            functionArgs: [principalCV(wallet.address)],
            senderKey: wallet.privateKey,
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
            fee: MAX_FEE,
            nonce: nonce,
        };

        logger.info('   Building transaction...');
        const transaction = await makeContractCall(txOptions);

        logger.info('   Broadcasting transaction...');
        const result = await broadcastTransaction(transaction, NETWORK);

        logger.info(`   Full result: ${JSON.stringify(result, null, 2)}`);

        if (result.error) {
            logger.error('❌ Transaction rejected:');
            logger.error(`   Error: ${result.error}`);
            logger.error(`   Reason: ${result.reason}`);
            logger.error(`   Reason Data: ${JSON.stringify(result.reason_data, null, 2)}`);
        } else {
            logger.success(`✅ Success! TX ID: ${result.txid}`);
        }
    } catch (error: any) {
        logger.error(`❌ Exception: ${error.message}`);
    }
}

main();
