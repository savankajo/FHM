'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Extracted from verse-of-day.tsx to keep logic consistent
const NIV_VERSION = 111;
const ARABIC_VERSION = 3;

function bibleUrl(version: number, book: string, chapter: number, verse: number) {
    return `https://www.bible.com/bible/${version}/${book}.${chapter}.${verse}`;
}

const VERSES = [
    {
        ref: 'Jeremiah 29:11', refAr: 'إرميا 29:11',
        book: 'JER', chapter: 29, verse: 11,
        en: '"For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future."',
        ar: 'لأَنِّي أَنَا عَارِفٌ الأَفْكَارَ الَّتِي أَنَا مُفَكِّرٌ بِهَا عَنْكُمْ يَقُولُ الرَّبُّ، أَفْكَارَ سَلاَمٍ لاَ شَرٍّ، لأُعْطِيَكُمْ آخِرَةً وَرَجَاءً.',
    },
    {
        ref: 'Psalm 23:1', refAr: 'مزمور 23:1',
        book: 'PSA', chapter: 23, verse: 1,
        en: 'The LORD is my shepherd; I lack nothing.',
        ar: 'الرَّبُّ رَاعِيَّ فَلاَ يُعْوِزُنِي شَيْءٌ.',
    },
    {
        ref: 'John 3:16', refAr: 'يوحنا 3:16',
        book: 'JHN', chapter: 3, verse: 16,
        en: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
        ar: 'لأَنَّهُ هكَذَا أَحَبَّ اللهُ الْعَالَمَ حَتَّى بَذَلَ ابْنَهُ الْوَحِيدَ لِكَيْ لاَ يَهْلِكَ كُلُّ مَنْ يُؤْمِنُ بِهِ بَلْ تَكُونُ لَهُ الْحَيَاةُ الأَبَدِيَّةُ.',
    },
    {
        ref: 'Philippians 4:13', refAr: 'فيلبي 4:13',
        book: 'PHP', chapter: 4, verse: 13,
        en: 'I can do all this through him who gives me strength.',
        ar: 'أَسْتَطِيعُ كُلَّ شَيْءٍ فِي الْمَسِيحِ الَّذِي يُقَوِّينِي.',
    },
    {
        ref: 'Isaiah 40:31', refAr: 'إشعياء 40:31',
        book: 'ISA', chapter: 40, verse: 31,
        en: 'But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
        ar: 'أَمَّا الَّذِينَ يَنْتَظِرُونَ الرَّبَّ فَيَسْتَجِدُّونَ قُوَّةً يَرْفَعُونَ أَجْنِحَةً كَالنُّسُورِ يَرْكُضُونَ وَلاَ يَتْعَبُونَ يَمْشُونَ وَلاَ يُعْيُونَ.',
    },
    {
        ref: 'Romans 8:28', refAr: 'رومية 8:28',
        book: 'ROM', chapter: 8, verse: 28,
        en: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
        ar: 'وَنَحْنُ نَعْلَمُ أَنَّ كُلَّ الأَشْيَاءِ تَعْمَلُ مَعاً لِلْخَيْرِ لِلَّذِينَ يُحِبُّونَ اللهَ الَّذِينَ هُمْ مَدْعُوُّونَ حَسَبَ قَصْدِهِ.',
    },
    {
        ref: 'Proverbs 3:5-6', refAr: 'أمثال 3:5-6',
        book: 'PRO', chapter: 3, verse: 5,
        en: 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
        ar: 'ثِقْ بِالرَّبِّ مِنْ كُلِّ قَلْبِكَ، وَعَلَى فَهْمِكَ لاَ تَتَّكِلْ. فِي كُلِّ طُرُقِكَ اعْتَرِفْ بِهِ فَهُوَ يُقَوِّمُ سُبُلَكَ.',
    },
    {
        ref: 'Matthew 11:28', refAr: 'متى 11:28',
        book: 'MAT', chapter: 11, verse: 28,
        en: '"Come to me, all you who are weary and burdened, and I will give you rest."',
        ar: 'تَعَالَوْا إِلَيَّ يَا جَمِيعَ الْمُتْعَبِينَ وَالثَّقِيلِي الأَحْمَالِ وَأَنَا أُرِيحُكُمْ.',
    },
    {
        ref: 'Psalm 46:10', refAr: 'مزمور 46:10',
        book: 'PSA', chapter: 46, verse: 10,
        en: '"Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth."',
        ar: 'تَوَقَّفُوا وَاعْلَمُوا أَنِّي أَنَا اللهُ. أَتَعَالَى بَيْنَ الأُمَمِ. أَتَعَالَى فِي الأَرْضِ.',
    },
    {
        ref: '2 Corinthians 5:17', refAr: '2 كورنثوس 5:17',
        book: '2CO', chapter: 5, verse: 17,
        en: 'Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!',
        ar: 'إِذَنْ إِنْ كَانَ أَحَدٌ فِي الْمَسِيحِ فَهُوَ خَلِيقَةٌ جَدِيدَةٌ. الأَشْيَاءُ الْعَتِيقَةُ قَدْ مَضَتْ هُوَذَا الْكُلُّ قَدْ صَارَ جَدِيداً.',
    },
    {
        ref: 'Psalm 119:105', refAr: 'مزمور 119:105',
        book: 'PSA', chapter: 119, verse: 105,
        en: 'Your word is a lamp for my feet, a light on my path.',
        ar: 'كَلاَمُكَ سِرَاجٌ لِرِجْلِي وَنُورٌ لِسَبِيلِي.',
    },
    {
        ref: 'Joshua 1:9', refAr: 'يشوع 1:9',
        book: 'JOS', chapter: 1, verse: 9,
        en: '"Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go."',
        ar: 'أَلَيْسَ قَدْ أَوْصَيْتُكَ تَشَدَّدْ وَتَشَجَّعْ لاَ تَرْهَبْ وَلاَ تَرْتَعِبْ لأَنَّ الرَّبَّ إِلهَكَ مَعَكَ حَيْثُمَا ذَهَبْتَ.',
    },
];

export default function FavoritesPage() {
    const [likedIndices, setLikedIndices] = useState<number[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('fhm_liked_verses');
        if (saved) {
            try {
                setLikedIndices(JSON.parse(saved));
            } catch (e) {
                console.error("Error loading favorites", e);
            }
        }
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="profile-page min-h-screen pb-20">
            {/* Header */}
            <header className="page-header sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100">
                <Link href="/profile" className="page-back-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                </Link>
                <h1 className="page-title">My Favorites</h1>
            </header>

            <div className="px-5 py-6">
                {likedIndices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                        <span className="text-6xl mb-6">❤️</span>
                        <h2 className="text-xl font-bold text-gray-900">No liked verses yet</h2>
                        <p className="text-sm mt-1">Tap the heart on any Verse of the Day to save it here.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {likedIndices.map(index => {
                            const v = VERSES[index % VERSES.length];
                            const url = bibleUrl(NIV_VERSION, v.book, v.chapter, v.verse);
                            return (
                                <div key={index} className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 p-6 space-y-4">
                                    <div className="space-y-3">
                                        <blockquote className="text-base font-medium text-gray-800 leading-relaxed italic">
                                            "{v.en.replace(/^"|"$/g, '')}"
                                        </blockquote>
                                        <div className="text-xs font-bold text-primary uppercase tracking-wider">{v.ref} (NIV)</div>
                                    </div>

                                    <div className="h-px bg-gray-100 w-full" />

                                    <div className="space-y-3 text-right">
                                        <blockquote className="text-lg font-bold text-gray-900 leading-relaxed dir-rtl" style={{ direction: 'rtl' }}>
                                            {v.ar}
                                        </blockquote>
                                        <div className="text-xs font-bold text-primary uppercase tracking-wider">{v.refAr}</div>
                                    </div>

                                    <div className="pt-2 flex justify-end">
                                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-gray-400 hover:text-primary transition-colors flex items-center gap-1">
                                            Read on Bible.com ↗
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
