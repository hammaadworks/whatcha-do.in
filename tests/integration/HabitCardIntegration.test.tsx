import { render, screen, waitFor, fireEvent } from './test-utils';
import PrivatePage from '@/components/profile/PrivatePage.tsx';
import { PublicUserDisplay, Habit } from '@/lib/supabase/types';
import { User } from '@supabase/supabase-js';
import { HabitChipPrivate } from '@/components/habits/HabitChipPrivate'; // Import HabitChipPrivate for isolated test

// Mock the next/navigation notFound function
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

// Mock the PublicPage component
jest.mock('@/components/profile/PublicPage.tsx', () => ({
  PublicProfileView: jest.fn(({ user }) => (
    <div data-testid="public-profile-view">Public Profile for {user?.username}</div>
  )),
}));

// Mock EditHabitModal at the top level
// This mock will now keep track of its calls
const mockEditHabitModal = jest.fn(({ isOpen, onClose, habit, onSave }) =>
  isOpen ? (
    <div data-testid="edit-habit-modal">
      Edit Modal for {habit.name}
      <button onClick={onClose}>Close</button>
      <button onClick={() => onSave(habit.id, 'New Name', true)}>Save</button>
    </div>
  ) : null
);

jest.mock('@/components/habits/EditHabitModal', () => ({
  __esModule: true,
  default: mockEditHabitModal,
}));

const mockAuthenticatedUser: User & { username?: string } = {
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  role: 'authenticated',
  user_metadata: {},
};

const mockPublicUserDisplay: PublicUserDisplay = {
  id: 'test-user-id',
  username: 'testuser',
  bio: 'This is a test bio.',
};

describe('HabitChipPrivate Integration in PrivatePage', () => {
  // Subtask 4.2: Write a test to ensure a `HabitChipPrivate` is rendered within 'The Pile' when `PrivatePage` is viewed.
  // Subtask 4.3: Write a test to verify the mock content ('Sample Habit', '0' streak) is displayed in the `HabitChipPrivate`.
  test('should render a HabitChipPrivate with mock content within "The Pile" for the owner', async () => {
    const mockHabitInPile: Habit = {
      id: 'habit-in-pile-1',
      name: 'Sample Habit',
      is_public: true,
      pile_state: 'lively',
      current_streak: 0,
      last_streak: 0,
      goal_value: null,
      goal_unit: null,
      user_id: 'test-user-id',
      created_at: new Date().toISOString(),
      junked_at: null,
      updated_at: new Date().toISOString(),
    };

        render(

          <PrivatePage 

            username="testuser" 

            initialProfileUser={mockPublicUserDisplay} 

            publicActions={[]} 

            publicHabits={[]} 

            publicJournalEntries={[]} 

            publicIdentities={[]} 

            publicTargets={[]}

          />,

        );

    

        // Check for "The Pile" heading

        expect(screen.getByRole('heading', { name: /The Pile/i })).toBeInTheDocument();

    

        // Check for the mock HabitChipPrivate content

        expect(screen.getByText(mockHabitInPile.name)).toBeInTheDocument();

        expect(screen.queryByText(`🔥 ${mockHabitInPile.current_streak}`)).not.toBeInTheDocument(); // Expect absence of streak badge for 0 streak

        expect(screen.getByText('🌐')).toBeInTheDocument(); // Public icon for mock habit

      });

    

      // Subtask 4.4: (New) Write a test to verify the `HabitChipPrivate` applies theme-aware styling correctly (e.g., by checking CSS classes or computed styles for light/dark modes).

      test('HabitChipPrivate should apply dark mode styling when theme is dark', async () => {

        render(

          <PrivatePage 

            username="testuser" 

            initialProfileUser={mockPublicUserDisplay} 

            publicActions={[]} 

            publicHabits={[]} 

            publicJournalEntries={[]} 

            publicIdentities={[]} 

            publicTargets={[]}

          />,

        );

    

        const habitCard = screen.getByText('Sample Habit').closest('div');

        expect(habitCard).toBeInTheDocument();

        expect(document.body).toHaveClass('dark');

      });

    

      test('HabitChipPrivate should apply light mode styling when theme is light', async () => {

        render(

          <PrivatePage 

            username="testuser" 

            initialProfileUser={mockPublicUserDisplay} 

            publicActions={[]} 

            publicHabits={[]} 

            publicJournalEntries={[]}

            publicIdentities={[]}

            publicTargets={[]} 

          />,

        );

    

        const habitCard = screen.getByText('Sample Habit').closest('div');

        expect(habitCard).toBeInTheDocument();

        expect(document.body).not.toHaveClass('dark');

      });

    

      // Subtask 4.6: (New) Write a test to verify privacy icons are displayed correctly for public/private habits.

      test('should display public icon for public habit', async () => {

            render(

              <PrivatePage 

                username="testuser" 

                initialProfileUser={mockPublicUserDisplay} 

                publicActions={[]} 

                publicHabits={[]} 

                publicJournalEntries={[]} 

                publicIdentities={[]}

                publicTargets={[]}

              />,

            );

            expect(screen.getByText('🌐')).toBeInTheDocument();

        expect(screen.queryByText('🔒')).not.toBeInTheDocument();

      });

    });

    

    describe('HabitChipPrivate component (isolated tests)', () => {

      const mockHabit: Habit = {

        id: 'habit-1',

        name: 'Sample Habit',

        is_public: true,

        pile_state: 'lively',

        current_streak: 10,

        last_streak: 5,

        goal_value: 30,

        goal_unit: 'minutes',

        user_id: 'test-user-id',

        created_at: new Date().toISOString(),

        junked_at: null, // Added missing property

        updated_at: new Date().toISOString(), // Added missing property

      };

    

      const mockOnHabitCompleted = jest.fn();

    

      beforeEach(() => {

        mockEditHabitModal.mockClear(); // Clear mock calls before each test in this describe block

        mockOnHabitCompleted.mockClear();

      });

    

        it('should display private icon for private habit', () => {

    

          const privateHabit = { ...mockHabit, is_public: false, name: 'Private Habit' };

    

          render(

    

            <HabitChipPrivate

    

              habit={privateHabit}

    

              onHabitUpdated={jest.fn()}

    

              onHabitDeleted={jest.fn()}

    

              onHabitCompleted={jest.fn()}

    

            />

    

          );

    

          expect(screen.getByText('🔒')).toBeInTheDocument();

    

          expect(screen.queryByText('🌐')).not.toBeInTheDocument();

    

        });

    

        it('should display public icon for public habit', () => {

    

          render(

    

            <HabitChipPrivate

    

              habit={mockHabit}

    

              onHabitUpdated={jest.fn()}

    

              onHabitDeleted={jest.fn()}

    

              onHabitCompleted={jest.fn()}

    

            />

    

          );

    

          expect(screen.getByText('🌐')).toBeInTheDocument();

    

          expect(screen.queryByText('🔒')).not.toBeInTheDocument();

    

        });

    

        it('should display goal value and unit if present', () => {

    

          render(

    

            <HabitChipPrivate

    

              habit={mockHabit}

    

              onHabitUpdated={jest.fn()}

    

              onHabitDeleted={jest.fn()}

    

              onHabitCompleted={jest.fn()}

    

            />

    

          );

    

          expect(screen.getByText('(30 minutes)')).toBeInTheDocument();

    

        });

    

      

    

      it('should display goal value and unit if goal_value is 0', () => {

        const habitWithZeroGoal = { ...mockHabit, goal_value: 0, goal_unit: 'times' };

        render(

          <HabitChipPrivate

            habit={habitWithZeroGoal}

            onHabitUpdated={jest.fn()}

            onHabitDeleted={jest.fn()}

            onHabitCompleted={mockOnHabitCompleted}

          />

        );

        expect(screen.getByText('(0 times)')).toBeInTheDocument();

      });

    

        it('should display current streak if it is 1', () => {

    

          const habitOneStreak = { ...mockHabit, current_streak: 1 };

    

          render(

    

            <HabitChipPrivate

    

              habit={habitOneStreak}

    

              onHabitUpdated={jest.fn()}

    

              onHabitDeleted={jest.fn()}

    

              onHabitCompleted={jest.fn()}

    

            />

    

          );

    

          expect(screen.getByText('🔥 1')).toBeInTheDocument();

    

        });

    

      

    

        it('should not show delete button if habit is in "yesterday" pile state', () => {

    

      

    

          const mockOnHabitUpdated = jest.fn();

    

      

    

          const mockOnHabitDeleted = jest.fn();

    

      

    

          const habitNotInPile = { ...mockHabit, pile_state: 'yesterday' };

    

      

    

          render(

    

      

    

            <HabitChipPrivate

    

      

    

              habit={habitNotInPile}

    

      

    

              onHabitUpdated={mockOnHabitUpdated}

    

      

    

              onHabitDeleted={mockOnHabitDeleted}

    

      

    

              onHabitCompleted={jest.fn()}

    

      

    

            />

    

      

    

          );

    

      

    

          expect(screen.queryByTitle('Delete Habit')).not.toBeInTheDocument();

    

      

    

        });

    

      

    

      

    

      it('should show delete button if habit is in "junked" pile state', () => {

        const mockOnHabitUpdated = jest.fn();

        const mockOnHabitDeleted = jest.fn();

        const habitInPile = { ...mockHabit, pile_state: 'junked' };

        render(

          <HabitChipPrivate

            habit={habitInPile}

            onHabitUpdated={mockOnHabitUpdated}

            onHabitDeleted={mockOnHabitDeleted}

            onHabitCompleted={mockOnHabitCompleted}

          />

        );

        expect(screen.getByTitle('Delete Habit')).toBeInTheDocument();

      });

    

      it('should not display current streak if 0', () => {

        const habitNoStreak = { ...mockHabit, current_streak: 0 };

        render(

          <HabitChipPrivate

            habit={habitNoStreak}

            onHabitUpdated={jest.fn()}

            onHabitDeleted={jest.fn()}

            onHabitCompleted={mockOnHabitCompleted}

          />

        );

        expect(screen.queryByText('🔥 0')).not.toBeInTheDocument(); // Expect not to display '🔥 0'

      });

    

      it('should display streak badge with correct styling when streak > 0', () => {

        render(

          <HabitChipPrivate

            habit={mockHabit} // current_streak: 10

            onHabitUpdated={jest.fn()}

            onHabitDeleted={jest.fn()}

            onHabitCompleted={mockOnHabitCompleted}

          />

        );

        const streakBadge = screen.getByText('🔥 10');

        expect(streakBadge).toBeInTheDocument();

        expect(streakBadge).toHaveClass('inline-flex');

        expect(streakBadge).toHaveClass('items-center');

        expect(streakBadge).toHaveClass('rounded-full');

        expect(streakBadge).toHaveClass('px-2.5');

        expect(streakBadge).toHaveClass('py-0.5');

        expect(streakBadge).toHaveClass('text-xs');

        expect(streakBadge).toHaveClass('font-bold');

        expect(streakBadge).toHaveClass('leading-none');

        expect(streakBadge).toHaveClass('bg-[--primary]');

        expect(streakBadge).toHaveClass('text-[--primary-fg]');

      });

    

      it('should call onHabitUpdated when edit button is clicked and modal saves', async () => {

        const mockOnHabitUpdated = jest.fn();

        render(

          <HabitChipPrivate

            habit={mockHabit}

            onHabitUpdated={mockOnHabitUpdated}

            onHabitDeleted={jest.fn()}

            onHabitCompleted={mockOnHabitCompleted}

          />

        );

    

        const editButton = screen.getByTitle('Edit Habit');

        fireEvent.click(editButton);

    

        const saveButton = screen.getByText('Save'); // Find save button in the mock modal

        fireEvent.click(saveButton); // Click save

    

        expect(mockOnHabitUpdated).toHaveBeenCalledWith(mockHabit.id, 'New Name', true);

      });

    

      it('should call onHabitDeleted when delete button is clicked and confirmed', async () => {

        const mockOnHabitUpdated = jest.fn(); // Declare mockOnHabitUpdated here

        const mockOnHabitDeleted = jest.fn();

        const habitInPile = { ...mockHabit, pile_state: 'lively' }; // Make it deletable

        render(

          <HabitChipPrivate

            habit={habitInPile}

            onHabitUpdated={mockOnHabitUpdated}

            onHabitDeleted={mockOnHabitDeleted}

            onHabitCompleted={mockOnHabitCompleted}

          />

        );

    

        const deleteButton = screen.getByTitle('Delete Habit');

        jest.spyOn(window, 'confirm').mockReturnValue(true);

    

        fireEvent.click(deleteButton);

        expect(window.confirm).toHaveBeenCalledWith(`Are you sure you want to delete the habit "${habitInPile.name}"? This action cannot be undone.`);

        expect(mockOnHabitUpdated).toHaveBeenCalledTimes(0);

        expect(mockOnHabitDeleted).toHaveBeenCalledWith(habitInPile.id);

    

        (window.confirm as jest.Mock).mockRestore(); // Restore original confirm

      });

    

      it('should not call onHabitDeleted when delete button is clicked and cancelled', async () => {

        const mockOnHabitUpdated = jest.fn();

        const mockOnHabitDeleted = jest.fn();

        const habitInPile = { ...mockHabit, pile_state: 'lively' };

        render(

          <HabitChipPrivate

            habit={habitInPile}

            onHabitUpdated={mockOnHabitUpdated}

            onHabitDeleted={mockOnHabitDeleted}

            onHabitCompleted={mockOnHabitCompleted}

          />

        );

    

        const deleteButton = screen.getByTitle('Delete Habit');

        jest.spyOn(window, 'confirm').mockReturnValue(false); // User cancels

    

        fireEvent.click(deleteButton);

        expect(window.confirm).toHaveBeenCalledWith(`Are you sure you want to delete the habit "${habitInPile.name}"? This action cannot be undone.`);

        expect(mockOnHabitUpdated).toHaveBeenCalledTimes(0);

        expect(mockOnHabitDeleted).toHaveBeenCalledTimes(0);

    

        (window.confirm as jest.Mock).mockRestore();

      });

    

      it('should not show delete button if habit is not in "The Pile"', () => {

        const mockOnHabitUpdated = jest.fn();

        const mockOnHabitDeleted = jest.fn();

        const habitNotInPile = { ...mockHabit, pile_state: 'today' }; // Not lively or junked

        render(

          <HabitChipPrivate

            habit={habitNotInPile}

            onHabitUpdated={mockOnHabitUpdated}

            onHabitDeleted={mockOnHabitDeleted}

            onHabitCompleted={mockOnHabitCompleted}

          />

        );

        expect(screen.queryByTitle('Delete Habit')).not.toBeInTheDocument();

      });

    

      it('should open EditHabitModal when edit button is clicked', () => {

        render(

          <HabitChipPrivate

            habit={mockHabit}

            onHabitUpdated={jest.fn()}

            onHabitDeleted={jest.fn()}

            onHabitCompleted={mockOnHabitCompleted}

          />

        );

    

        const editButton = screen.getByTitle('Edit Habit');

        fireEvent.click(editButton);

    

        // Expect the mocked EditHabitModal component to have been rendered with isOpen true

        // We check the last call to the mock

        const lastCall = mockEditHabitModal.mock.calls[mockEditHabitModal.mock.calls.length - 1];

        expect(lastCall[0]).toMatchObject(expect.objectContaining({ isOpen: true, habit: mockHabit }));

        expect(screen.getByTestId('edit-habit-modal')).toBeInTheDocument();

        expect(screen.getByText(`Edit Modal for ${mockHabit.name}`)).toBeInTheDocument();

      });

    });

    