// lib/mock-data.ts

import { Habit, ActionNode } from './supabase/types';

export interface ActionNodeWithOriginalIndex extends ActionNode {
    originalIndex?: number;
}

let globalIndexCounter = 0;

const addOriginalIndexRecursively = (actions: ActionNodeWithOriginalIndex[]): ActionNodeWithOriginalIndex[] => {
    return actions.map((action) => {
        const newAction: ActionNodeWithOriginalIndex = {...action, originalIndex: globalIndexCounter++};
        if (action.children && action.children.length > 0) {
            newAction.children = addOriginalIndexRecursively(action.children);
        }
        return newAction;
    });
};

export const mockActionsData: ActionNodeWithOriginalIndex[] = addOriginalIndexRecursively([
  { id: "1", description: "Complete project proposal", completed: false, is_public: true, completed_at: undefined, children: [
      { id: "1.1", description: "Outline key sections", completed: false, is_public: true, completed_at: undefined },
      { id: "1.2", description: "Gather data", completed: false, is_public: true, completed_at: undefined },
      { id: "1.3", description: "Draft executive summary", completed: false, is_public: true, completed_at: undefined },
    ]
  },
  { id: "2", description: "Buy groceries", completed: true, is_public: true, completed_at: new Date().toISOString(), children: [
      { id: "2.1", description: "Make shopping list", completed: true, is_public: true, completed_at: new Date().toISOString() },
      { id: "2.2", description: "Go to supermarket", completed: true, is_public: true, completed_at: new Date().toISOString() },
    ]
  },
  { id: "3", description: "Plan weekend trip", completed: false, is_public: true, completed_at: undefined },
  { id: "4", description: "Call mom", completed: false, is_public: true, completed_at: undefined },
  { id: "5", description: "Read for 30 minutes", completed: true, is_public: true, completed_at: new Date().toISOString() },
  { id: "6", description: "Go for a run", completed: false, is_public: true, completed_at: undefined }
]);

export const mockHabitsData: Habit[] = [
  {
    id: '1',
    name: 'Read a book',
    current_streak: 12,
    pile_state: 'today',
    is_public: true,
    user_id: '1',
    last_streak: 10,
    junked_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    goal_value: 30,
    goal_unit: 'pages'
  }, {
    id: '2',
    name: 'Meditate',
    current_streak: 5,
    pile_state: 'today',
    is_public: true,
    user_id: '1',
    last_streak: 5,
    junked_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    goal_value: 10,
    goal_unit: 'minutes'
  }, {
    id: '3',
    name: 'Workout',
    current_streak: 28,
    pile_state: 'yesterday',
    is_public: false,
    user_id: '1',
    last_streak: 28,
    junked_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    goal_value: null,
    goal_unit: null
  }, {
    id: '4',
    name: 'Learn Spanish',
    current_streak: 0,
    pile_state: 'lively',
    is_public: true,
    user_id: '1',
    last_streak: 30,
    junked_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    goal_value: 1,
    goal_unit: 'lesson'
  }, {
    id: '5',
    name: 'Write Journal',
    current_streak: 0,
    pile_state: 'junked',
    is_public: true,
    user_id: '1',
    last_streak: 15,
    junked_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    goal_value: null,
    goal_unit: null
  },
];

export const mockPublicActionsData: ActionNodeWithOriginalIndex[] = addOriginalIndexRecursively([
  { id: "1", description: "Finish the weekly report", completed: false, is_public: true, completed_at: undefined, children: [
      { id: "1.1", description: "Collect sales figures", completed: false, is_public: true, completed_at: undefined },
      { id: "1.2", description: "Summarize marketing efforts", completed: false, is_public: true, completed_at: undefined },
    ]
  },
  { id: "2", description: "Schedule a dentist appointment", completed: true, is_public: true, completed_at: new Date().toISOString() },
  { id: "3", description: "Go for a 30-minute run", completed: false, is_public: true, completed_at: undefined },
  { id: "4", description: "Read a chapter of 'Atomic Habits'", completed: false, is_public: true, completed_at: undefined, children: [
      { id: "4.1", description: "Identify key takeaways", completed: false, is_public: true, completed_at: undefined },
    ]
  },
  { id: "5", description: "Plan meals for the week", completed: true, is_public: true, completed_at: new Date().toISOString() },
  { id: "6", description: "Water the plants", completed: false, is_public: true, completed_at: undefined },
]);

export const mockPublicHabitsData: Habit[] = [
  { id: '1', name: 'Read a book', current_streak: 12, is_public: true, user_id: '1', last_streak: 10, pile_state: 'active', junked_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), goal_value: 30, goal_unit: 'pages' },
  { id: '2', name: 'Meditate', current_streak: 5, is_public: true, user_id: '1', last_streak: 5, pile_state: 'active', junked_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), goal_value: 10, goal_unit: 'minutes' },
  { id: '3', name: 'Learn Spanish', current_streak: 30, is_public: true, user_id: '1', last_streak: 20, pile_state: 'active', junked_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), goal_value: 1, goal_unit: 'lesson' },
];

export const mockJournalEntries = [
  {
    id: '1',
    title: 'Private Reflections',
    date: 'November 23, 2025',
    content: 'Your private journal entries will appear here.',
  },
];

export const mockPublicJournalEntries = [
  {
    id: '1',
    title: 'Reflections on consistency',
    date: 'November 22, 2025',
    content: 'Today was a good day for consistency. Managed to hit all my habits, even the tough ones. Reading for 30 minutes felt especially rewarding. Its becoming easier to get into the flow.',
  },
  {
    id: '2',
    title: 'New insights from meditation',
    date: 'November 21, 2025',
    content: 'My meditation practice is deepening. Noticing subtle shifts in my thought patterns throughout the day. Its a powerful tool for self-awareness. Also, the Spanish lesson was tough today, but I pushed through.',
  },
];
