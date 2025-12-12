'use client';

import React, { useState, useEffect } from 'react';
import { Habit } from '@/lib/supabase/types';
import { updateHabit } from '@/lib/supabase/habit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { backdateHabitCompletion } from '@/lib/supabase/habit'; // This will be a new function we create
import { useSystemTime } from '@/components/providers/SystemTimeProvider';

interface HabitDebugPanelProps {
    habits: Habit[];
    onHabitUpdated: () => void;
}

const HabitDebugPanel: React.FC<HabitDebugPanelProps> = ({ habits, onHabitUpdated }) => {
    const { simulatedDate } = useSystemTime();
    const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
    const [localHabitState, setLocalHabitState] = useState<Partial<Habit>>({});
    
    const initialDate = simulatedDate 
        ? simulatedDate.toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0];
        
    const [backdateCompletionDate, setBackdateCompletionDate] = useState<string>(initialDate);

    // Update backdate picker when time travel changes
    useEffect(() => {
        if (simulatedDate) {
            setBackdateCompletionDate(simulatedDate.toISOString().split('T')[0]);
        }
    }, [simulatedDate]);

    const selectedHabit = habits.find(h => h.id === selectedHabitId);

    useEffect(() => {
        if (selectedHabit) {
            setLocalHabitState({
                name: selectedHabit.name,
                is_public: selectedHabit.is_public,
                current_streak: selectedHabit.current_streak,
                pile_state: selectedHabit.pile_state,
                // Add other editable fields here if needed
            });
        } else {
            setLocalHabitState({});
        }
    }, [selectedHabit]);

    const handleFieldChange = (field: keyof Habit, value: any) => {
        setLocalHabitState(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!selectedHabitId) {
            toast.error("No habit selected.");
            return;
        }

        try {
            await updateHabit(selectedHabitId, localHabitState);
            toast.success("Habit updated successfully!");
            onHabitUpdated(); // Notify parent to refresh habits
        } catch (error) {
            console.error("Error updating habit:", error);
            toast.error("Failed to update habit.");
        }
    };

    const handleBackdateCompletion = async () => {
        if (!selectedHabitId) {
            toast.error("No habit selected for backdating.");
            return;
        }
        if (!backdateCompletionDate) {
            toast.error("Please select a date for backdating.");
            return;
        }

        try {
            const completionDate = new Date(backdateCompletionDate);
            await backdateHabitCompletion(selectedHabitId, completionDate);
            toast.success(`Habit marked as completed on ${backdateCompletionDate}`);
            onHabitUpdated(); // Refresh habits to reflect potential changes
        } catch (error) {
            console.error("Error backdating habit completion:", error);
            toast.error("Failed to backdate habit completion.");
        }
    };

    return (
        <div className="mt-8 p-4 border border-red-500/50 bg-red-500/5 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-red-400">DEV MODE: Habit Debug Panel</h3>

            <div className="mb-4">
                <Label htmlFor="habit-select" className="block text-sm font-medium text-gray-300 mb-1">Select Habit:</Label>
                <Select onValueChange={setSelectedHabitId} value={selectedHabitId || ""}>
                    <SelectTrigger id="habit-select" className="w-full bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Choose a habit" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        {habits.map((habit) => (
                            <SelectItem key={habit.id} value={habit.id}>
                                {habit.name} (ID: {habit.id.substring(0, 4)}...)
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {selectedHabit && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="habit-name" className="block text-sm font-medium text-gray-300 mb-1">Name:</Label>
                        <Input
                            id="habit-name"
                            value={localHabitState.name || ''}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white"
                        />
                    </div>
                    <div>
                        <Label htmlFor="habit-pile-state" className="block text-sm font-medium text-gray-300 mb-1">Pile State:</Label>
                        <Select
                            value={localHabitState.pile_state || ''}
                            onValueChange={(value) => handleFieldChange('pile_state', value)}
                        >
                            <SelectTrigger id="habit-pile-state" className="w-full bg-gray-800 border-gray-700 text-white">
                                <SelectValue placeholder="Select pile state" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                <SelectItem value="today">today</SelectItem>
                                <SelectItem value="yesterday">yesterday</SelectItem>
                                <SelectItem value="pile">pile</SelectItem>
                                <SelectItem value="lively">lively</SelectItem>
                                <SelectItem value="junked">junked</SelectItem>
                                <SelectItem value="active">active</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="habit-current-streak" className="block text-sm font-medium text-gray-300 mb-1">Current Streak:</Label>
                        <Input
                            id="habit-current-streak"
                            type="number"
                            value={localHabitState.current_streak?.toString() || '0'}
                            onChange={(e) => handleFieldChange('current_streak', parseInt(e.target.value))}
                            className="bg-gray-800 border-gray-700 text-white"
                        />
                    </div>
                    <div>
                        <Label htmlFor="habit-is-public" className="block text-sm font-medium text-gray-300 mb-1">Is Public:</Label>
                        <Select
                            value={localHabitState.is_public?.toString() || 'false'}
                            onValueChange={(value) => handleFieldChange('is_public', value === 'true')}
                        >
                            <SelectTrigger id="habit-is-public" className="w-full bg-gray-800 border-gray-700 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                <SelectItem value="true">True</SelectItem>
                                <SelectItem value="false">False</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Add more fields here */}
                    <div className="col-span-full">
                        <Button onClick={handleSave} className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white">
                            Save Changes
                        </Button>
                    </div>
                </div>
            )}

            {selectedHabit && (
                <div className="mt-8 pt-4 border-t border-red-500/30">
                    <h4 className="text-lg font-bold mb-2 text-red-400">Time Travel: Simulate Completion</h4>
                    <div className="flex flex-col md:flex-row gap-2 items-end">
                        <div className="flex-grow">
                            <Label htmlFor="backdate-completion-date" className="block text-sm font-medium text-gray-300 mb-1">
                                Completion Date:
                            </Label>
                            <Input
                                id="backdate-completion-date"
                                type="date"
                                value={backdateCompletionDate}
                                onChange={(e) => setBackdateCompletionDate(e.target.value)}
                                className="bg-gray-800 border-gray-700 text-white"
                            />
                        </div>
                        <Button onClick={handleBackdateCompletion} className="bg-red-700 hover:bg-red-800 text-white flex-shrink-0">
                            Complete on Selected Date
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HabitDebugPanel;
