import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="input-group">
                {label && <label className="input-label">{label}</label>}
                <input
                    ref={ref}
                    className={cn('input', error && 'input-error', className)}
                    {...props}
                />
                {error && <span className="input-error-msg">{error}</span>}
            </div>
        );
    }
);
Input.displayName = 'Input';

export { Input };
