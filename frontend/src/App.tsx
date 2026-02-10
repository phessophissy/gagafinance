import React from 'react';
import { Layout } from './components/Layout';

function App() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Welcome to GagaFinance
        </h1>
        <p className="text-xl text-neutral-300 max-w-2xl">
          Experience the future of DeFi on Stacks. Connect your wallet to mint NFTs, trade assets, and earn rewards.
        </p>

        <div className="flex gap-4 mt-8">
          <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity">
            Explore Market
          </button>
          <button className="px-8 py-3 bg-neutral-800 border border-neutral-700 rounded-lg font-bold text-lg hover:bg-neutral-700 transition-colors">
            View Analytics
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-4xl">
          {[
            { title: 'Secure', description: 'Built on Bitcoin via Stacks' },
            { title: 'Fast', description: 'Lightning fast transactions' },
            { title: 'Decentralized', description: 'Fully community governed' }
          ].map((feature, i) => (
            <div key={i} className="p-6 bg-neutral-800/50 backdrop-blur border border-neutral-700 rounded-xl hover:border-purple-500/50 transition-colors">
              <h3 className="text-xl font-bold mb-2 text-purple-400">{feature.title}</h3>
              <p className="text-neutral-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default App;
