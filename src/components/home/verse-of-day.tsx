'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ── Curated verse pool (30 verses, one for each day of the month) ──
const VERSES = [
    {
        ref: 'Jeremiah 29:11',
        refAr: 'إرميا 29:11',
        en: '"For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future."',
        ar: 'لأَنِّي أَنَا عَارِفٌ الأَفْكَارَ الَّتِي أَنَا مُفَكِّرٌ بِهَا عَنْكُمْ يَقُولُ الرَّبُّ، أَفْكَارَ سَلاَمٍ لاَ شَرٍّ، لأُعْطِيَكُمْ آخِرَةً وَرَجَاءً.',
        chapter: 'Jeremiah 29',
    },
    {
        ref: 'Psalm 23:1',
        refAr: 'مزمور 23:1',
        en: 'The LORD is my shepherd; I lack nothing.',
        ar: 'الرَّبُّ رَاعِيَّ فَلاَ يُعْوِزُنِي شَيْءٌ.',
        chapter: 'Psalm 23',
    },
    {
        ref: 'John 3:16',
        refAr: 'يوحنا 3:16',
        en: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
        ar: 'لأَنَّهُ هكَذَا أَحَبَّ اللهُ الْعَالَمَ حَتَّى بَذَلَ ابْنَهُ الْوَحِيدَ لِكَيْ لاَ يَهْلِكَ كُلُّ مَنْ يُؤْمِنُ بِهِ بَلْ تَكُونُ لَهُ الْحَيَاةُ الأَبَدِيَّةُ.',
        chapter: 'John 3',
    },
    {
        ref: 'Philippians 4:13',
        refAr: 'فيلبي 4:13',
        en: 'I can do all this through him who gives me strength.',
        ar: 'أَسْتَطِيعُ كُلَّ شَيْءٍ فِي الْمَسِيحِ الَّذِي يُقَوِّينِي.',
        chapter: 'Philippians 4',
    },
    {
        ref: 'Isaiah 40:31',
        refAr: 'إشعياء 40:31',
        en: 'But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
        ar: 'أَمَّا الَّذِينَ يَنْتَظِرُونَ الرَّبَّ فَيَسْتَجِدُّونَ قُوَّةً يَرْفَعُونَ أَجْنِحَةً كَالنُّسُورِ يَرْكُضُونَ وَلاَ يَتْعَبُونَ يَمْشُونَ وَلاَ يُعْيُونَ.',
        chapter: 'Isaiah 40',
    },
    {
        ref: 'Romans 8:28',
        refAr: 'رومية 8:28',
        en: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
        ar: 'وَنَحْنُ نَعْلَمُ أَنَّ كُلَّ الأَشْيَاءِ تَعْمَلُ مَعاً لِلْخَيْرِ لِلَّذِينَ يُحِبُّونَ اللهَ الَّذِينَ هُمْ مَدْعُوُّونَ حَسَبَ قَصْدِهِ.',
        chapter: 'Romans 8',
    },
    {
        ref: 'Proverbs 3:5-6',
        refAr: 'أمثال 3:5-6',
        en: 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
        ar: 'ثِقْ بِالرَّبِّ مِنْ كُلِّ قَلْبِكَ، وَعَلَى فَهْمِكَ لاَ تَتَّكِلْ. فِي كُلِّ طُرُقِكَ اعْتَرِفْ بِهِ فَهُوَ يُقَوِّمُ سُبُلَكَ.',
        chapter: 'Proverbs 3',
    },
    {
        ref: 'Matthew 11:28',
        refAr: 'متى 11:28',
        en: '"Come to me, all you who are weary and burdened, and I will give you rest."',
        ar: 'تَعَالَوْا إِلَيَّ يَا جَمِيعَ الْمُتْعَبِينَ وَالثَّقِيلِي الأَحْمَالِ وَأَنَا أُرِيحُكُمْ.',
        chapter: 'Matthew 11',
    },
    {
        ref: 'Psalm 46:10',
        refAr: 'مزمور 46:10',
        en: '"Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth."',
        ar: 'تَوَقَّفُوا وَاعْلَمُوا أَنِّي أَنَا اللهُ. أَتَعَالَى بَيْنَ الأُمَمِ. أَتَعَالَى فِي الأَرْضِ.',
        chapter: 'Psalm 46',
    },
    {
        ref: '2 Corinthians 5:17',
        refAr: '2 كورنثوس 5:17',
        en: 'Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!',
        ar: 'إِذَنْ إِنْ كَانَ أَحَدٌ فِي الْمَسِيحِ فَهُوَ خَلِيقَةٌ جَدِيدَةٌ. الأَشْيَاءُ الْعَتِيقَةُ قَدْ مَضَتْ هُوَذَا الْكُلُّ قَدْ صَارَ جَدِيداً.',
        chapter: '2 Corinthians 5',
    },
    {
        ref: 'Psalm 119:105',
        refAr: 'مزمور 119:105',
        en: 'Your word is a lamp for my feet, a light on my path.',
        ar: 'كَلاَمُكَ سِرَاجٌ لِرِجْلِي وَنُورٌ لِسَبِيلِي.',
        chapter: 'Psalm 119',
    },
    {
        ref: 'Joshua 1:9',
        refAr: 'يشوع 1:9',
        en: '"Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go."',
        ar: 'أَلَيْسَ قَدْ أَوْصَيْتُكَ تَشَدَّدْ وَتَشَجَّعْ لاَ تَرْهَبْ وَلاَ تَرْتَعِبْ لأَنَّ الرَّبَّ إِلهَكَ مَعَكَ حَيْثُمَا ذَهَبْتَ.',
        chapter: 'Joshua 1',
    },
    {
        ref: 'Ephesians 2:8-9',
        refAr: 'أفسس 2:8-9',
        en: 'For it is by grace you have been saved, through faith — and this is not from yourselves, it is the gift of God — not by works, so that no one can boast.',
        ar: 'لأَنَّكُمْ بِالنِّعْمَةِ مُخَلَّصُونَ بِالإِيمَانِ وَذلِكَ لَيْسَ مِنْكُمْ. هُوَ عَطِيَّةُ اللهِ، لَيْسَ مِنْ أَعْمَالٍ كَيْ لاَ يَفْتَخِرَ أَحَدٌ.',
        chapter: 'Ephesians 2',
    },
    {
        ref: 'Psalm 34:18',
        refAr: 'مزمور 34:18',
        en: 'The LORD is close to the brokenhearted and saves those who are crushed in spirit.',
        ar: 'الرَّبُّ قَرِيبٌ مِنَ الْمُنْكَسِرِي الْقُلُوبِ وَيُخَلِّصُ الْمُتَحَطِّمِينَ فِي الرُّوحِ.',
        chapter: 'Psalm 34',
    },
    {
        ref: 'Galatians 5:22-23',
        refAr: 'غلاطية 5:22-23',
        en: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.',
        ar: 'وَأَمَّا ثَمَرُ الرُّوحِ فَهُوَ: مَحَبَّةٌ فَرَحٌ سَلاَمٌ طُولُ أَنَاةٍ لُطْفٌ صَلاَحٌ إِيمَانٌ وَدَاعَةٌ تَعَفُّفٌ.',
        chapter: 'Galatians 5',
    },
    {
        ref: 'Isaiah 41:10',
        refAr: 'إشعياء 41:10',
        en: '"So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand."',
        ar: 'لاَ تَخَفْ لأَنِّي مَعَكَ لاَ تَتَلَفَّتْ لأَنِّي أَنَا إِلهُكَ. أَنَا أُشَدِّدُكَ وَأُعِينُكَ وَأَعْضُدُكَ بِيَمِينِ بِرِّي.',
        chapter: 'Isaiah 41',
    },
    {
        ref: 'John 14:6',
        refAr: 'يوحنا 14:6',
        en: 'Jesus answered, "I am the way and the truth and the life. No one comes to the Father except through me."',
        ar: 'قَالَ لَهُ يَسُوعُ أَنَا هُوَ الطَّرِيقُ وَالْحَقُّ وَالْحَيَاةُ. لَيْسَ أَحَدٌ يَأْتِي إِلَى الآبِ إِلاَّ بِي.',
        chapter: 'John 14',
    },
    {
        ref: 'Romans 12:2',
        refAr: 'رومية 12:2',
        en: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind.',
        ar: 'وَلاَ تُشَاكِلُوا هذَا الدَّهْرَ بَلْ تَحَوَّلُوا عَنْ شَكْلِكُمْ بِتَجْدِيدِ أَذْهَانِكُمْ.',
        chapter: 'Romans 12',
    },
    {
        ref: 'Psalm 27:1',
        refAr: 'مزمور 27:1',
        en: 'The LORD is my light and my salvation — whom shall I fear? The LORD is the stronghold of my life — of whom shall I be afraid?',
        ar: 'الرَّبُّ نُورِي وَخَلاَصِي مَنْ أَخَافُ؟ الرَّبُّ حِصْنُ حَيَاتِي مَنْ أَرْهَبُ؟',
        chapter: 'Psalm 27',
    },
    {
        ref: 'Hebrews 11:1',
        refAr: 'عبرانيين 11:1',
        en: 'Now faith is confidence in what we hope for and assurance about what we do not see.',
        ar: 'اَلإِيمَانُ هُوَ الثِّقَةُ بِمَا يُرْجَى وَالإِيقَانُ بِأُمُورٍ لاَ تُرَى.',
        chapter: 'Hebrews 11',
    },
    {
        ref: 'Psalm 91:1-2',
        refAr: 'مزمور 91:1-2',
        en: 'Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty. I will say of the LORD, "He is my refuge and my fortress, my God, in whom I trust."',
        ar: 'السَّاكِنُ فِي سِتْرِ الْعَلِيِّ يَبِيتُ فِي ظِلِّ الْقَدِيرِ. أَقُولُ لِلرَّبِّ مَلْجَإِي وَحِصْنِي إِلهِي فَأَتَّكِلُ عَلَيْهِ.',
        chapter: 'Psalm 91',
    },
    {
        ref: '1 John 4:19',
        refAr: '1 يوحنا 4:19',
        en: 'We love because he first loved us.',
        ar: 'نَحْنُ نُحِبُّهُ لأَنَّهُ هُوَ أَحَبَّنَا أَوَّلاً.',
        chapter: '1 John 4',
    },
    {
        ref: 'Psalm 37:4',
        refAr: 'مزمور 37:4',
        en: 'Take delight in the LORD, and he will give you the desires of your heart.',
        ar: 'وَتَلَذَّذْ بِالرَّبِّ فَيُعْطِيَكَ سُؤْلَ قَلْبِكَ.',
        chapter: 'Psalm 37',
    },
    {
        ref: 'Colossians 3:23',
        refAr: 'كولوسي 3:23',
        en: 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.',
        ar: 'وَكُلُّ مَا تَفْعَلُونَ فَاعْمَلُوهُ مِنْ نَفْسٍ كَمَا لِلرَّبِّ لاَ لِلنَّاسِ.',
        chapter: 'Colossians 3',
    },
    {
        ref: 'James 1:2-3',
        refAr: 'يعقوب 1:2-3',
        en: 'Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.',
        ar: 'اِحْسِبُوهُ كُلَّ فَرَحٍ يَا إِخْوَتِي حِينَ تَقَعُونَ فِي تَجَارِبَ مُتَنَوِّعَةٍ عَالِمِينَ أَنَّ امْتِحَانَ إِيمَانِكُمْ يُنْشِئُ صَبْراً.',
        chapter: 'James 1',
    },
    {
        ref: 'Zephaniah 3:17',
        refAr: 'صفنيا 3:17',
        en: 'The LORD your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing.',
        ar: 'الرَّبُّ إِلهُكَ فِي وَسَطِكَ جَبَّارٌ يُخَلِّصُ يَبْتَهِجُ عَلَيْكِ بِفَرَحٍ يُجَدِّدُكِ بِمَحَبَّتِهِ يَبْتَهِجُ عَلَيْكِ بِتَرَنُّمٍ.',
        chapter: 'Zephaniah 3',
    },
    {
        ref: 'Matthew 5:14',
        refAr: 'متى 5:14',
        en: '"You are the light of the world. A town built on a hill cannot be hidden."',
        ar: 'أَنْتُمْ نُورُ الْعَالَمِ. لاَ يُمْكِنُ أَنْ تَخْفَى مَدِينَةٌ مَوْضُوعَةٌ عَلَى جَبَل.',
        chapter: 'Matthew 5',
    },
    {
        ref: 'Deuteronomy 31:6',
        refAr: 'تثنية 31:6',
        en: 'Be strong and courageous. Do not be afraid or terrified because of them, for the LORD your God goes with you; he will never leave you nor forsake you.',
        ar: 'تَشَدَّدُوا وَتَشَجَّعُوا لاَ تَخَافُوا وَلاَ تَرْهَبُوا مِنْهُمْ لأَنَّ الرَّبَّ إِلهَكَ هُوَ السَّائِرُ مَعَكَ لاَ يُهْمِلُكَ وَلاَ يَتْرُكُكَ.',
        chapter: 'Deuteronomy 31',
    },
    {
        ref: 'Lamentations 3:22-23',
        refAr: 'مراثي 3:22-23',
        en: "Because of the LORD's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.",
        ar: 'إِنَّمَا بِرَحَمَاتِ الرَّبِّ أَنَّنَا لَمْ نَفْنَ لأَنَّ مَرَاحِمَهُ لاَ تَزُولُ. هِيَ جَدِيدَةٌ فِي كُلِّ صَبَاحٍ كَثِيرَةٌ أَمَانَتُكَ.',
        chapter: 'Lamentations 3',
    },
    {
        ref: '1 Corinthians 13:13',
        refAr: '1 كورنثوس 13:13',
        en: 'And now these three remain: faith, hope and love. But the greatest of these is love.',
        ar: 'وَالآنَ يَثْبُتُ الإِيمَانُ وَالرَّجَاءُ وَالْمَحَبَّةُ هذِهِ الثَّلاَثَةُ وَلكِنَّ أَعْظَمَهَا الْمَحَبَّةُ.',
        chapter: '1 Corinthians 13',
    },
];

function getTodayVerseIndex() {
    const now = new Date();
    // Use day-of-year so it changes daily
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return dayOfYear % VERSES.length;
}

function formatDate(date: Date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
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

        // Update at midnight
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

    return (
        <div className={`votd-card ${mounted ? 'votd-visible' : 'votd-hidden'}`}>
            {/* Header */}
            <div className="votd-header">
                <div className="votd-header-left">
                    <span className="votd-icon">📖</span>
                    <span className="votd-label">Verse of the Day</span>
                </div>
                <span className="votd-date">{today}</span>
            </div>

            {/* English */}
            <div className="votd-lang-block">
                <span className="votd-lang-badge">English (NIV)</span>
                <blockquote className="votd-verse-en">{verse.en}</blockquote>
                <div className="votd-ref">{verse.ref}</div>
            </div>

            {/* Divider */}
            <div className="votd-divider" />

            {/* Arabic */}
            <div className="votd-lang-block votd-rtl">
                <span className="votd-lang-badge votd-badge-ar">العربية (KJV)</span>
                <blockquote className="votd-verse-ar">{verse.ar}</blockquote>
                <div className="votd-ref votd-ref-ar">{verse.refAr}</div>
            </div>

            {/* Footer */}
            <Link href="/bible" className="votd-read-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                Read Full Chapter
            </Link>
        </div>
    );
}
