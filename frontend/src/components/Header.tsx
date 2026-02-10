import React from 'react';
import { Wallet } from 'lucide-react';

export const Header: React.FC = () => {
    return (
        <header className="bg-neutral-800/50 backdrop-blur-md border-b border-neutral-700 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold text-xl">
                        G
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                        GagaFinance
                    </span>
                </div>

                <button className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-4 py-2 rounded-lg transition-all duration-200">
                    <Wallet size={18} className="text-purple-400" />
                    <span className="font-medium">Connect Wallet</span>
                </button>
            </div>
        </header>
    );
};
