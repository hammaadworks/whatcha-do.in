export interface Insight {
  id: string;
  title: string;
  value: string;
  description: string;
}

export const insights: Insight[] = [
  {
    id: '1',
    title: '🏆 Longest Streak',
    value: '90 days',
    description: 'Current best is a 90 day streak!',
  },
  {
    id: '2',
    title: '✅ Habits Mastered',
    value: '15',
    description: 'Has 15 habits they\'re tracking.',
  },
  {
    id: '3',
    title: '🗓️ Member For',
    value: '1 year',
    description: 'Joined 1 year ago.',
  },
  {
    id: '4',
    title: '✍️ Public Journal Entries',
    value: '50',
    description: 'Shared 50 thoughts with the community.',
  },
  {
    id: '5',
    title: '🔥 Current Hot Streak',
    value: 'Reading, 30 days',
    description: 'On fire with the Reading habit, currently at 30 days!',
  },
  {
    id: '6',
    title: '📈 Total Progress Made',
    value: '1,205 steps',
    description: 'Has taken 1,205 steps towards their goals.',
  },
  {
    id: '7',
    title: '🎯 Public Goals Tracked',
    value: '5',
    description: 'Is publicly committed to 5 goals.',
  },
];
