import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Button = React.forwardRef(({
    className,
    variant = 'primary',
    size = 'default',
    isLoading,
    children,
    ...props
}, ref) => {
    const variants = {
        primary: 'bg-agri-green text-white hover:bg-green-700 shadow-md hover:shadow-lg',
        secondary: 'bg-white text-agri-dark border border-gray-200 hover:bg-gray-50 shadow-sm',
        danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md',
        ghost: 'hover:bg-gray-100 text-gray-700',
        outline: 'border-2 border-agri-green text-agri-green hover:bg-agri-green/10'
    };

    const sizes = {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-lg',
        icon: 'h-10 w-10 p-2 flex items-center justify-center'
    };

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-agri-green disabled:pointer-events-none disabled:opacity-50',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </motion.button>
    );
});

Button.displayName = 'Button';

export { Button };
