"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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

interface EditHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: {
    id: string;
    name: string;
    is_public: boolean;
    goal_value?: number | null; // Add goal_value
    goal_unit?: string | null; // Add goal_unit
  };
  onSave: (
    habitId: string,
    name: string,
    isPublic: boolean,
    goalValue?: number | null, // Add goalValue to onSave
    goalUnit?: string | null // Add goalUnit to onSave
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

const EditHabitModal: React.FC<EditHabitModalProps> = ({ isOpen, onClose, habit, onSave }) => {
  const [name, setName] = useState(habit.name);
  const [isPublic, setIsPublic] = useState(habit.is_public);
  const [goalValue, setGoalValue] = useState<number | undefined | null>(habit.goal_value);
  const [goalUnit, setGoalUnit] = useState<string>(habit.goal_unit && predefinedUnits.includes(habit.goal_unit) ? habit.goal_unit : "Custom...");
  const [customUnit, setCustomUnit] = useState<string>(habit.goal_unit && !predefinedUnits.includes(habit.goal_unit) ? habit.goal_unit : "");
  const [nameError, setNameError] = useState('');
  const [goalValueError, setGoalValueError] = useState('');
  const [goalUnitError, setGoalUnitError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setName(habit.name);
        setIsPublic(habit.is_public);
        setGoalValue(habit.goal_value);
        setGoalUnit(habit.goal_unit && predefinedUnits.includes(habit.goal_unit) ? habit.goal_unit : "Custom...");
        setCustomUnit(habit.goal_unit && !predefinedUnits.includes(habit.goal_unit) ? habit.goal_unit : "");
        setNameError('');
        setGoalValueError('');
        setGoalUnitError('');
      }, 0);
    }
  }, [isOpen, habit]);

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

    onSave(habit.id, name, isPublic, finalGoalValue, finalGoalUnit);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[424px]">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          {nameError && <p className="text-red-500 text-sm col-start-2 col-span-3">{nameError}</p>}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isPublic" className="text-right">
              Public
            </Label>
            <Switch
              id="isPublic"
              checked={isPublic}
              onCheckedChange={setIsPublic}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="goalValue" className="text-right">
              Goal Value
            </Label>
            <Input
              id="goalValue"
              type="number"
              value={goalValue === undefined || goalValue === null ? "" : goalValue}
              onChange={(e) => setGoalValue(parseFloat(e.target.value) || null)}
              className="col-span-3"
            />
          </div>
          {goalValueError && <p className="text-red-500 text-sm col-start-2 col-span-3">{goalValueError}</p>}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="goalUnit" className="text-right">
              Goal Unit
            </Label>
            <Select value={goalUnit} onValueChange={setGoalUnit}>
              <SelectTrigger className="col-span-3">
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
          {goalUnit === "Custom..." && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customUnit" className="text-right">
                Custom Unit
              </Label>
              <Input
                id="customUnit"
                type="text"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                className="col-span-3"
              />
            </div>
          )}
          {goalUnitError && <p className="text-red-500 text-sm col-start-2 col-span-3">{goalUnitError}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditHabitModal;