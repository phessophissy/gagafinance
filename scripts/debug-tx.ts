/**
 * Debug transaction test
 * Run: npx ts-node scripts/debug-tx.ts
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

// Load wallets
if (!fs.existsSync('wallets.json')) {
    logger.error('❌ wallets.json not found. Run: npx ts-node scripts/quick-wallets.ts first');
    process.exit(1);
}
const data = JSON.parse(fs.readFileSync('wallets.json', 'utf-8'));
const wallet = data.wallets[0];

logger.info('\n🔍 Debug Transaction Test\n');
logger.info(`Wallet Address: ${wallet.address}`);
logger.info(`Private Key (first 20 chars): ${wallet.privateKey.slice(0, 20)}...`);
logger.info(`Private Key Length: ${wallet.privateKey.length} chars`);

// Get nonce
async function getNonce(address: string): Promise<bigint> {
    try {
        const response = await fetch(`https://api.mainnet.hiro.so/extended/v1/address/${address}/nonces`);
        const data: any = await response.json();
        logger.debug(`Nonce data: ${JSON.stringify(data)}`);
        return BigInt(data.possible_next_nonce || 0);
    } catch (e) {
        return BigInt(0);
    }
}

async function testMint() {
    try {
        const nonce = await getNonce(wallet.address);
        logger.info(`\nUsing nonce: ${nonce}`);

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

        logger.info('\nCreating transaction...');
        const transaction = await makeContractCall(txOptions);
        logger.info('Transaction created successfully');
        logger.info(`TX ID (unsigned): ${transaction.txid()}`);

        logger.info('\nBroadcasting...');
        const result = await broadcastTransaction(transaction, NETWORK);

        logger.info(`\nBroadcast result: ${JSON.stringify(result, null, 2)}`);

        if (result.error) {
            logger.error(`\n❌ Error: ${result.error}`);
            logger.error(`Reason: ${result.reason}`);
            logger.error(`Reason Data: ${result.reason_data}`);
        } else {
            logger.success(`\n✅ Success! TXID: ${result.txid}`);
        }

    } catch (error: any) {
        logger.error(`\n❌ Exception: ${error.message}`);
        logger.error(`Stack: ${error.stack}`);
    }
}

testMint();
