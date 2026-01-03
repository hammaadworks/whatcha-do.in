"use client";

import React, { useEffect, useState } from "react";
import BaseModal from "../shared/BaseModal"; // Import the new BaseModal
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select components
import TimeDropdown from "@/components/shared/TimeDropdown"; // Import the new TimeDropdown component

interface EditHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: {
    id: string; name: string; is_public: boolean; goal_value?: number | null; // Add goal_value
    goal_unit?: string | null; // Add goal_unit
    target_time?: string | null; // Add target_time
    descriptions?: string | null; // Add descriptions
  };
  onSave: (habitId: string, name: string, isPublic: boolean, goalValue?: number | null, // Add goalValue to onSave
           goalUnit?: string | null, // Add goalUnit to onSave
           targetTime?: string | null, // Add targetTime to onSave
           description?: string | null // Add description to onSave
  ) => void;
}

const predefinedUnits = ["minutes", "hours", "pages", "reps", "sets", "questions", "Custom..."];

/**
 * Modal component for editing an existing habit's details.
 * Allows modifying name, visibility, and goal settings.
 */
const EditHabitModal: React.FC<EditHabitModalProps> = ({ isOpen, onClose, habit, onSave }) => {
  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.descriptions || "");
  const [isPublic, setIsPublic] = useState(habit.is_public);
  const [goalValue, setGoalValue] = useState<number | undefined | null>(habit.goal_value);
  const [goalUnit, setGoalUnit] = useState<string>(habit.goal_unit && predefinedUnits.includes(habit.goal_unit) ? habit.goal_unit : "Custom...");
  const [customUnit, setCustomUnit] = useState<string>(habit.goal_unit && !predefinedUnits.includes(habit.goal_unit) ? habit.goal_unit : "");
  const [targetTime, setTargetTime] = useState<string | null>(habit.target_time || null); // targetTime state can be null
  const [nameError, setNameError] = useState("");
  const [goalValueError, setGoalValueError] = useState("");
  const [goalUnitError, setGoalUnitError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(habit.name);
      setDescription(habit.descriptions || "");
      setIsPublic(habit.is_public);
      setGoalValue(habit.goal_value);
      setGoalUnit(habit.goal_unit && predefinedUnits.includes(habit.goal_unit) ? habit.goal_unit : "Custom...");
      setCustomUnit(habit.goal_unit && !predefinedUnits.includes(habit.goal_unit) ? habit.goal_unit : "");
      setTargetTime(habit.target_time || "");
      setNameError("");
      setGoalValueError("");
      setGoalUnitError("");
    }
  }, [isOpen, habit]);


  const handleSave = () => {
    let isValid = true;

    if (!name.trim()) {
      setNameError("Habit name cannot be empty.");
      isValid = false;
    } else {
      setNameError("");
    }

    const finalGoalValue: number | null | undefined = goalValue;
    let finalGoalUnit: string | null | undefined = goalUnit;

    if (finalGoalUnit === "Custom...") {
      finalGoalUnit = customUnit.trim();
    }

    if (finalGoalValue !== undefined && finalGoalValue !== null) {
      if (finalGoalValue <= 0) {
        setGoalValueError("Goal value must be a positive number.");
        isValid = false;
      } else {
        setGoalValueError("");
      }
      if (!finalGoalUnit) {
        setGoalUnitError("Goal unit cannot be empty if a goal value is set.");
        isValid = false;
      } else {
        setGoalUnitError("");
      }
    } else {
      // If goalValue is cleared, clear goalUnit as well
      finalGoalUnit = null;
      setGoalValueError("");
      setGoalUnitError("");
    }

    if (!isValid) {
      return;
    }

    onSave(habit.id, name, isPublic, finalGoalValue, finalGoalUnit, targetTime, description);
    onClose();
  };

  const handleClearTime = () => {
    setTargetTime("");
  };

  return (<BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Habit"
      footerContent={<>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save changes
        </Button>
      </>}
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
        </div>
        
        <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={3}
            />
        </div>

        {/* Name and Public Row */}
        <div className="flex gap-4 items-start">
          <div className="grid gap-2">
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
                {predefinedUnits.map((unit) => (<SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Custom Unit Field */}
        {goalUnit === "Custom..." && (<div className="grid gap-2">
          <Label htmlFor="customUnit">Custom Unit</Label>
          <Input
            id="customUnit"
            type="text"
            value={customUnit}
            onChange={(e) => setCustomUnit(e.target.value)}
            placeholder="e.g. pushups"
          />
        </div>)}

        {/* Target Time Field */}

        <div className="grid gap-2">

          <Label htmlFor="targetTime">Target Time</Label>

          <TimeDropdown

            value={targetTime}

            onChange={setTargetTime}

          />

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