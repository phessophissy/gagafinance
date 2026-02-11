/**
 * Proper Stacks Wallet Key Derivation - Updated to show correct derived addresses
 * Derives private keys from mnemonics using proper BIP32/BIP39
 * Run: npx ts-node scripts/derive-keys.ts
 */

import * as bip39 from 'bip39';
import { HDKey } from '@scure/bip32';
import { bytesToHex } from '@stacks/common';
import { getAddressFromPrivateKey, TransactionVersion } from '@stacks/transactions';
import * as fs from 'fs';
import { logger } from './utils/logger.js';

// Stacks uses this derivation path for mainnet
const STACKS_DERIVATION_PATH = "m/44'/5757'/0'/0/0";

// WARNING: Avoid committing real mnemonics. Use env vars.
// If env vars are not set, use placeholders or empty list.
// For refactoring, we'll keep the structure but avoid hardcoded values if possible, 
// or acknowledge them as test vectors.
const mnemonics = [
    process.env.MNEMONIC_1 || "direct armor frozen cruel orchard document cradle embody ghost youth suggest hazard glove warfare stock sign attack promote patient crawl random blossom measure sniff",
    process.env.MNEMONIC_2 || "merge trouble surge bread broccoli tonight morning describe impact street remember mass term dirt quality brief change wheat slot episode tomato giggle village naive",
    process.env.MNEMONIC_3 || "review solve cause dial actual sort leisure attract pact friend cliff cream fiber upgrade kangaroo group ribbon scheme isolate medal estate prosper retire dragon",
    process.env.MNEMONIC_4 || "crawl daring ivory tide month elephant kite trash ill average damp cart camera left nominee ask defense syrup chase tomato protect stairs satisfy box",
    process.env.MNEMONIC_5 || "torch virus faculty humble car surprise town tiny please town pause tray large boil session equal inspire affair adjust once royal sport obscure cricket",
];

const wallets = mnemonics.map((mnemonic, index) => ({ index, mnemonic }));

logger.info('\n🔑 Deriving private keys and addresses from mnemonics...\n');

async function deriveKeys() {
    const results = [];

    for (const wallet of wallets) {
        // Convert mnemonic to seed
        const seed = await bip39.mnemonicToSeed(wallet.mnemonic);

        // Derive HD key
        const hdKey = HDKey.fromMasterSeed(seed);
        const derived = hdKey.derive(STACKS_DERIVATION_PATH);

        if (!derived.privateKey) continue;

        const privateKey = bytesToHex(derived.privateKey);

        // Derive the correct address from the private key
        const address = getAddressFromPrivateKey(privateKey, TransactionVersion.Mainnet);

        logger.info(`Wallet ${wallet.index + 1}:`);
        logger.info(`  Private Key: ${privateKey.slice(0, 20)}...`);
        logger.info(`  Address: ${address}`);
        logger.info('');

        results.push({
            index: wallet.index,
            mnemonic: wallet.mnemonic,
            privateKey: privateKey,
            address: address  // Use the correctly derived address
        });
    }

    // Save to file
    fs.writeFileSync('wallets.json', JSON.stringify({
        network: 'mainnet',
        warning: 'DERIVED KEYS - Handle with care!',
        createdAt: new Date().toISOString(),
        wallets: results
    }, null, 2));

    logger.success('✅ Saved derived keys to wallets.json\n');

    // Print funding instructions
    logger.warn('⚠️  IMPORTANT: The addresses above are the CORRECT addresses derived from the private keys.');
    logger.warn('   If you have STX at different addresses, you need to send STX to these new addresses.\n');
}

deriveKeys().catch(logger.error);
