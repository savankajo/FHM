import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import styles from './button.module.css'; // We'll keep avoiding CSS modules if possible for simplicity, but let's stick to global utility classes or inline styles for speed if no tailwind?
// Wait, I am NOT using Tailwind (user said "Avoid using TailwindCSS unless requested").
// I defined .btn in global.css. Let's use that.

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', fullWidth, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'btn',
                    variant === 'outline' && 'btn-outline',
                    variant === 'ghost' && 'btn-ghost',
                    variant === 'destructive' && 'bg-red-600 text-white hover:bg-red-700 hover:opacity-90',
                    size === 'sm' && 'btn-sm',
                    size === 'lg' && 'btn-lg',
                    fullWidth && 'w-full',
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button };
