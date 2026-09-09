export type PublishedArabicArticle = {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  author: string;
  imageUrl?: string;
  sourceUrl: string;
};

// Source: https://fathersheartministry.ca/articles (published Arabic tab, verified 2026-09-08).
// The source publishes these as PDF-only articles; sourceUrl preserves the complete published body and download destination.
export const PUBLISHED_ARABIC_ARTICLES: readonly PublishedArabicArticle[] = [
  { id: 'divine-peace-ar', title: 'السلام الإلهي (شالوم)', summary: 'تحليل عميق للسلام الإلهي الذي يفوق كل عقل وكيفية التماد في الإيمان ونضج النفس.', publishedAt: '2026-04-04', author: 'FHM Church', sourceUrl: 'https://fathersheartministry.ca/articles/divine_peace_ar.pdf' },
  { id: 'the-mind-ar', title: 'الذهن', summary: 'فهم كيفية عمل الذهن كبوابة للحياة وكيف يريد الله تغييره بصور من كلمته.', publishedAt: '2026-04-03', author: 'FHM Church', sourceUrl: 'https://fathersheartministry.ca/articles/the_mind_ar.pdf' },
  { id: 'soul-salvation-3-ar', title: 'خلاص النفس - الجزء الثالث', summary: 'دراسة حول كيفية تأثير الذهن المجدد على بركات الرب وازدهار الحياة الروحية.', publishedAt: '2026-04-02', author: 'FHM Church', sourceUrl: 'https://fathersheartministry.ca/articles/soul_salvation_3_ar.pdf' },
  { id: 'soul-salvation-2-ar', title: 'خلاص النفس - الجزء الثاني', summary: 'أهمية تجديد الذهن وكيفية السير في شركة يومية مع الروح القدس.', publishedAt: '2026-04-01', author: 'FHM Church', sourceUrl: 'https://fathersheartministry.ca/articles/soul_salvation_2_ar.pdf' },
  { id: 'soul-salvation-1-ar', title: 'خلاص النفس - الجزء الأول', summary: 'فهم حقيقة النفس وكيفية نضجها الروحي بعد تجربة الولادة الجديدة.', publishedAt: '2026-03-31', author: 'FHM Church', sourceUrl: 'https://fathersheartministry.ca/articles/soul_salvation_1_ar.pdf' },
];
