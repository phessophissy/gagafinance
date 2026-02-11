# Gaga Finance - Modular NFT Marketplace

![Stacks](https://img.shields.io/badge/Stacks-Mainnet-purple)
![License](https://img.shields.io/badge/License-MIT-blue)
![Clarinet](https://img.shields.io/badge/Clarinet-v2.0+-orange)


A production-grade **Modular NFT Marketplace with Composable Architecture** on Stacks (Bitcoin L2) MAINNET.

Built with Clarity smart contracts, TypeScript interaction scripts, and **`@stacks/connect`** for wallet integration.

## 🔌 Wallet Integration with `@stacks/connect`

This project uses the official **[@stacks/connect](https://github.com/hirosystems/connect)** library for seamless wallet integration with **Hiro Wallet**, **Xverse**, and **Leather Wallet**.

For more details, check the [Stacks.js Documentation](https://stacks.js.org/).


### Installation

```bash
cd scripts
npm install @stacks/connect
```

### Quick Start

```typescript
import { 
    connectWallet, 
    mintNFT, 
    createListing, 
    buyListing,
    getUserAddress 
} from './wallet-connect';

// Connect to Hiro/Leather Wallet
connectWallet(() => {
    console.log('Connected:', getUserAddress());
});

// Mint an NFT (opens wallet for signing)
mintNFT(userAddress, (txId) => {
    console.log('Minted! TX:', txId);
});

// Create a listing (0.5 STX)
createListing(tokenId, 500000, (txId) => {
    console.log('Listed! TX:', txId);
});

// Buy a listing
buyListing(listingId, (txId) => {
    console.log('Purchased! TX:', txId);
});
```

### Available Functions

| Function | Description |
|----------|-------------|
| `connectWallet()` | Opens Hiro/Leather wallet popup for authentication |
| `disconnectWallet()` | Signs out the current user |
| `getUserAddress()` | Returns the connected wallet's Stacks address |
| `isUserSignedIn()` | Checks if a wallet is connected |
| `mintNFT()` | Mints an NFT to a recipient |
| `createListing()` | Creates a fixed-price marketplace listing |
| `buyListing()` | Purchases an existing listing |
| `createAuction()` | Creates a timed auction |
| `placeBid()` | Places a bid on an active auction |

See [`scripts/wallet-connect.ts`](scripts/wallet-connect.ts) for the full implementation.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MARKETPLACE CORE                             │
│  • Listings orchestration   • Protocol fee routing                  │
│  • Fixed-price purchases    • Event emission                        │
└───────────┬──────────────────────┬──────────────────────┬───────────┘
            │                      │                      │
    ┌───────▼───────┐      ┌───────▼───────┐      ┌───────▼───────┐
    │    ESCROW     │      │ ROYALTY ENGINE│      │    AUCTION    │
    │ • STX custody │      │ • Per-collection│     │ • Timed bids  │
    │ • NFT custody │      │   royalties   │      │ • Anti-snipe  │
    │ • Settlement  │      │ • Payout calc │      │ • Settlement  │
    └───────────────┘      └───────────────┘      └───────────────┘
                                   │
                           ┌───────▼───────┐
                           │  SIP-009 NFT  │
                           │ • Minting     │
                           │ • Transfers   │
                           │ • Approvals   │
                           └───────────────┘
```

The modular design allows for:
-   **Upgradability**: Individual components (like the Auction engine) can be replaced without redeploying the core.
-   **Security**: Assets are held in the Escrow contract, separate from business logic.


## 📦 Contract Responsibilities

| Contract | Purpose |
|----------|---------|
| **marketplace-core** | Central orchestration for fixed-price listings, purchases, protocol fee collection |
| **escrow** | Secure custody of STX and NFTs during trades, emergency recovery |
| **royalty-engine** | Per-collection royalty configuration and payout calculations |
| **auction** | Timed auctions with bid tracking, anti-sniping extension |
| **nft** | Production SIP-009 NFT with minting, approvals, pausability |

## 💰 Fee Model

| Fee Type | Recipient | Calculation |
|----------|-----------|-------------|
| **Protocol Fee** | Deployer Wallet | `(price × 250) / 10000` = 2.5% |
| **Royalty** | Creator | `(price × royaltyBps) / 10000` (max 25%) |
| **Seller** | Seller | `price - protocolFee - royalty` |

**Example:** 1 STX sale with 5% royalty:
- Protocol Fee: 0.025 STX
- Creator Royalty: 0.05 STX  
- Seller Receives: 0.925 STX

## 🚀 Mainnet Deployment

### Prerequisites
- Clarinet 3.11.0+ installed
- Node.js 18+ installed
- Funded deployer wallet with STX

### Deployment Order

```bash
# 1. Deploy contracts in order
clarinet deployments apply -p deployments/default.mainnet-plan.yaml

# Deployment sequence:
# 1. sip-009-trait
# 2. marketplace-trait
# 3. nft
# 4. escrow
# 5. royalty-engine
# 6. auction
# 7. marketplace-core
```

### Post-Deployment Configuration

```clarity
;; 1. Configure escrow with marketplace address
(contract-call? .escrow set-marketplace-contract .marketplace-core)
(contract-call? .escrow set-auction-contract .auction)

;; 2. Register NFT collection for royalties
(contract-call? .royalty-engine register-collection .nft 'SP_CREATOR_ADDRESS u500)

;; 3. Verify fee recipient
(contract-call? .marketplace-core get-fee-recipient)
```

## 🔧 Scripts Usage

### Setup
```bash
cd scripts
npm install
```

### 1. Generate Wallets
```bash
npm run generate-wallets -- --wallets=10
```
⚠️ **MAINNET WARNING**: Store private keys securely!

### 2. Mint NFTs
```bash
npm run mint -- --count=2
```

### 3. Create Listings
```bash
npm run list -- --count=1 --start-token=1
```

### 4. Buy NFTs
```bash
npm run buy
```

### 5. Run Auctions
```bash
npm run auction -- --mode=full
npm run auction -- --mode=bid --auction-id=1
npm run auction -- --mode=settle --auction-id=1
```

### 6. Full Simulation
```bash
npm run simulate -- --wallets=25 --mints=2

# Dry run (no transactions)
npm run simulate -- --wallets=10 --dry-run
```

## 🧪 Testing

```bash
# Run all tests
clarinet test

# Run specific test file
clarinet test tests/marketplace-core.test.ts

# Check contract syntax
clarinet check
```

## 📁 Project Structure

```
Gagafinance/
├── contracts/
│   ├── traits/
│   │   ├── sip-009-trait.clar
│   │   └── marketplace-trait.clar
│   ├── nft.clar
│   ├── escrow.clar
│   ├── royalty-engine.clar
│   ├── auction.clar
│   └── marketplace-core.clar
├── scripts/
│   ├── package.json
│   ├── config.ts
│   ├── wallet-generator.ts
│   ├── mint.ts
│   ├── listing.ts
│   ├── buying.ts
│   ├── auction.ts
│   └── simulate.ts
├── tests/
│   ├── nft.test.ts
│   ├── marketplace-core.test.ts
│   ├── auction.test.ts
│   ├── royalty-engine.test.ts
│   └── escrow.test.ts
├── Clarinet.toml
└── README.md
```

## 🔒 Security Considerations

| Feature | Implementation |
|---------|----------------|
| **Caller Validation** | All external calls explicitly validated |
| **Pausability** | Owner can pause all contracts for emergencies |
| **Royalty Caps** | Maximum 25% royalty to prevent abuse |
| **Emergency Recovery** | Owner-only recovery hooks in escrow |
| **Safe Withdrawals** | Protected withdrawal patterns |
| **Error Codes** | All errors documented for debugging |

## ❓ Troubleshooting

-   **Transaction Stuck**: Ensure you have enough STX for gas fees.
-   **Verification Failed**: Check if you are on the correct network (Mainnet vs Testnet).
-   **Wallet Not Connecting**: Refresh the page and try again, or check your browser extension permissions.

### Error Code Reference


| Contract | Code Range | Example |
|----------|------------|---------|
| NFT | 100-110 | `ERR-NOT-TOKEN-OWNER (105)` |
| Escrow | 200-209 | `ERR-INSUFFICIENT-BALANCE (201)` |
| Royalty | 300-306 | `ERR-ROYALTY-TOO-HIGH (306)` |
| Auction | 400-414 | `ERR-BID-TOO-LOW (406)` |
| Marketplace | 500-511 | `ERR-CANNOT-BUY-OWN (508)` |

## 🎯 Design Decisions

1. **Modular Architecture**: Each contract has a single responsibility, enabling independent upgrades
2. **Trait-based Interop**: SIP-009 compliance ensures compatibility with other Stacks NFT tooling
3. **Conservative Fees**: Default 2.5% protocol fee balances revenue with user adoption
4. **Anti-sniping**: Auctions extend by 1 hour if bid placed in final hour
5. **Block-based Timing**: Uses block-height for auction timing (reliable, deterministic)


## 🗺️ Roadmap

- [x] Mainnet Deployment
- [ ] SIP-010 Token Integration
- [ ] Advanced Auction Types (Dutch Auction)
- [ ] Analytics Dashboard
- [x] Comprehensive Documentation


## 📄 License


MIT

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.
Please also note that we have a [Code of Conduct](CODE_OF_CONDUCT.md) that we ask you to follow.

