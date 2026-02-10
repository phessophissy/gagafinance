export const truncateAddress = (address: string, start = 6, end = 4): string => {
    if (!address) return '';
    return `${address.slice(0, start)}...${address.slice(-end)}`;
};

export const formatSTX = (microSTX: number | string): string => {
    const amount = typeof microSTX === 'string' ? parseInt(microSTX) : microSTX;
    return (amount / 1_000_000).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
    });
};

export const formatPrice = (price: number): string => {
    return price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};
