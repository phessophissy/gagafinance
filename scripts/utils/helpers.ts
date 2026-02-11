import { webcrypto } from 'crypto';

/**
 * Sleep for a specified duration in milliseconds
 * @param ms Duration in milliseconds
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a random BigInt within a range
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @returns Random BigInt
 */
export function randomBigInt(min: bigint, max: bigint): bigint {
    const range = max - min;
    // Use webcrypto if available (Node 15+), otherwise fallback or user cleaner approach
    // But since the original used require('crypto'), let's try to be consistent but cleaner
    const randomBytes = require('crypto').randomBytes(8);
    const randomValue = BigInt('0x' + randomBytes.toString('hex')) % range;
    return min + randomValue;
}

/**
 * Format microSTX to STX string
 * @param microSTX Amount in microSTX
 * @returns Formatted string with 6 decimal places
 */
export function formatSTX(microSTX: bigint | number): string {
    const value = typeof microSTX === 'bigint' ? Number(microSTX) : microSTX;
    return (value / 1_000_000).toLocaleString('en-US', {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
    }) + ' STX';
}
