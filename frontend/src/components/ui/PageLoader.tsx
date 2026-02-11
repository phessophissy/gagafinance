import React from 'react';

export const PageLoader: React.FC = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-sm" role="status" aria-live="polite" aria-label="Loading application">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-purple-400 animate-pulse">
                    GAGA
                </div>
            </div>
        </div>
    );
};
