
import { useCallback } from 'react';
import { useWallet } from '../components/WalletProvider';
import { CONTRACTS } from '../config/contracts';
import {
    uintCV,
    principalCV,
    contractPrincipalCV,
    PostConditionMode,
    FungibleConditionCode,
    makeStandardSTXPostCondition,
    NonFungibleConditionCode,
    createAssetInfo,
    makeStandardNonFungiblePostCondition,
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';

export const useGagaContracts = () => {
    const { userSession, network } = useWallet();

    const mintNFT = useCallback(async () => {
        if (!userSession.isUserSignedIn()) return;
        const address = userSession.loadUserData().profile.stxAddress.testnet;

        await openContractCall({
            network,
            contractAddress: CONTRACTS.NFT.address,
            contractName: CONTRACTS.NFT.name,
            functionName: 'mint',
            functionArgs: [principalCV(address)],
            postConditionMode: PostConditionMode.Deny, // Or Allow if simpler for dev
            postConditions: [],
            onFinish: (data) => {
                console.log('Mint transaction finished:', data);
            },
        });
    }, [userSession, network]);

    const listNFT = useCallback(async (tokenId: number, price: number) => {
        if (!userSession.isUserSignedIn()) return;
        const address = userSession.loadUserData().profile.stxAddress.testnet;

        // Post-condition: User transfers NFT to contract
        const assetInfo = createAssetInfo(CONTRACTS.NFT.address, CONTRACTS.NFT.name, 'gaga-nft'); // Check asset name in contract
        const pc = makeStandardNonFungiblePostCondition(
            address,
            NonFungibleConditionCode.Sends,
            assetInfo,
            uintCV(tokenId)
        );

        // Note: create-listing takes trait, token-id, price
        // Trait needs to be passed as contract reference usually, or just address.name
        // In @stacks/connect, trait args are just passed as principal usually

        await openContractCall({
            network,
            contractAddress: CONTRACTS.MARKETPLACE.address,
            contractName: CONTRACTS.MARKETPLACE.name,
            functionName: 'create-listing',
            functionArgs: [
                contractPrincipalCV(CONTRACTS.NFT.address, CONTRACTS.NFT.name), // Trait reference
                uintCV(tokenId),
                uintCV(price)
            ],
            postConditionMode: PostConditionMode.Allow, // simplifying for now
            postConditions: [],
            onFinish: (data) => {
                console.log('Listing transaction finished:', data);
            },
        });
    }, [userSession, network]);

    const buyNFT = useCallback(async (listingId: number, price: number) => {
        if (!userSession.isUserSignedIn()) return;
        const address = userSession.loadUserData().profile.stxAddress.testnet;

        // Post-condition: User sends STX to seller
        // This is tricky because we need to know the seller and the protocol fee split
        // For simplicity in this hook, we might use Allow mode or try to construct precise PCs

        await openContractCall({
            network,
            contractAddress: CONTRACTS.MARKETPLACE.address,
            contractName: CONTRACTS.MARKETPLACE.name,
            functionName: 'buy-listing',
            functionArgs: [
                uintCV(listingId),
                contractPrincipalCV(CONTRACTS.NFT.address, CONTRACTS.NFT.name)
            ],
            postConditionMode: PostConditionMode.Allow, // simplifying for dev
            postConditions: [],
            onFinish: (data) => {
                console.log('Buy transaction finished:', data);
            },
        });
    }, [userSession, network]);

    return { mintNFT, listNFT, buyNFT };
};
