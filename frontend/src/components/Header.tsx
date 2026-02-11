import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { useWallet } from './WalletProvider';
import { Button } from './ui/Button';
import { truncateAddress } from '../utils/format';

export const Header: React.FC = () => {
    const { connectWallet, disconnectWallet, isConnected, userData } = useWallet();

    // const truncateAddress = (address: string) => {
    //     if (!address) return '';
    //     return `${address.slice(0, 6)}...${address.slice(-4)}`;
    // };

    return (
        <header className="glass-panel border-b-0 border-x-0 border-t-0 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold text-xl">
                        G
                    </div>
                    <span className="text-xl font-bold text-gradient">
                        GagaFinance
                    </span>
                </div>

                {isConnected ? (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800 rounded-lg border border-neutral-700">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-sm font-medium text-neutral-300">
                                {userData?.profile?.stxAddress?.testnet ? truncateAddress(userData.profile.stxAddress.testnet) : 'Connected'}
                            </span>
                        </div>
                        <Button
                            onClick={disconnectWallet}
                            variant="ghost"
                            size="sm"
                            title="Disconnect"
                        >
                            <LogOut size={20} />
                        </Button>
                    </div>
                ) : (
                    <Button
                        onClick={connectWallet}
                        variant="secondary"
                        className="flex items-center gap-2"
                    >
                        <Wallet size={18} className="text-purple-400" />
                        <span className="font-medium">Connect Wallet</span>
                    </Button>
                )}
            </div>
        </header>
    );
};
