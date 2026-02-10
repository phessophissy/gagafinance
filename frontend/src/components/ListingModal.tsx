import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useGagaContracts } from '../hooks/useGagaContracts';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6">List NFT #{tokenId}</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">
                            Price (STX)
                        </label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0.00"
                            step="0.1"
                            min="0"
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isSubmitting ? 'Confirming...' : 'List for Sale'}
                    </button>
                </form>
            </div>
        </div>
    );
};
