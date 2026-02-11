import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`bg-neutral-800/50 backdrop-blur border border-neutral-700 rounded-xl p-6 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};
