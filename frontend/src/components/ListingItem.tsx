import React from 'react';
import { Tag } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

import { formatSTX } from '../utils/format';

interface ListingItemProps {
    id: number;
    tokenId: number;
    price: number;
    seller: string;
    isBuying: boolean;
    onBuy: (id: number, price: number) => void;
}

export const ListingItem: React.FC<ListingItemProps> = ({ id, tokenId, price, seller, isBuying, onBuy }) => {
    return (
        <Card className="!p-0 overflow-hidden hover:border-pink-500/50 transition-all group">
            <div className="aspect-square bg-neutral-800 flex items-center justify-center relative overflow-hidden">
                <img
                    src={`https://api.dicebear.com/7.x/shapes/svg?seed=${tokenId}`}
                    alt={`NFT #${tokenId}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs font-mono">
                    #{tokenId}
                </div>
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg">Gaga #{tokenId}</h3>
                        <p className="text-xs text-neutral-400">Seller: {seller}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold text-pink-400">{formatSTX(price)} STX</div>
                    </div>
                </div>

                <Button
                    onClick={() => onBuy(id, price)}
                    disabled={isBuying}
                    className="w-full flex items-center justify-center gap-2"
                    variant="secondary"
                    size="sm"
                    isLoading={isBuying}
                    aria-label={`Buy Gaga NFT #${tokenId} for ${formatSTX(price)} STX`}
                >
                    {!isBuying && <Tag size={16} aria-hidden="true" />}
                    {isBuying ? 'Processing' : 'Buy Now'}
                </Button>
            </div>
        </Card>
    );
};
