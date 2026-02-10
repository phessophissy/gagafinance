import React from 'react';
import { Twitter, Github, Globe } from 'lucide-react';
import { Button } from './ui/Button';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-neutral-900 border-t border-neutral-800 pt-12 pb-8 mt-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold text-xl text-white">
                                G
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                                GagaFinance
                            </span>
                        </div>
                        <p className="text-neutral-400 text-sm max-w-sm">
                            The premier NFT marketplace on Stacks. Mint, trade, and collect digital assets with Bitcoin-grade security.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-4">Marketplace</h4>
                        <ul className="space-y-2 text-sm text-neutral-400">
                            <li><a href="#" className="hover:text-pink-400 transition-colors">All NFTs</a></li>
                            <li><a href="#" className="hover:text-pink-400 transition-colors">New Arrivals</a></li>
                            <li><a href="#" className="hover:text-pink-400 transition-colors">Top Collections</a></li>
                            <li><a href="#" className="hover:text-pink-400 transition-colors">Activity</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-4">Community</h4>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="!p-2">
                                <Twitter size={20} />
                            </Button>
                            <Button variant="ghost" size="sm" className="!p-2">
                                <Github size={20} />
                            </Button>
                            <Button variant="ghost" size="sm" className="!p-2">
                                <Globe size={20} />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-500">
                    <p>&copy; {new Date().getFullYear()} GagaFinance. All rights reserved.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
