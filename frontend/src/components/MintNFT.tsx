import React from 'react';
import { useGagaContracts } from '../hooks/useGagaContracts';
import { useWallet } from './WalletProvider';
import { Hammer } from 'lucide-react';

export const MintNFT: React.FC = () => {
    const { mintNFT } = useGagaContracts();
    const { isConnected } = useWallet();

    return (
        <div className="p-6 bg-neutral-800/50 backdrop-blur border border-neutral-700 rounded-xl max-w-sm mx-auto mt-8">
            <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center">
                    <Hammer className="text-purple-400" size={32} />
                </div>

                <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                        Mint Gaga NFT
                    </h2>
                    <p className="text-neutral-400 text-sm mt-2">
                        Create your unique digital asset on the Stacks blockchain.
                    </p>
                </div>

                <button
                    onClick={mintNFT}
                    disabled={!isConnected}
                    className={`
            w-full py-3 px-6 rounded-lg font-bold text-lg transition-all duration-200
            ${isConnected
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 hover:scale-[1.02]'
                            : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'}
          `}
                >
                    {isConnected ? 'Mint Now' : 'Connect Wallet to Mint'}
                </button>
            </div>
        </div>
    );
};
