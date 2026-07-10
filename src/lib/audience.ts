export function audienceIds(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
}

export function canSeeAudience(value: unknown, userTeamIds: string[], isAdmin = false): boolean {
  if (isAdmin) return true;
  const restrictedTo = audienceIds(value);
  return restrictedTo.length === 0 || restrictedTo.some(id => userTeamIds.includes(id));
}
