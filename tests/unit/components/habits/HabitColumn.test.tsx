import { render, screen } from '@testing-library/react';
import { HabitColumn } from '@/components/habits/HabitColumn';
import { Habit } from '@/lib/supabase/types';

// Mock dnd-kit
jest.mock('@dnd-kit/core', () => ({
    useDroppable: jest.fn().mockReturnValue({ setNodeRef: jest.fn() }),
}));
jest.mock('@dnd-kit/sortable', () => ({
    SortableContext: ({ children }: any) => <div data-testid="sortable-context">{children}</div>,
    rectSortingStrategy: {},
}));
// Mock SortableHabit
jest.mock('@/components/habits/SortableHabit', () => ({
    SortableHabit: ({ children }: any) => <div data-testid="sortable-habit">{children}</div>,
}));

describe('HabitColumn', () => {
    const mockHabits: Habit[] = [
        { id: '1', name: 'Habit 1' } as Habit,
    ];

    it('should render title and habits', () => {
        render(
            <HabitColumn 
                id="col-1" 
                title="My Column" 
                habits={mockHabits} 
                renderHabit={(h) => <span>{h.name}</span>}
            />
        );

        expect(screen.getByText('My Column')).toBeInTheDocument();
        expect(screen.getByText('Habit 1')).toBeInTheDocument();
        expect(screen.getByTestId('sortable-context')).toBeInTheDocument();
    });

    it('should render empty message when no habits', () => {
        render(
            <HabitColumn 
                id="col-1" 
                title="My Column" 
                habits={[]} 
                renderHabit={() => null}
                emptyMessage="Nothing here"
            />
        );

        expect(screen.getByText('Nothing here')).toBeInTheDocument();
    });
});
