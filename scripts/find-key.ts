/**
 * Test different derivation paths to find matching private key
 * Run: npx ts-node scripts/find-key.ts
 */

import * as bip39 from 'bip39';
import { HDKey } from '@scure/bip32';
import { bytesToHex } from '@stacks/common';
import { getAddressFromPrivateKey, TransactionVersion } from '@stacks/transactions';
import { logger } from './utils/logger.js';

// WARNING: Never commit real mnemonics! Use environment variables.
const MNEMONIC = process.env.MNEMONIC || "direct armor frozen cruel orchard document cradle embody ghost youth suggest hazard glove warfare stock sign attack promote patient crawl random blossom measure sniff";
const EXPECTED_ADDRESS = process.env.EXPECTED_ADDRESS || "SP25Y0CZZBEZTQDJRPYPWQKXZ1Q9W514DKNHS25W7";

// Different derivation paths used by various wallets
const PATHS = [
    "m/44'/5757'/0'/0/0",     // Standard Stacks path
    "m/44'/5757'/0'/0",       // Without last level
    "m/888'/0'/0'/0/0",       // Hiro Wallet uses this
    "m/888'/0'/0'",           // Another Hiro variant
    "m/44'/0'/0'/0/0",        // BTC-style
    "m/44'/0'/0'",            // Another BTC variant
    "m/44'/5757'/0'",         // Stacks without account
];

async function findMatchingPath() {
    logger.info('\n🔍 Testing derivation paths...\n');
    logger.info('Mnemonic:', MNEMONIC.split(' ').slice(0, 4).join(' ') + '...');
    logger.info('Expected Address:', EXPECTED_ADDRESS);
    logger.info('');

    const seed = await bip39.mnemonicToSeed(MNEMONIC);
    const hdKey = HDKey.fromMasterSeed(seed);

    for (const path of PATHS) {
        try {
            const derived = hdKey.derive(path);
            if (!derived.privateKey) continue;

            const privateKey = bytesToHex(derived.privateKey);

            // Get address from private key
            const address = getAddressFromPrivateKey(
                privateKey,
                TransactionVersion.Mainnet
            );

            const match = address === EXPECTED_ADDRESS ? '✅ MATCH!' : '';
            logger.info(`Path: ${path.padEnd(25)} => ${address} ${match}`);

            if (match) {
                logger.success(`\nFound matching private key: ${privateKey}`);
                return privateKey;
            }
        } catch (e: any) {
            logger.error(`Path: ${path.padEnd(25)} => Error: ${e.message}`);
        }
    }

    logger.warn('\n❌ No matching path found');
    return null;
}

findMatchingPath().catch(logger.error);
