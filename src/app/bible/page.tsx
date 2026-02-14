
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BiblePage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-lg">
            <Link href="/" className="text-sm text-gray-500 hover:text-primary mb-6 block">← Back to Home</Link>
            <h1 className="text-2xl font-bold mb-6 text-center">Bible Versions</h1>

            <div className="space-y-4">
                <a href="https://www.biblegateway.com/passage/?search=Genesis+1&version=NAV" target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full h-16 text-lg justify-start px-6 bg-white hover:bg-orange-50 text-gray-800 border shadow-sm">
                        <span className="mr-3 text-2xl">🇦🇪</span> Arabic Bible (NAV)
                    </Button>
                </a>

                <a href="https://www.biblegateway.com/passage/?search=Genesis+1&version=NIV" target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full h-16 text-lg justify-start px-6 bg-white hover:bg-orange-50 text-gray-800 border shadow-sm">
                        <span className="mr-3 text-2xl">🇬🇧</span> English Bible (NIV)
                    </Button>
                </a>

                <a href="https://www.biblegateway.com/passage/?search=Genesis+1&version=AMP" target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full h-16 text-lg justify-start px-6 bg-white hover:bg-orange-50 text-gray-800 border shadow-sm">
                        <span className="mr-3 text-2xl">📖</span> English Bible (AMP)
                    </Button>
                </a>
            </div>
        </div>
    );
}
