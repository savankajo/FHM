import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BiblePage() {
    return (
        <div className="content-shell">
            <header className="page-header">
                <Link href="/" className="page-back-btn" aria-label="Back to Home">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </Link>
                <div>
                    <h1 className="page-title">Bible Versions</h1>
                    <p className="page-kicker">Choose a translation</p>
                </div>
            </header>

            <div className="space-y-4 max-w-lg mx-auto">
                <a href="https://www.bible.com/bible/13/GEN.1.NAV" target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full h-16 text-lg justify-start px-6 bg-white hover:bg-orange-50 text-gray-800 border shadow-sm">
                        <span className="mr-3 text-2xl">AR</span> Arabic Bible (NAV)
                    </Button>
                </a>

                <a href="https://www.bible.com/bible/111/GEN.1.NIV" target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full h-16 text-lg justify-start px-6 bg-white hover:bg-orange-50 text-gray-800 border shadow-sm">
                        <span className="mr-3 text-2xl">EN</span> English Bible (NIV)
                    </Button>
                </a>

                <a href="https://www.bible.com/bible/1588/GEN.1.AMP" target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full h-16 text-lg justify-start px-6 bg-white hover:bg-orange-50 text-gray-800 border shadow-sm">
                        <span className="mr-3 text-2xl">AMP</span> English Bible (AMP)
                    </Button>
                </a>
            </div>

            <div className="pt-6 border-t mt-6 max-w-lg mx-auto">
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
