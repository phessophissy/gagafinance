import React, { useState } from 'react';
import { useGagaContracts } from '../hooks/useGagaContracts';
import { ShoppingBag } from 'lucide-react';
import { ListingItem } from './ListingItem';

// Mock data for now, since reading from contract requires read-only calls implementation
const MOCK_LISTINGS = [
    { id: 1, tokenId: 101, price: 50, seller: 'ST1...ABC' },
    { id: 2, tokenId: 102, price: 120, seller: 'ST2...XYZ' },
    { id: 3, tokenId: 103, price: 75, seller: 'ST3...DEF' },
    { id: 4, tokenId: 104, price: 200, seller: 'ST4...GHI' },
    { id: 5, tokenId: 105, price: 15, seller: 'ST5...JKL' },
    { id: 6, tokenId: 106, price: 300, seller: 'ST6...MNO' },
];

export const MarketplaceFeed: React.FC = () => {
    const { buyNFT } = useGagaContracts();
    const [buyingId, setBuyingId] = useState<number | null>(null);

    const handleBuy = async (listingId: number, price: number) => {
        setBuyingId(listingId);
        try {
            await buyNFT(listingId, price);
        } catch (error) {
            console.error('Failed to buy NFT:', error);
        } finally {
            setBuyingId(null);
        }
    };

    return (
        <div className="mt-16 w-full max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                    <ShoppingBag className="text-pink-500" />
                    Marketplace
                </h2>
                <div className="flex gap-2">
                    {['All', 'Recent', 'Low to High', 'High to Low'].map((filter) => (
                        <button key={filter} className="px-4 py-2 bg-neutral-800 rounded-lg text-sm hover:bg-neutral-700 transition-colors">
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {MOCK_LISTINGS.map((listing) => (
                    <ListingItem
                        key={listing.id}
                        id={listing.id}
                        tokenId={listing.tokenId}
                        price={listing.price}
                        seller={listing.seller}
                        isBuying={buyingId === listing.id}
                        onBuy={handleBuy}
                    />
                ))}
            </div>
        </div>
    );
};
