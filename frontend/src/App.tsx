
import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { MintNFT } from './components/MintNFT';
import { MarketplaceFeed } from './components/MarketplaceFeed';
// import { ListingModal } from './components/ListingModal';
import { PageLoader } from './components/ui/PageLoader';
import { FadeIn } from './components/ui/FadeIn';

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
        <FadeIn delay={0.2} direction="down">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Welcome to GagaFinance
          </h1>
        </FadeIn>

        <FadeIn delay={0.4} direction="up">
          <p className="text-xl text-neutral-300 max-w-2xl">
            Experience the future of DeFi on Stacks. Connect your wallet to mint NFTs, trade assets, and earn rewards.
          </p>
        </FadeIn>

        <FadeIn delay={0.6}>
          <MintNFT />
        </FadeIn>
      </div>

      {/* {selectedTokenId && (
        <ListingModal 
          isOpen={isListingModalOpen} 
          onClose={() => setIsListingModalOpen(false)} 
          tokenId={selectedTokenId} 
        />
      )} */}

      <FadeIn delay={0.8}>
        <MarketplaceFeed />
      </FadeIn>
    </Layout>
  );
}

export default App;

