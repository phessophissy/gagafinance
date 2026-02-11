import React from 'react';
import { useGagaContracts } from '../hooks/useGagaContracts';
import { useWallet } from './WalletProvider';
import { Hammer } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export const MintNFT: React.FC = () => {
    const { mintNFT } = useGagaContracts();
    const { isConnected } = useWallet();

    return (
        <Card className="max-w-sm mx-auto mt-8">
            <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center">
                    <Hammer className="text-purple-400" size={32} />
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-gradient">
                        Mint Gaga NFT
                    </h2>
                    <p className="text-neutral-400 text-sm mt-2">
                        Create your unique digital asset on the Stacks blockchain.
                    </p>
                </div>

                <Button
                    onClick={mintNFT}
                    disabled={!isConnected}
                    className="w-full text-lg"
                    size="lg"
                    variant={isConnected ? 'primary' : 'secondary'}
                >
                    {isConnected ? 'Mint Now' : 'Connect Wallet to Mint'}
                </Button>
            </div>
        </Card>
    );
};
