import { describe, it, expect } from 'vitest';
import { truncateAddress, formatSTX, formatPrice } from './format';

describe('format utils', () => {
    describe('truncateAddress', () => {
        it('should truncate address correctly with default length', () => {
            const address = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
            expect(truncateAddress(address)).toBe('ST1PQH...ZGGM');
        });

        it('should truncate address with custom length', () => {
            const address = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
            expect(truncateAddress(address, 4, 4)).toBe('ST1P...ZGGM');
        });

        it('should return empty string if address is empty', () => {
            expect(truncateAddress('')).toBe('');
        });
    });

    describe('formatSTX', () => {
        it('should format microSTX to STX correctly', () => {
            expect(formatSTX(1000000)).toBe('1.00');
            expect(formatSTX(500000)).toBe('0.50');
            expect(formatSTX(1500000)).toBe('1.50');
        });

        it('should handle string input', () => {
            expect(formatSTX('1000000')).toBe('1.00');
        });
    });

    describe('formatPrice', () => {
        it('should format price with commas', () => {
            expect(formatPrice(1000)).toBe('1,000.00');
            expect(formatPrice(1000000)).toBe('1,000,000.00');
        });
    });
});
