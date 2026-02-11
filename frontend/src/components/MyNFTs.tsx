import React from 'react';
import { Tag } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { FadeIn } from './ui/FadeIn';

interface MyNFTsProps {
    onList: (tokenId: number) => void;
}

// Mock wallet NFTs
const MOCK_WALLET_NFTS = [
    { id: 101, tokenId: 101 },
    { id: 102, tokenId: 205 },
    { id: 103, tokenId: 308 },
];

export const MyNFTs: React.FC<MyNFTsProps> = ({ onList }) => {
    return (
        <div className="mt-16 w-full max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-8">
                <span className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-sm" aria-hidden="true">🦄</span>
                Your Collection
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {MOCK_WALLET_NFTS.map((nft, index) => (
                    <FadeIn key={nft.id} delay={index * 0.1}>
                        <Card className="!p-0 overflow-hidden hover:border-purple-500/50 transition-all group">
                            <div className="aspect-square bg-neutral-800 flex items-center justify-center relative overflow-hidden">
                                <img
                                    src={`https://api.dicebear.com/7.x/shapes/svg?seed=${nft.tokenId}`}
                                    alt={`NFT #${nft.tokenId}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs font-mono">
                                    #{nft.tokenId}
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="font-bold text-lg mb-4">Gaga #{nft.tokenId}</h3>
                                <Button
                                    onClick={() => onList(nft.tokenId)}
                                    variant="outline"
                                    size="sm"
                                    className="w-full flex items-center justify-center gap-2"
                                >
                                    <Tag size={16} />
                                    List for Sale
                                </Button>
                            </div>
                        </Card>
                    </FadeIn>
                ))}
            </div>
        </div>
    );
};
