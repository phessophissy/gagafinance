import { motion } from 'framer-motion';
import React from 'react';

interface FadeInProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export const FadeIn: React.FC<FadeInProps> = ({
    children,
    delay = 0,
    duration = 0.5,
    className = '',
    direction = 'up'
}) => {
    const getVariants = () => {
        const distance = 20;
        const variants = {
            hidden: { opacity: 0, y: 0, x: 0 },
            visible: { opacity: 1, y: 0, x: 0 },
        };

        switch (direction) {
            case 'up':
                variants.hidden.y = distance;
                break;
            case 'down':
                variants.hidden.y = -distance;
                break;
            case 'left':
                variants.hidden.x = distance;
                break;
            case 'right':
                variants.hidden.x = -distance;
                break;
        }

        return variants;
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={getVariants()}
            transition={{ duration, delay, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
