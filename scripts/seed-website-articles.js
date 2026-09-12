const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const ARTICLES_URL = 'https://fathersheartministry.ca/articles/';

function absoluteUrl(url) {
  return new URL(url, ARTICLES_URL).toString();
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&mdash;/g, '-')
    .replace(/&ndash;/g, '-')
    .replace(/&nbsp;/g, ' ');
}

function stripTags(value) {
  return decodeEntities(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0',
      'accept-language': 'en-US,en;q=0.9',
    },
  });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.text();
}

function parseArticles(html) {
  const articlePattern = /(\d{4}-\d{2}-\d{2})[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?<a[^>]+href="([^"]+\.pdf)"[^>]*>/gi;
  const articles = [];
  const seen = new Set();
  let match;

  while ((match = articlePattern.exec(html)) !== null) {
    const [, publishedAt, rawTitle, rawSummary, rawLink] = match;
    const linkUrl = absoluteUrl(rawLink);
    if (seen.has(linkUrl)) continue;
    seen.add(linkUrl);
    articles.push({
      title: stripTags(rawTitle),
      summary: stripTags(rawSummary),
      publishedAt,
      linkUrl,
    });
  }

  return articles;
}

function parseScriptArticles(script) {
  const articlePattern = /title:"([^"]+)",description:"([^"]+)",date:"(\d{4}-\d{2}-\d{2})",language:"([^"]+)",pdfPath:"([^"]+\.pdf)"/g;
  const articles = [];
  const seen = new Set();
  let match;

  while ((match = articlePattern.exec(script)) !== null) {
    const [, title, summary, publishedAt, language, rawLink] = match;
    const linkUrl = absoluteUrl(rawLink);
    if (seen.has(linkUrl)) continue;
    seen.add(linkUrl);
    articles.push({
      title: decodeEntities(title),
      summary: decodeEntities(summary),
      publishedAt,
      linkUrl,
      language,
    });
  }

  return articles;
}

function findAssetUrl(html) {
  const match = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
  return match ? absoluteUrl(match[1]) : null;
}

async function upsertArticle(article) {
  const existing = await prisma.article.findFirst({
    where: {
      OR: [
        { linkUrl: article.linkUrl },
        { title: article.title },
      ],
    },
  });

  const data = {
    title: article.title,
    author: article.language === 'Arabic' ? 'FHM Church - Arabic' : 'FHM Church',
    summary: article.summary,
    body: null,
    publishedAt: new Date(`${article.publishedAt}T00:00:00.000Z`),
    imageUrl: null,
    linkUrl: article.linkUrl,
    audienceTeamIds: [],
  };

  if (existing) {
    await prisma.article.update({ where: { id: existing.id }, data });
    return 'updated';
  }

  await prisma.article.create({ data });
  return 'created';
}

async function main() {
  const html = await fetchText(ARTICLES_URL);
  const assetUrl = findAssetUrl(html);
  const scriptArticles = assetUrl ? parseScriptArticles(await fetchText(assetUrl)) : [];
  const articles = scriptArticles.length > 0 ? scriptArticles : parseArticles(html);
  if (articles.length === 0) throw new Error('No articles found on website.');

  let created = 0;
  let updated = 0;

  console.log(`article: found ${articles.length} website articles`);

  for (const article of articles) {
    const result = await upsertArticle(article);
    if (result === 'created') created += 1;
    if (result === 'updated') updated += 1;
    console.log(`article: ${result} ${article.title}`);
  }

  console.log(`article: ${created} created, ${updated} updated`);
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
