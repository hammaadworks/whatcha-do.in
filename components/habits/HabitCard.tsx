import React, { useState } from 'react';
import EditHabitModal from './EditHabitModal'; // Import the modal component

interface HabitCardProps {
  habit: {
    id: string;
    name: string;
    is_public: boolean;
    pile_state: string; // Add pile_state to habit interface
    current_streak: number; // Add current_streak
    last_streak: number; // Add last_streak
    goal_value?: number | null; // Add goal_value
    goal_unit?: string | null; // Add goal_unit
  };
  onHabitUpdated: (
    habitId: string,
    name: string,
    isPublic: boolean,
    goalValue?: number | null,
    goalUnit?: string | null
  ) => void; // New prop for handling updates
  onHabitDeleted: (habitId: string) => void; // New prop for handling deletion
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onHabitUpdated, onHabitDeleted }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSave = (
    habitId: string,
    name: string,
    isPublic: boolean,
    goalValue?: number | null,
    goalUnit?: string | null
  ) => {
    onHabitUpdated(habitId, name, isPublic, goalValue, goalUnit);
  };

  const handleDeleteClick = () => {
    if (window.confirm(`Are you sure you want to delete the habit "${habit.name}"? This action cannot be undone.`)) {
      onHabitDeleted(habit.id);
    }
  };

  // Determine if the habit is in "The Pile" based on pile_state
  // Assuming 'junked' and 'lively' are states that represent "The Pile"
  const isInThePile = habit.pile_state === 'junked' || habit.pile_state === 'lively';

  return (
    <div className="p-4 border rounded-lg shadow-sm flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <span className="text-[var(--font-size-lg)] font-medium">{habit.name}</span>
        {habit.goal_value !== undefined && habit.goal_value !== null && habit.goal_unit && (
          <span className="text-[var(--font-size-sm)] text-muted-foreground">
            ({habit.goal_value} {habit.goal_unit})
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {habit.current_streak > 0 && (
          <span className="inline-flex items-center rounded-full bg-primary px-2 py-1 text-[var(--font-size-xs)] font-medium text-primary-foreground">
            🔥 {habit.current_streak}
          </span>
        )}
        {habit.last_streak > 0 && (
          <span className="text-[var(--font-size-xs)] text-muted-foreground">
            Last: {habit.last_streak}
          </span>
        )}
        <span className="text-[var(--font-size-sm)] text-muted-foreground">
          {habit.is_public ? 'Public' : 'Private'}
        </span>
        {isInThePile && (
          <button onClick={handleDeleteClick} className="p-2 rounded-full hover:bg-destructive/10 text-destructive">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 01-2 0v6a1 1 0 112 0V8z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        <button onClick={handleEditClick} className="p-2 rounded-full hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-6.707 6.707l-2.829 2.829-.793.793 2.829 2.829.793-.793 2.829-2.829-2.829-2.829z" />
          </svg>
        </button>
      </div>
      <EditHabitModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        habit={habit}
        onSave={handleSave}
      />
    </div>
  );
};

export default HabitCard;
