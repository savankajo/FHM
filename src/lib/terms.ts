export const CURRENT_TERMS_VERSION = '2026-08-31';
export const CURRENT_TERMS_EFFECTIVE_DATE = 'August 31, 2026';

export function hasAcceptedCurrentTerms(version: string | null | undefined) {
  return version === CURRENT_TERMS_VERSION;
}
