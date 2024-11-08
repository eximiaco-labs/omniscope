export const STAT_COLORS = {
  consulting: '#F59E0B',
  handsOn: '#8B5CF6',
  squad: '#3B82F6',
  internal: '#10B981',
} as const;

export type StatType = keyof typeof STAT_COLORS; 