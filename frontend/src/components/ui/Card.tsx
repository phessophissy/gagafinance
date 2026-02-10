import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
    return (
        <div
            className={`bg-neutral-800/50 backdrop-blur border border-neutral-700 rounded-xl p-6 ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
