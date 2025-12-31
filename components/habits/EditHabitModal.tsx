"use client";

import React, { useState, useEffect, useRef } from 'react';
import BaseModal from '../shared/BaseModal'; // Import the new BaseModal
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import { TimepickerUI } from 'timepicker-ui'; // Import TimepickerUI
import { X } from 'lucide-react'; // Import X icon

interface EditHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: {
    id: string;
    name: string;
    is_public: boolean;
    goal_value?: number | null; // Add goal_value
    goal_unit?: string | null; // Add goal_unit
    target_time?: string | null; // Add target_time
  };
  onSave: (
    habitId: string,
    name: string,
    isPublic: boolean,
    goalValue?: number | null, // Add goalValue to onSave
    goalUnit?: string | null, // Add goalUnit to onSave
    targetTime?: string | null // Add targetTime to onSave
  ) => void;
}

const predefinedUnits = [
  "minutes",
  "hours",
  "pages",
  "reps",
  "sets",
  "questions",
  "Custom...",
];

/**
 * Modal component for editing an existing habit's details.
 * Allows modifying name, visibility, and goal settings.
 */
const EditHabitModal: React.FC<EditHabitModalProps> = ({ isOpen, onClose, habit, onSave }) => {
  const [name, setName] = useState(habit.name);
  const [isPublic, setIsPublic] = useState(habit.is_public);
  const [goalValue, setGoalValue] = useState<number | undefined | null>(habit.goal_value);
  const [goalUnit, setGoalUnit] = useState<string>(habit.goal_unit && predefinedUnits.includes(habit.goal_unit) ? habit.goal_unit : "Custom...");
  const [customUnit, setCustomUnit] = useState<string>(habit.goal_unit && !predefinedUnits.includes(habit.goal_unit) ? habit.goal_unit : "");
  const [targetTime, setTargetTime] = useState<string>(habit.target_time || ""); // targetTime state
  const [nameError, setNameError] = useState('');
  const [goalValueError, setGoalValueError] = useState('');
  const [goalUnitError, setGoalUnitError] = useState('');
  
  const timepickerInputRef = useRef<HTMLInputElement>(null); // Ref for time input

  useEffect(() => {
    if (isOpen) {
      setName(habit.name);
      setIsPublic(habit.is_public);
      setGoalValue(habit.goal_value);
      setGoalUnit(habit.goal_unit && predefinedUnits.includes(habit.goal_unit) ? habit.goal_unit : "Custom...");
      setCustomUnit(habit.goal_unit && !predefinedUnits.includes(habit.goal_unit) ? habit.goal_unit : "");
      setTargetTime(habit.target_time || "");
      setNameError('');
      setGoalValueError('');
      setGoalUnitError('');
    }
  }, [isOpen, habit]);

  // Helper to format 24h time to 12h AM/PM
  const formatTimeDisplay = (time24: string) => {
    if (!time24) return "";
    const [h, m] = time24.split(':');
    const date = new Date();
    date.setHours(parseInt(h), parseInt(m));
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  // Initialize TimepickerUI
  useEffect(() => {
    let timepicker: TimepickerUI | null = null;
    
    // Slight delay to ensure DOM is ready inside Modal
    const timer = setTimeout(() => {
        if (isOpen && timepickerInputRef.current) {
            timepicker = new TimepickerUI(timepickerInputRef.current, {
                clock: { type: '12h' },
                ui: { theme: 'basic' } // Use basic theme as requested/fallback
            });
            timepicker.create();

            timepicker.on('confirm', (data) => {
                const hour = data.hour!.toString().padStart(2, '0');
                const minute = data.minutes!.toString().padStart(2, '0');
                setTargetTime(`${hour}:${minute}`);
            });
        }
    }, 100);

    return () => {
        clearTimeout(timer);
        if (timepicker) {
            timepicker.destroy();
        }
    };
  }, [isOpen]);

  const handleSave = () => {
    let isValid = true;

    if (!name.trim()) {
      setNameError('Habit name cannot be empty.');
      isValid = false;
    } else {
      setNameError('');
    }

    const finalGoalValue: number | null | undefined = goalValue;
    let finalGoalUnit: string | null | undefined = goalUnit;

    if (finalGoalUnit === "Custom...") {
      finalGoalUnit = customUnit.trim();
    }

    if (finalGoalValue !== undefined && finalGoalValue !== null) {
      if (finalGoalValue <= 0) {
        setGoalValueError('Goal value must be a positive number.');
        isValid = false;
      } else {
        setGoalValueError('');
      }
      if (!finalGoalUnit) {
        setGoalUnitError('Goal unit cannot be empty if a goal value is set.');
        isValid = false;
      } else {
        setGoalUnitError('');
      }
    } else {
      // If goalValue is cleared, clear goalUnit as well
      finalGoalUnit = null;
      setGoalValueError('');
      setGoalUnitError('');
    }

    if (!isValid) {
      return;
    }

    onSave(habit.id, name, isPublic, finalGoalValue, finalGoalUnit, targetTime || null);
    onClose();
  };
  
  const handleClearTime = () => {
    setTargetTime("");
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Habit"
      footerContent={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save changes
          </Button>
        </>
      }
    >
        <div className="flex flex-col gap-6 py-4">
          {/* Name and Public Row */}
          <div className="flex gap-4 items-start">
            <div className="flex-1 grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {nameError && <p className="text-destructive text-xs">{nameError}</p>}
            </div>
            <div className="grid gap-2 pt-6">
               <div className="flex items-center gap-2">
                  <Switch
                    id="isPublic"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="isPublic">Public</Label>
               </div>
            </div>
          </div>

          {/* Goal Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="goalValue">Goal Value</Label>
              <Input
                id="goalValue"
                type="number"
                value={goalValue === undefined || goalValue === null ? "" : goalValue}
                onChange={(e) => setGoalValue(parseFloat(e.target.value) || null)}
                placeholder="e.g. 10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goalUnit">Goal Unit</Label>
              <Select value={goalUnit} onValueChange={setGoalUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedUnits.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Custom Unit Field */}
          {goalUnit === "Custom..." && (
            <div className="grid gap-2">
              <Label htmlFor="customUnit">Custom Unit</Label>
              <Input
                id="customUnit"
                type="text"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                placeholder="e.g. pushups"
              />
            </div>
          )}

          {/* Target Time Field */}
          <div className="grid gap-2">
            <Label htmlFor="targetTime">Target Time</Label>
            <div className="flex items-center gap-2">
                <Input
                    ref={timepickerInputRef}
                    id="targetTime"
                    type="text"
                    value={formatTimeDisplay(targetTime)}
                    readOnly // Prevent manual typing to avoid conflicts/invalid states
                    placeholder="Set time"
                    className="flex-1 cursor-pointer"
                    autoComplete="off"
                />
                <Button variant="outline" size="icon" onClick={handleClearTime}>
                   <X className="h-4 w-4" />
                </Button>
            </div>
          </div>

          {/* Goal Errors */}
          {(goalValueError || goalUnitError) && (
             <div className="flex flex-col gap-1">
                {goalValueError && <p className="text-destructive text-xs">{goalValueError}</p>}
                {goalUnitError && <p className="text-destructive text-xs">{goalUnitError}</p>}
             </div>
          )}
        </div>
    </BaseModal>
  );
};

export default EditHabitModal;