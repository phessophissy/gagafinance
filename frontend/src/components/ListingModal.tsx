import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useGagaContracts } from '../hooks/useGagaContracts';
import { Button } from './ui/Button';
import { FadeIn } from './ui/FadeIn';

interface ListingModalProps {
    isOpen: boolean;
    onClose: () => void;
    tokenId: number;
}

export const ListingModal: React.FC<ListingModalProps> = ({ isOpen, onClose, tokenId }) => {
    const [price, setPrice] = useState('');
    const { listNFT } = useGagaContracts();
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!price || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await listNFT(tokenId, parseInt(price) * 1000000); // Convert STX to microSTX
            onClose();
        } catch (error) {
            console.error('Failed to list NFT:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <FadeIn duration={0.2} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <FadeIn direction="up" duration={0.3} className="relative z-10 w-full max-w-md">
                <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-6 relative shadow-2xl shadow-purple-500/10">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <h2 className="text-2xl font-bold mb-6 text-gradient">
                        List NFT #{tokenId}
                    </h2>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">
                                Price (STX)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0.00"
                                    step="0.1"
                                    min="0"
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-4 pr-12 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    required
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">
                                    STX
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full text-lg"
                            size="lg"
                            isLoading={isSubmitting}
                        >
                            {isSubmitting ? 'Confirming...' : 'List for Sale'}
                        </Button>
                    </form>
                </div>
            </FadeIn>
        </div>
    );
};
