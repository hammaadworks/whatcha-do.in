import { HabitState } from "@/lib/enums";
import { ActionNode, Habit } from "@/lib/supabase/types.ts";

export interface ActionNodeWithOriginalIndex extends ActionNode {
  originalIndex?: number;
}

let globalIndexCounter = 0;
const addOriginalIndexRecursively = (
  actions: ActionNodeWithOriginalIndex[]
): ActionNodeWithOriginalIndex[] => {
  return actions.map((action) => {
    const newAction: ActionNodeWithOriginalIndex = {
      ...action,
      originalIndex: globalIndexCounter++
    };
    if (action.children && action.children.length > 0) {
      newAction.children = addOriginalIndexRecursively(action.children);
    }
    return newAction;
  });
};

export const mockActionsData: ActionNodeWithOriginalIndex[] =
  addOriginalIndexRecursively([
    {
      id: "1",
      description: "Complete project proposal",
      completed: false,
      is_public: true,
      completed_at: undefined,
      children: [
        {
          id: "1.1",
          description: "Outline key sections",
          completed: false,
          is_public: true,
          completed_at: undefined
        },
        {
          id: "1.2",
          description: "Gather data",
          completed: false,
          is_public: true,
          completed_at: undefined
        },
        {
          id: "1.3",
          description: "Draft executive summary",
          completed: false,
          is_public: true,
          completed_at: undefined
        }
      ]
    },
    {
      id: "2",
      description: "Buy groceries",
      completed: true,
      is_public: true,
      completed_at: new Date().toISOString(),
      children: [
        {
          id: "2.1",
          description: "Make shopping list",
          completed: true,
          is_public: true,
          completed_at: new Date().toISOString()
        },
        {
          id: "2.2",
          description: "Go to supermarket",
          completed: true,
          is_public: true,
          completed_at: new Date().toISOString()
        }
      ]
    },
    {
      id: "3",
      description: "Plan weekend trip",
      completed: false,
      is_public: true,
      completed_at: undefined
    },
    {
      id: "4",
      description: "Call mom",
      completed: false,
      is_public: true,
      completed_at: undefined
    },
    {
      id: "5",
      description: "Read for 30 minutes",
      completed: true,
      is_public: true,
      completed_at: new Date().toISOString()
    },
    {
      id: "6",
      description: "Go for a run",
      completed: false,
      is_public: true,
      completed_at: undefined
    }
  ]);

export const mockHabitsData: Habit[] = [
  {
    id: "1",
    name: "Read a book",
    streak: 12,
    undo_streak: 11,
    longest_streak: 15,
    undo_longest_streak: 15,
    habit_state: HabitState.TODAY,
    undo_habit_state: HabitState.LIVELY,
    is_public: true,
    user_id: "1",
    junked_date: null,
    undo_junked_date: null,
    completed_date: new Date(),
    undo_completed_date: null,
    processed_date: new Date().toISOString().split("T")[0] as any,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    goal_value: 30,
    goal_unit: "pages"
  },
  {
    id: "2",
    name: "Meditate",
    streak: 5,
    undo_streak: 4,
    longest_streak: 10,
    undo_longest_streak: 10,
    habit_state: HabitState.TODAY,
    undo_habit_state: HabitState.LIVELY,
    is_public: true,
    user_id: "1",
    junked_date: null,
    undo_junked_date: null,
    completed_date: new Date(),
    undo_completed_date: null,
    processed_date: new Date().toISOString().split("T")[0] as any,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    goal_value: 10,
    goal_unit: "minutes"
  },
  {
    id: "3",
    name: "Workout",
    streak: 28,
    undo_streak: 28,
    longest_streak: 28,
    undo_longest_streak: 28,
    habit_state: HabitState.YESTERDAY,
    undo_habit_state: HabitState.YESTERDAY,
    is_public: false,
    user_id: "1",
    junked_date: null,
    undo_junked_date: null,
    completed_date: new Date(Date.now() - 86400000),
    undo_completed_date: new Date(Date.now() - 86400000),
    processed_date: new Date().toISOString().split("T")[0] as any,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    goal_value: null,
    goal_unit: null
  },
  {
    id: "4",
    name: "Learn Spanish",
    streak: 0,
    undo_streak: 0,
    longest_streak: 30,
    undo_longest_streak: 30,
    habit_state: HabitState.LIVELY,
    undo_habit_state: HabitState.LIVELY,
    is_public: true,
    user_id: "1",
    junked_date: null,
    undo_junked_date: null,
    completed_date: null,
    undo_completed_date: null,
    processed_date: new Date().toISOString().split("T")[0] as any,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    goal_value: 1,
    goal_unit: "lesson"
  },
  {
    id: "5",
    name: "Write Journal",
    streak: 0,
    undo_streak: 0,
    longest_streak: 15,
    undo_longest_streak: 15,
    habit_state: HabitState.JUNKED,
    undo_habit_state: HabitState.LIVELY,
    is_public: true,
    user_id: "1",
    junked_date: null,
    undo_junked_date: null,
    completed_date: null,
    undo_completed_date: null,
    processed_date: new Date().toISOString().split("T")[0] as any,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    goal_value: null,
    goal_unit: null
  }
];

export const mockPublicHabitsData: Habit[] = [
  {
    id: "1",
    name: "Read a book",
    streak: 12,
    undo_streak: 12,
    longest_streak: 12,
    undo_longest_streak: 12,
    is_public: true,
    user_id: "1",
    habit_state: HabitState.LIVELY,
    undo_habit_state: HabitState.LIVELY,
    junked_date: null,
    undo_junked_date: null,
    completed_date: new Date(Date.now() - 86400000),
    undo_completed_date: null,
    processed_date: new Date().toISOString().split("T")[0] as any,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    goal_value: 30,
    goal_unit: "pages"
  },
  {
    id: "2",
    name: "Meditate",
    streak: 5,
    undo_streak: 5,
    longest_streak: 5,
    undo_longest_streak: 5,
    is_public: true,
    user_id: "1",
    habit_state: HabitState.LIVELY,
    undo_habit_state: HabitState.LIVELY,
    junked_date: null,
    undo_junked_date: null,
    completed_date: new Date(Date.now() - 86400000),
    undo_completed_date: null,
    processed_date: new Date().toISOString().split("T")[0] as any,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    goal_value: 10,
    goal_unit: "minutes"
  },
  {
    id: "3",
    name: "Learn Spanish",
    streak: 30,
    undo_streak: 30,
    longest_streak: 30,
    undo_longest_streak: 30,
    is_public: true,
    user_id: "1",
    habit_state: HabitState.LIVELY,
    undo_habit_state: HabitState.LIVELY,
    junked_date: null,
    undo_junked_date: null,
    completed_date: new Date(Date.now() - 86400000),
    undo_completed_date: null,
    processed_date: new Date().toISOString().split("T")[0] as any,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    goal_value: 1,
    goal_unit: "lesson"
  }
];

export const mockJournalEntries = [
  {
    id: "1",
    title: "Private Reflections",
    date: "November 23, 2025",
    content: "Your private journal entries will appear here."
  }
];

export const mockPublicJournalEntries = [
  {
    id: "1",
    title: "Reflections on consistency",
    date: "November 22, 2025",
    content:
      "Today was a good day for consistency. Managed to hit all my habits, even the tough ones. Reading for 30 minutes felt especially rewarding. Its becoming easier to get into the flow."
  },
  {
    id: "2",
    title: "New insights from meditation",
    date: "November 21, 2025",
    content:
      "My meditation practice is deepening. Noticing subtle shifts in my thought patterns throughout the day. Its a powerful tool for self-awareness. Also, the Spanish lesson was tough today, but I pushed through."
  }
];
