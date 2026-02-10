import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { MintNFT } from './components/MintNFT';
import { MarketplaceFeed } from './components/MarketplaceFeed';
// import { ListingModal } from './components/ListingModal';
import { PageLoader } from './components/ui/PageLoader';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  // const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  // const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-6">
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 animate-fade-in-down">
          Welcome to GagaFinance
        </h1>
        <p className="text-xl text-neutral-300 max-w-2xl animate-fade-in-up">
          Experience the future of DeFi on Stacks. Connect your wallet to mint NFTs, trade assets, and earn rewards.
        </p>

        <MintNFT />
      </div>

      {/* {selectedTokenId && (
        <ListingModal
          isOpen={isListingModalOpen}
          onClose={() => setIsListingModalOpen(false)}
          tokenId={selectedTokenId}
        />
      )} */}

      <MarketplaceFeed />
    </Layout>
  );
}

export default App;
