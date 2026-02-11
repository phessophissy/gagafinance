import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-neutral-900 text-white flex flex-col font-sans">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-4 py-2 rounded-lg z-50">
                Skip to main content
            </a>
            <Header />
            <main id="main-content" className="flex-grow container mx-auto px-4 py-8" tabIndex={-1}>
                {children}
            </main>
            <Footer />
        </div>
    );
};
