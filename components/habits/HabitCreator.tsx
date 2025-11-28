"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createHabit } from "@/lib/supabase/habit"; // Import createHabit
import { useAuth } from "@/hooks/useAuth";
import { Switch } from "@/components/ui/switch"; // Import Switch
import { Label } from "@/components/ui/label"; // Import Label

interface HabitCreatorProps {
  onHabitCreated: () => void; // New prop to notify parent
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

export function HabitCreator({ onHabitCreated }: HabitCreatorProps) {
  const { user } = useAuth();
  const [habitName, setHabitName] = useState("");
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [goalValue, setGoalValue] = useState<number | undefined>(undefined);
  const [goalUnit, setGoalUnit] = useState<string>(predefinedUnits[0]);
  const [customUnit, setCustomUnit] = useState("");
  const [isPublic, setIsPublic] = useState(true); // New state for public/private
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!user?.id) {
      setError("User not authenticated.");
      return;
    }
    if (!habitName.trim()) return;

    setLoading(true);
    setError(null);

    let finalGoalUnit = goalUnit;
    if (goalUnit === "Custom...") {
      finalGoalUnit = customUnit.trim();
    }

    try {
      await createHabit({
        name: habitName.trim(),
        goal_value: showGoalInput && goalValue !== undefined ? goalValue : undefined,
        goal_unit: showGoalInput && finalGoalUnit ? finalGoalUnit : undefined,
        user_id: user.id,
        is_public: isPublic, // Pass isPublic state
      });
      onHabitCreated(); // Notify parent that habit was created
      // Reset form
      setHabitName("");
      setShowGoalInput(false);
      setGoalValue(undefined);
      setGoalUnit(predefinedUnits[0]);
      setCustomUnit("");
      setIsPublic(true); // Reset isPublic to default
    } catch (err: unknown) {
      setError((err instanceof Error) ? err.message : "Failed to create habit.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !loading) {
      handleCreate();
    }
  };

  return (
    <div className="flex flex-col space-y-2 p-4 border rounded-lg shadow-sm">
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Add a new habit..."
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow"
          disabled={loading}
        />
        {habitName.trim() && !showGoalInput && (
          <Button variant="outline" onClick={() => setShowGoalInput(true)} disabled={loading}>
            + Add Goal
          </Button>
        )}
        <Button onClick={handleCreate} disabled={loading || !habitName.trim()}>
          {loading ? "Adding..." : "Add Habit"}
        </Button>
      </div>

      <div className="flex items-center space-x-2 justify-end">
        <Label htmlFor="is-public-switch">Public</Label>
        <Switch
          id="is-public-switch"
          checked={isPublic}
          onCheckedChange={setIsPublic}
          disabled={loading}
        />
      </div>

      {showGoalInput && (
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            type="number"
            placeholder="Goal value"
            value={goalValue === undefined ? "" : goalValue}
            onChange={(e) => setGoalValue(parseFloat(e.target.value) || undefined)}
            className="w-full sm:w-32"
            disabled={loading}
          />
          <Select value={goalUnit} onValueChange={setGoalUnit} disabled={loading}>
            <SelectTrigger className="w-full sm:w-[176px]">
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
          {goalUnit === "Custom..." && (
            <Input
              type="text"
              placeholder="Enter custom unit"
              value={customUnit}
              onChange={(e) => setCustomUnit(e.target.value)}
              className="w-full sm:flex-grow"
              disabled={loading}
            />
          )}
        </div>
      )}
      {error && <p className="text-destructive-foreground text-[var(--font-size-sm)] mt-2">{error}</p>}
    </div>
  );
}
