'use client';

import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export function SearchBar({ placeholder }: { placeholder: string }) {
    const searchParams = useSearchParams();
    const { replace } = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        replace(`?${params.toString()}`);
    }, 300);

    return (
        <div className="relative mb-6">
            <Input
                type="text"
                placeholder={placeholder}
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get('query')?.toString()}
                className="w-full pl-10 h-12 text-lg"
                dir="auto"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
            </span>
        </div>
    );
}
