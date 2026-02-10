import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

interface WalletContextType {
    userSession: UserSession;
    userData: any;
    isConnected: boolean;
    connectWallet: () => void;
    disconnectWallet: () => void;
    network: typeof STACKS_MAINNET | typeof STACKS_TESTNET;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const appConfig = new AppConfig(['store_write', 'publish_data']);
    const userSession = new UserSession({ appConfig });
    const [userData, setUserData] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);
    const network = STACKS_TESTNET;

    useEffect(() => {
        if (userSession.isUserSignedIn()) {
            setUserData(userSession.loadUserData());
            setIsConnected(true);
        }
    }, []);

    const connectWallet = () => {
        showConnect({
            appDetails: {
                name: 'GagaFinance',
                icon: window.location.origin + '/vite.svg',
            },
            redirectTo: '/',
            onFinish: () => {
                const userData = userSession.loadUserData();
                setUserData(userData);
                setIsConnected(true);
            },
            userSession,
        });
    };

    const disconnectWallet = () => {
        userSession.signUserOut();
        setUserData(null);
        setIsConnected(false);
    };

    return (
        <WalletContext.Provider value={{ userSession, userData, isConnected, connectWallet, disconnectWallet, network }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};
