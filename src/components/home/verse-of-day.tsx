'use client';

import { useState, useEffect } from 'react';

const NIV_VERSION = 111;
const ARABIC_VERSION = 3;

function bibleUrl(version: number, book: string, chapter: number, verse: number) {
    return `https://www.bible.com/bible/${version}/${book}.${chapter}.${verse}`;
}

// Unsplash CDN helper — stable, no API key needed
function unsplash(id: string) {
    return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;
}

// Nature photo themes (reliably-existing Unsplash photo IDs)
const SUNRISE = unsplash('1470252649378-9c29740c9fa8'); // sunrise over lake & mountains
const MEADOW = unsplash('1500534314209-a25ddb2bd429'); // green open meadow
const OCEAN = unsplash('1505118380757-91f5f5632de0'); // deep ocean aerial
const MOUNTAIN = unsplash('1464822759023-fed622ff2c3b'); // rocky mountain peak
const SKY = unsplash('1534274988757-a28bf1a57c17'); // clouds from above
const FOREST = unsplash('1448375240586-882707db888b'); // sunlit forest path
const LAKE = unsplash('1506905925346-21bda4d32df4'); // mountain lake reflection
const BLOSSOM = unsplash('1490750967868-88df5691cc1c'); // cherry blossoms
const STARS = unsplash('1451188502541-13943edb6acf'); // milky way starry night
const WATER = unsplash('1482938289607-e9573fc25ebb'); // waterfall in forest
const BEACH = unsplash('1507525428034-b723cf961d3e'); // tropical beach sunset
const CANYON = unsplash('1469474968028-56623f02e42e'); // grand canyon golden hour

// ── 30 curated verses ──
const VERSES = [
    {
        ref: 'Jeremiah 29:11', refAr: 'إرميا 29:11',
        book: 'JER', chapter: 29, verse: 11, bg: SUNRISE,
        en: '"For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future."',
        ar: 'لأَنِّي أَنَا عَارِفٌ الأَفْكَارَ الَّتِي أَنَا مُفَكِّرٌ بِهَا عَنْكُمْ يَقُولُ الرَّبُّ، أَفْكَارَ سَلاَمٍ لاَ شَرٍّ، لأُعْطِيَكُمْ آخِرَةً وَرَجَاءً.',
    },
    {
        ref: 'Psalm 23:1', refAr: 'مزمور 23:1',
        book: 'PSA', chapter: 23, verse: 1, bg: MEADOW,
        en: 'The LORD is my shepherd; I lack nothing.',
        ar: 'الرَّبُّ رَاعِيَّ فَلاَ يُعْوِزُنِي شَيْءٌ.',
    },
    {
        ref: 'John 3:16', refAr: 'يوحنا 3:16',
        book: 'JHN', chapter: 3, verse: 16, bg: OCEAN,
        en: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
        ar: 'لأَنَّهُ هكَذَا أَحَبَّ اللهُ الْعَالَمَ حَتَّى بَذَلَ ابْنَهُ الْوَحِيدَ لِكَيْ لاَ يَهْلِكَ كُلُّ مَنْ يُؤْمِنُ بِهِ بَلْ تَكُونُ لَهُ الْحَيَاةُ الأَبَدِيَّةُ.',
    },
    {
        ref: 'Philippians 4:13', refAr: 'فيلبي 4:13',
        book: 'PHP', chapter: 4, verse: 13, bg: MOUNTAIN,
        en: 'I can do all this through him who gives me strength.',
        ar: 'أَسْتَطِيعُ كُلَّ شَيْءٍ فِي الْمَسِيحِ الَّذِي يُقَوِّينِي.',
    },
    {
        ref: 'Isaiah 40:31', refAr: 'إشعياء 40:31',
        book: 'ISA', chapter: 40, verse: 31, bg: SKY,
        en: 'But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
        ar: 'أَمَّا الَّذِينَ يَنْتَظِرُونَ الرَّبَّ فَيَسْتَجِدُّونَ قُوَّةً يَرْفَعُونَ أَجْنِحَةً كَالنُّسُورِ يَرْكُضُونَ وَلاَ يَتْعَبُونَ يَمْشُونَ وَلاَ يُعْيُونَ.',
    },
    {
        ref: 'Romans 8:28', refAr: 'رومية 8:28',
        book: 'ROM', chapter: 8, verse: 28, bg: SUNRISE,
        en: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
        ar: 'وَنَحْنُ نَعْلَمُ أَنَّ كُلَّ الأَشْيَاءِ تَعْمَلُ مَعاً لِلْخَيْرِ لِلَّذِينَ يُحِبُّونَ اللهَ الَّذِينَ هُمْ مَدْعُوُّونَ حَسَبَ قَصْدِهِ.',
    },
    {
        ref: 'Proverbs 3:5-6', refAr: 'أمثال 3:5-6',
        book: 'PRO', chapter: 3, verse: 5, bg: FOREST,
        en: 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
        ar: 'ثِقْ بِالرَّبِّ مِنْ كُلِّ قَلْبِكَ، وَعَلَى فَهْمِكَ لاَ تَتَّكِلْ. فِي كُلِّ طُرُقِكَ اعْتَرِفْ بِهِ فَهُوَ يُقَوِّمُ سُبُلَكَ.',
    },
    {
        ref: 'Matthew 11:28', refAr: 'متى 11:28',
        book: 'MAT', chapter: 11, verse: 28, bg: LAKE,
        en: '"Come to me, all you who are weary and burdened, and I will give you rest."',
        ar: 'تَعَالَوْا إِلَيَّ يَا جَمِيعَ الْمُتْعَبِينَ وَالثَّقِيلِي الأَحْمَالِ وَأَنَا أُرِيحُكُمْ.',
    },
    {
        ref: 'Psalm 46:10', refAr: 'مزمور 46:10',
        book: 'PSA', chapter: 46, verse: 10, bg: LAKE,
        en: '"Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth."',
        ar: 'تَوَقَّفُوا وَاعْلَمُوا أَنِّي أَنَا اللهُ. أَتَعَالَى بَيْنَ الأُمَمِ. أَتَعَالَى فِي الأَرْضِ.',
    },
    {
        ref: '2 Corinthians 5:17', refAr: '2 كورنثوس 5:17',
        book: '2CO', chapter: 5, verse: 17, bg: BLOSSOM,
        en: 'Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!',
        ar: 'إِذَنْ إِنْ كَانَ أَحَدٌ فِي الْمَسِيحِ فَهُوَ خَلِيقَةٌ جَدِيدَةٌ. الأَشْيَاءُ الْعَتِيقَةُ قَدْ مَضَتْ هُوَذَا الْكُلُّ قَدْ صَارَ جَدِيداً.',
    },
    {
        ref: 'Psalm 119:105', refAr: 'مزمور 119:105',
        book: 'PSA', chapter: 119, verse: 105, bg: STARS,
        en: 'Your word is a lamp for my feet, a light on my path.',
        ar: 'كَلاَمُكَ سِرَاجٌ لِرِجْلِي وَنُورٌ لِسَبِيلِي.',
    },
    {
        ref: 'Joshua 1:9', refAr: 'يشوع 1:9',
        book: 'JOS', chapter: 1, verse: 9, bg: MOUNTAIN,
        en: '"Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go."',
        ar: 'أَلَيْسَ قَدْ أَوْصَيْتُكَ تَشَدَّدْ وَتَشَجَّعْ لاَ تَرْهَبْ وَلاَ تَرْتَعِبْ لأَنَّ الرَّبَّ إِلهَكَ مَعَكَ حَيْثُمَا ذَهَبْتَ.',
    },
    {
        ref: 'Ephesians 2:8-9', refAr: 'أفسس 2:8-9',
        book: 'EPH', chapter: 2, verse: 8, bg: SUNRISE,
        en: 'For it is by grace you have been saved, through faith — and this is not from yourselves, it is the gift of God — not by works, so that no one can boast.',
        ar: 'لأَنَّكُمْ بِالنِّعْمَةِ مُخَلَّصُونَ بِالإِيمَانِ وَذلِكَ لَيْسَ مِنْكُمْ. هُوَ عَطِيَّةُ اللهِ، لَيْسَ مِنْ أَعْمَالٍ كَيْ لاَ يَفْتَخِرَ أَحَدٌ.',
    },
    {
        ref: 'Psalm 34:18', refAr: 'مزمور 34:18',
        book: 'PSA', chapter: 34, verse: 18, bg: FOREST,
        en: 'The LORD is close to the brokenhearted and saves those who are crushed in spirit.',
        ar: 'الرَّبُّ قَرِيبٌ مِنَ الْمُنْكَسِرِي الْقُلُوبِ وَيُخَلِّصُ الْمُتَحَطِّمِينَ فِي الرُّوحِ.',
    },
    {
        ref: 'Galatians 5:22-23', refAr: 'غلاطية 5:22-23',
        book: 'GAL', chapter: 5, verse: 22, bg: MEADOW,
        en: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.',
        ar: 'وَأَمَّا ثَمَرُ الرُّوحِ فَهُوَ: مَحَبَّةٌ فَرَحٌ سَلاَمٌ طُولُ أَنَاةٍ لُطْفٌ صَلاَحٌ إِيمَانٌ وَدَاعَةٌ تَعَفُّفٌ.',
    },
    {
        ref: 'Isaiah 41:10', refAr: 'إشعياء 41:10',
        book: 'ISA', chapter: 41, verse: 10, bg: MOUNTAIN,
        en: '"So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand."',
        ar: 'لاَ تَخَفْ لأَنِّي مَعَكَ لاَ تَتَلَفَّتْ لأَنِّي أَنَا إِلهُكَ. أَنَا أُشَدِّدُكَ وَأُعِينُكَ وَأَعْضُدُكَ بِيَمِينِ بِرِّي.',
    },
    {
        ref: 'John 14:6', refAr: 'يوحنا 14:6',
        book: 'JHN', chapter: 14, verse: 6, bg: FOREST,
        en: 'Jesus answered, "I am the way and the truth and the life. No one comes to the Father except through me."',
        ar: 'قَالَ لَهُ يَسُوعُ أَنَا هُوَ الطَّرِيقُ وَالْحَقُّ وَالْحَيَاةُ. لَيْسَ أَحَدٌ يَأْتِي إِلَى الآبِ إِلاَّ بِي.',
    },
    {
        ref: 'Romans 12:2', refAr: 'رومية 12:2',
        book: 'ROM', chapter: 12, verse: 2, bg: SKY,
        en: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind.',
        ar: 'وَلاَ تُشَاكِلُوا هذَا الدَّهْرَ بَلْ تَحَوَّلُوا عَنْ شَكْلِكُمْ بِتَجْدِيدِ أَذْهَانِكُمْ.',
    },
    {
        ref: 'Psalm 27:1', refAr: 'مزمور 27:1',
        book: 'PSA', chapter: 27, verse: 1, bg: BEACH,
        en: 'The LORD is my light and my salvation — whom shall I fear? The LORD is the stronghold of my life — of whom shall I be afraid?',
        ar: 'الرَّبُّ نُورِي وَخَلاَصِي مَنْ أَخَافُ؟ الرَّبُّ حِصْنُ حَيَاتِي مَنْ أَرْهَبُ؟',
    },
    {
        ref: 'Hebrews 11:1', refAr: 'عبرانيين 11:1',
        book: 'HEB', chapter: 11, verse: 1, bg: STARS,
        en: 'Now faith is confidence in what we hope for and assurance about what we do not see.',
        ar: 'اَلإِيمَانُ هُوَ الثِّقَةُ بِمَا يُرْجَى وَالإِيقَانُ بِأُمُورٍ لاَ تُرَى.',
    },
    {
        ref: 'Psalm 91:1-2', refAr: 'مزمور 91:1-2',
        book: 'PSA', chapter: 91, verse: 1, bg: FOREST,
        en: 'Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty. I will say of the LORD, "He is my refuge and my fortress, my God, in whom I trust."',
        ar: 'السَّاكِنُ فِي سِتْرِ الْعَلِيِّ يَبِيتُ فِي ظِلِّ الْقَدِيرِ. أَقُولُ لِلرَّبِّ مَلْجَإِي وَحِصْنِي إِلهِي فَأَتَّكِلُ عَلَيْهِ.',
    },
    {
        ref: '1 John 4:19', refAr: '1 يوحنا 4:19',
        book: '1JN', chapter: 4, verse: 19, bg: BLOSSOM,
        en: 'We love because he first loved us.',
        ar: 'نَحْنُ نُحِبُّهُ لأَنَّهُ هُوَ أَحَبَّنَا أَوَّلاً.',
    },
    {
        ref: 'Psalm 37:4', refAr: 'مزمور 37:4',
        book: 'PSA', chapter: 37, verse: 4, bg: WATER,
        en: 'Take delight in the LORD, and he will give you the desires of your heart.',
        ar: 'وَتَلَذَّذْ بِالرَّبِّ فَيُعْطِيَكَ سُؤْلَ قَلْبِكَ.',
    },
    {
        ref: 'Colossians 3:23', refAr: 'كولوسي 3:23',
        book: 'COL', chapter: 3, verse: 23, bg: SUNRISE,
        en: 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.',
        ar: 'وَكُلُّ مَا تَفْعَلُونَ فَاعْمَلُوهُ مِنْ نَفْسٍ كَمَا لِلرَّبِّ لاَ لِلنَّاسِ.',
    },
    {
        ref: 'James 1:2-3', refAr: 'يعقوب 1:2-3',
        book: 'JAS', chapter: 1, verse: 2, bg: CANYON,
        en: 'Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.',
        ar: 'اِحْسِبُوهُ كُلَّ فَرَحٍ يَا إِخْوَتِي حِينَ تَقَعُونَ فِي تَجَارِبَ مُتَنَوِّعَةٍ عَالِمِينَ أَنَّ امْتِحَانَ إِيمَانِكُمْ يُنْشِئُ صَبْراً.',
    },
    {
        ref: 'Zephaniah 3:17', refAr: 'صفنيا 3:17',
        book: 'ZEP', chapter: 3, verse: 17, bg: SKY,
        en: 'The LORD your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing.',
        ar: 'الرَّبُّ إِلهُكَ فِي وَسَطِكِ جَبَّارٌ يُخَلِّصُ يَبْتَهِجُ عَلَيْكِ بِفَرَحٍ يُجَدِّدُكِ بِمَحَبَّتِهِ يَبْتَهِجُ عَلَيْكِ بِتَرَنُّمٍ.',
    },
    {
        ref: 'Matthew 5:14', refAr: 'متى 5:14',
        book: 'MAT', chapter: 5, verse: 14, bg: BEACH,
        en: '"You are the light of the world. A town built on a hill cannot be hidden."',
        ar: 'أَنْتُمْ نُورُ الْعَالَمِ. لاَ يُمْكِنُ أَنْ تَخْفَى مَدِينَةٌ مَوْضُوعَةٌ عَلَى جَبَل.',
    },
    {
        ref: 'Deuteronomy 31:6', refAr: 'تثنية 31:6',
        book: 'DEU', chapter: 31, verse: 6, bg: CANYON,
        en: 'Be strong and courageous. Do not be afraid or terrified because of them, for the LORD your God goes with you; he will never leave you nor forsake you.',
        ar: 'تَشَدَّدُوا وَتَشَجَّعُوا لاَ تَخَافُوا وَلاَ تَرْهَبُوا مِنْهُمْ لأَنَّ الرَّبَّ إِلهَكَ هُوَ السَّائِرُ مَعَكَ لاَ يُهْمِلُكَ وَلاَ يَتْرُكُكَ.',
    },
    {
        ref: 'Lamentations 3:22-23', refAr: 'مراثي 3:22-23',
        book: 'LAM', chapter: 3, verse: 22, bg: SUNRISE,
        en: "Because of the LORD's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.",
        ar: 'إِنَّمَا بِرَحَمَاتِ الرَّبِّ أَنَّنَا لَمْ نَفْنَ لأَنَّ مَرَاحِمَهُ لاَ تَزُولُ. هِيَ جَدِيدَةٌ فِي كُلِّ صَبَاحٍ كَثِيرَةٌ أَمَانَتُكَ.',
    },
    {
        ref: '1 Corinthians 13:13', refAr: '1 كورنثوس 13:13',
        book: '1CO', chapter: 13, verse: 13, bg: OCEAN,
        en: 'And now these three remain: faith, hope and love. But the greatest of these is love.',
        ar: 'وَالآنَ يَثْبُتُ الإِيمَانُ وَالرَّجَاءُ وَالْمَحَبَّةُ هذِهِ الثَّلاَثَةُ وَلكِنَّ أَعْظَمَهَا الْمَحَبَّةُ.',
    },
];

function getTodayVerseIndex() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return dayOfYear % VERSES.length;
}

function formatDate(date: Date) {
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function VerseOfTheDayCard() {
    const [mounted, setMounted] = useState(false);
    const [verseIndex, setVerseIndex] = useState(0);
    const [today, setToday] = useState('');

    useEffect(() => {
        setVerseIndex(getTodayVerseIndex());
        setToday(formatDate(new Date()));
        setMounted(true);

        const now = new Date();
        const msUntilMidnight =
            new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
        const timer = setTimeout(() => {
            setVerseIndex(getTodayVerseIndex());
            setToday(formatDate(new Date()));
        }, msUntilMidnight);
        return () => clearTimeout(timer);
    }, []);

    const verse = VERSES[verseIndex];
    const enUrl = bibleUrl(NIV_VERSION, verse.book, verse.chapter, verse.verse);
    const arUrl = bibleUrl(ARABIC_VERSION, verse.book, verse.chapter, verse.verse);

    return (
        <div className="votd-wrap">
            <div
                className={`votd-card ${mounted ? 'votd-visible' : 'votd-hidden'}`}
                style={{ backgroundImage: `url(${verse.bg})` }}
            >
                <div className="votd-overlay" />

                <div className="votd-content text-center">
                    {/* ── English Verse ── */}
                    <div className="px-4">
                        <blockquote className="votd-verse-en">
                            "{verse.en.replace(/^"|"$/g, '')}"
                        </blockquote>
                        <div className="votd-ref">{verse.ref} (NIV)</div>
                    </div>

                    <div className="votd-divider" />

                    {/* ── Arabic Verse ── */}
                    <div className="px-4">
                        <blockquote className="votd-verse-ar">{verse.ar}</blockquote>
                        <div className="votd-ref">{verse.refAr}</div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="votd-footer">
                    <div className="votd-actions">
                        <button className="votd-action-link">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                            Like
                        </button>
                        <button className="votd-action-link">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                            Share
                        </button>
                    </div>

                    <a href={enUrl} target="_blank" rel="noopener noreferrer" className="votd-read-link">
                        Read Full Chapter
                    </a>
                </div>
            </div>
        </div>
    );
}

