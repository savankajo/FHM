const fs = require('fs');
const path = require('path');
const sourceDir = path.join(process.cwd(), '.tmp-avd', 'usfm');
const outputFile = path.join(process.cwd(), 'src', 'data', 'avd.json');
const escapeHtml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const clean = value => value.replace(/\\f\s[\s\S]*?\\f\*/g, '').replace(/\\x\s[\s\S]*?\\x\*/g, '').replace(/\\(?:w|add|nd|qt|wj)\s+([^\\]*?)(?:\|[^\\]*)?\\(?:w|add|nd|qt|wj)\*/g, '$1').replace(/\\[a-z0-9]+\*?/gi, '').replace(/\s+/g, ' ').trim();
const books = fs.readdirSync(sourceDir).filter(name => name.endsWith('.usfm')).sort().map(file => {
  const raw = fs.readFileSync(path.join(sourceDir, file), 'utf8').replace(/^\uFEFF/, '');
  const id = raw.match(/^\\id\s+([^\s]+)/m)?.[1];
  const name = clean(raw.match(/^\\toc2\s+(.+)$/m)?.[1] || raw.match(/^\\h\s+(.+)$/m)?.[1] || id);
  const nameLong = clean(raw.match(/^\\toc1\s+(.+)$/m)?.[1] || name);
  if (!id) throw new Error(`Missing id in ${file}`);
  const chapters = raw.split(/(?=^\\c\s+\d+)/m).slice(1).map(part => {
    const number = part.match(/^\\c\s+(\d+)/)?.[1];
    const matches = [...part.matchAll(/^\\v\s+(\d+[a-z]?(?:-\d+)?)\s+([\s\S]*?)(?=^\\v\s+\d|^\\c\s+\d|(?![\s\S]))/gm)];
    const verses = matches.map(match => ({ number: match[1], text: clean(match[2]) })).filter(verse => verse.text);
    return { id: `${id}.${number}`, number, reference: `${name} ${number}`, content: verses.map(verse => `<span class="verse-span" data-verse-id="${id}.${number}.${verse.number}"><span class="v">${verse.number}</span>${escapeHtml(verse.text)}</span>`).join(' '), copyright: 'Arabic Van Dyck Bible — Public Domain', verseCount: verses.length };
  });
  return { id, name, nameLong, chapters };
});
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify({ books }));
console.log(`Wrote ${books.length} AVD books`);
