// Quick wallet generator for Stacks Mainnet
// Run: npx ts-node scripts/quick-wallets.ts

import * as bip39 from 'bip39';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { logger } from './utils/logger.js';

const WALLETS_COUNT = 5;

logger.info(`\n🔐 Generating ${WALLETS_COUNT} Stacks Mainnet Wallets\n`);
logger.warn('⚠️  MAINNET WARNING: Keep these mnemonics and private keys SECURE!\n');
logger.info('='.repeat(60) + '\n');

const wallets = [];

for (let i = 0; i < WALLETS_COUNT; i++) {
    // Generate mnemonic
    const mnemonic = bip39.generateMnemonic(256);

    // Generate a random private key (for display - real derivation would use BIP32)
    // Note: This is just a random key, NOT derived from the mnemonic above.
    // The original script did this, so preserving behavior but clarifying.
    const privateKey = crypto.randomBytes(32).toString('hex');

    logger.info(`Wallet ${i + 1}:`);
    logger.info(`  Mnemonic: ${mnemonic}`);
    logger.info(`  Private Key: ${privateKey}`);
    logger.info('');

    wallets.push({
        index: i,
        mnemonic,
        privateKey
    });
}

logger.info('='.repeat(60));
logger.info('\n📋 To fund these wallets:');
logger.info('1. Import each mnemonic into Hiro Wallet (or Leather Wallet)');
logger.info('2. The wallet will show you the Stacks address');
logger.info('3. Send STX to each address\n');

fs.writeFileSync('wallets.json', JSON.stringify({ wallets }, null, 2));
logger.success('✅ Saved to wallets.json\n');
