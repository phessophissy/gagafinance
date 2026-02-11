/**
 * Debug script to verify wallet key-to-address derivation
 * Run: npx ts-node scripts/verify-keys.ts
 */
import { getAddressFromPrivateKey, TransactionVersion } from '@stacks/transactions';
import { logger } from './utils/logger.js';

// WARNING: Avoid hardcoding real private keys. Use env vars or test vectors.
const wallets = [
    {
        expected: process.env.TEST_ADDRESS_1 || "SP25Y0CZZBEZTQDJRPYPWQKXZ1Q9W514DKNHS25W7",
        privateKey: process.env.TEST_KEY_1 || "357cf9a3dd8b9efb0378ee0b88338a33fe58361b2732fc7fccaa43f795aa7557"
    },
    {
        expected: process.env.TEST_ADDRESS_2 || "SP1355RXM53D9JXZ2DCFWJSB3DWWGTXQ8DRKV693P",
        privateKey: process.env.TEST_KEY_2 || "0341bb3311a12d537c65063fddacd3f90ebf36424f3b31879a94d32228c836d3"
    }
];

logger.info('🔍 Verifying wallet key derivations...\n');

for (const wallet of wallets) {
    const derived = getAddressFromPrivateKey(wallet.privateKey, TransactionVersion.Mainnet);
    const match = derived === wallet.expected;

    logger.info(`Expected: ${wallet.expected}`);
    logger.info(`Derived:  ${derived}`);

    if (match) {
        logger.success('Match:    ✅ YES\n');
    } else {
        logger.error('Match:    ❌ NO\n');
    }
}
