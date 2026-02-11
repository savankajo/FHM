import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import styles from './button.module.css'; // We'll keep avoiding CSS modules if possible for simplicity, but let's stick to global utility classes or inline styles for speed if no tailwind?
// Wait, I am NOT using Tailwind (user said "Avoid using TailwindCSS unless requested").
// I defined .btn in global.css. Let's use that.

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', fullWidth, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'btn',
                    variant === 'outline' && 'btn-outline', // Need to define this in globals.css
                    variant === 'ghost' && 'btn-ghost',     // Need to define this in globals.css
                    fullWidth && 'w-full',                  // Need to define this in globals.css
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button };
