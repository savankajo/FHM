
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BiblePage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-lg">
            <Link href="/" className="text-sm text-gray-500 hover:text-primary mb-6 block">← Back to Home</Link>
            <h1 className="text-2xl font-bold mb-6 text-center">Bible Versions</h1>

            <div className="space-y-4">
                <a href="https://www.bible.com/bible/13/GEN.1.NAV" target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full h-16 text-lg justify-start px-6 bg-white hover:bg-orange-50 text-gray-800 border shadow-sm">
                        <span className="mr-3 text-2xl">🇦🇪</span> Arabic Bible (NAV)
                    </Button>
                </a>

                <a href="https://www.bible.com/bible/111/GEN.1.NIV" target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full h-16 text-lg justify-start px-6 bg-white hover:bg-orange-50 text-gray-800 border shadow-sm">
                        <span className="mr-3 text-2xl">🇬🇧</span> English Bible (NIV)
                    </Button>
                </a>

                <a href="https://www.bible.com/bible/1588/GEN.1.AMP" target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full h-16 text-lg justify-start px-6 bg-white hover:bg-orange-50 text-gray-800 border shadow-sm">
                        <span className="mr-3 text-2xl">📖</span> English Bible (AMP)
                    </Button>
                </a>
            </div>

            <div className="pt-6 border-t mt-6">
                <p className="text-center text-sm text-gray-500 mb-3">Don't have the app?</p>
                <a href="https://www.bible.com/app" target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" className="w-full justify-center">
                        Download YouVersion Bible App
                    </Button>
                </a>
            </div>
        </div>
    );
}
