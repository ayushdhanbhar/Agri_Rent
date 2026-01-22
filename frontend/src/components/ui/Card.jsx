import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const Card = React.forwardRef(({ className, glass = false, hover = false, children, ...props }, ref) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : {}}
        ref={ref}
        className={cn(
            'rounded-xl border bg-white p-6 shadow-sm',
            glass && 'bg-white/80 backdrop-blur-md border-white/20 shadow-xl',
            hover && 'hover:shadow-lg transition-shadow',
            className
        )}
        {...props}
    >
        {children}
    </motion.div>
));
Card.displayName = 'Card';

export { Card };
