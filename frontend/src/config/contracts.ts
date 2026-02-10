import { STACKS_TESTNET } from '@stacks/network';

// Deployment address for testnet/devnet
// In a real app, this would be an environment variable
export const DEPLOYER_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

export const CONTRACTS = {
    NFT: {
        address: DEPLOYER_ADDRESS,
        name: 'nft',
    },
    MARKETPLACE: {
        address: DEPLOYER_ADDRESS,
        name: 'marketplace-core',
    },
};

export const ITEMS_PER_PAGE = 12;
