import { createHash } from 'crypto';

export type ModerationCategory =
  | 'abuse'
  | 'hate'
  | 'sexual'
  | 'threats'
  | 'violence'
  | 'self-harm'
  | 'scams';

export type TextModerationResult = {
  allowed: boolean;
  categories: ModerationCategory[];
  contentHash: string;
};

const LEET_MAP: Record<string, string> = {
  '0': 'o', '1': 'i', '2': 'z', '3': 'e', '4': 'a', '5': 's', '6': 'g', '7': 't', '8': 'b', '9': 'g',
};

const RULES: Array<{ category: ModerationCategory; patterns: RegExp[] }> = [
  {
    category: 'threats',
    patterns: [
      /\b(kill|murder|shoot|stab|bomb|hurt)\s*(you|him|her|them|everyone)\b/,
      /\b(i(?:'| a)?m going to|i will|we will|gonna)\s*(kill|murder|shoot|stab|hurt)\b/,
      /\bdeath threat\b/,
      /(?:^|\s)اقتل(ك|ه|ها|هم)?(?:$|\s)/u,
    ],
  },
  {
    category: 'self-harm',
    patterns: [/\b(kys|kill yourself|go die|end your life)\b/, /(?:^|\s)انتحر(?:$|\s)/u],
  },
  {
    category: 'hate',
    patterns: [
      /\b(n[i1]gg(?:er|a)|f[a4]gg?ot|k[i1]ke|ch[i1]nk|sp[i1]c)\b/,
      /\b(kill|ban|remove|hate)\s+all\s+(jews?|muslims?|christians?|blacks?|whites?|asians?|arabs?|gays?|women|men)\b/,
      /\b(white|racial)\s+supremac(?:y|ist)\b/,
      /(?:^|\s)عنصري(?:ة)?(?:$|\s)/u,
    ],
  },
  {
    category: 'sexual',
    patterns: [
      /\b(porn(?:ography|ographic)?|nudes?|naked pics?|sex video|explicit sex|rape)\b/,
      /\b(child|minor|underage)\s+(porn|nudes?|sex)\b/,
      /\b(xxx|onlyfans leak)\b/,
      /(?:^|\s)(?:اباحي|إباحي|عاهرة)(?:$|\s)/u,
    ],
  },
  {
    category: 'violence',
    patterns: [/\b(behead(?:ing)?|gore video|mass shooting|terrorist attack instructions)\b/, /(?:^|\s)قطع الرأس(?:$|\s)/u],
  },
  {
    category: 'abuse',
    patterns: [
      /\b(worthless|subhuman|piece of (?:shit|trash))\b/,
      /\b(i hate you|nobody wants you|you should die)\b/,
      /\bf+u+c+k+(?:ing|er|ed)?\b/,
      /\b(b+i+t+c+h+|a+s+s+h+o+l+e+|dumbass|piece of shit)\b/,
      /\b(?:you(?:'re| are)?|u r)\s+(?:an?\s+)?(?:idiot|moron|stupid|trash|loser|bitch|asshole)\b/,
      /\bharass(?:ment|ing)?|bully(?:ing)?\b/,
      /(?:^|\s)(?:كسمك|يا\s+(?:غبي|أحمق|احمق|كلب|حيوان))(?:$|\s)/u,
    ],
  },
  {
    category: 'scams',
    patterns: [
      /\b(send|wire|transfer)\s+(me\s+)?(?:money|bitcoin|crypto).{0,24}\b(guaranteed|double|urgent)\b/,
      /\bguaranteed\s+(crypto|investment)\s+(return|profit)\b/,
      /\bpassword|verification code\b.{0,20}\b(send|share|reply)\b/,
    ],
  },
];

function normalizeForModeration(value: string) {
  const unicode = value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const mapped = unicode.replace(/[0-9]/g, character => LEET_MAP[character] || character);
  const repeated = mapped.replace(/([a-z])\1{2,}/g, '$1');
  const tokens = repeated.replace(/[^\p{L}\p{N}]+/gu, ' ').replace(/\s+/g, ' ').trim();
  const spaced = tokens.replace(/\b(?:[a-z]\s+){2,}[a-z]\b/g, sequence => sequence.replace(/\s+/g, ''));
  const compact = spaced.replace(/\s+/g, '');
  return { spaced, compact };
}

export function hashModeratedContent(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export function moderateText(value: string): TextModerationResult {
  if (typeof value !== 'string') {
    return { allowed: false, categories: ['abuse'], contentHash: hashModeratedContent(String(value)) };
  }

  const trimmed = value.trim();
  const { spaced, compact } = normalizeForModeration(trimmed);
  const categories = new Set<ModerationCategory>();

  for (const rule of RULES) {
    if (rule.patterns.some(pattern => pattern.test(spaced) || pattern.test(compact))) {
      categories.add(rule.category);
    }
  }

  return {
    allowed: categories.size === 0,
    categories: [...categories],
    contentHash: hashModeratedContent(trimmed),
  };
}
