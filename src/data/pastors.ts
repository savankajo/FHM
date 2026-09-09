export type Pastor = {
  id: string;
  role: string;
  name: string;
  initials: string;
  imageUrl: string | null;
  sortOrder: number;
};

export const PASTOR_PROFILE_IDS = ['peter-ramsis', 'liliane-ramsis'] as const;

export const DEFAULT_PASTORS: readonly Pastor[] = [
  { id: 'peter-ramsis', role: 'Senior Pastor', name: 'Peter Ramsis', initials: 'PR', imageUrl: null, sortOrder: 1 },
  { id: 'liliane-ramsis', role: 'Women’s Pastor', name: 'Liliane Ramsis', initials: 'LR', imageUrl: null, sortOrder: 2 },
];

export function pastorInitials(name: string) {
  const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  return initials || 'FHM';
}
