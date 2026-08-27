import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        const generatedId = useId();
        const inputId = props.id || generatedId;
        const errorId = error ? `${inputId}-error` : undefined;
        return (
            <div className="input-group">
                {label && <label className="input-label" htmlFor={inputId}>{label}</label>}
                <input
                    ref={ref}
                    id={inputId}
                    className={cn('input', error && 'input-error', className)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={errorId}
                    {...props}
                />
                {error && <span id={errorId} className="input-error-msg" role="alert">{error}</span>}
            </div>
        );
    }
);
Input.displayName = 'Input';

export { Input };
