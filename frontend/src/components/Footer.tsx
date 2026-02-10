import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-neutral-900 border-t border-neutral-800 py-6 mt-8">
            <div className="container mx-auto px-4 text-center text-neutral-500 text-sm">
                <p>&copy; {new Date().getFullYear()} GagaFinance. All rights reserved.</p>
                <p className="mt-2">Built on Stacks</p>
            </div>
        </footer>
    );
};
