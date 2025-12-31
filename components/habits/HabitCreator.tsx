"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createHabit } from "@/lib/supabase/habit"; // Import createHabit
import { useAuth } from "@/hooks/useAuth";
import { Switch } from "@/components/ui/switch"; // Import Switch
import { Label } from "@/components/ui/label"; // Import Label
import { Habit } from "@/lib/supabase/types";
import { formatISO, getReferenceDateUI } from "@/lib/date.ts";
import { useSimulatedTime } from "@/components/layout/SimulatedTimeProvider.tsx";

interface HabitCreatorProps {
  onHabitCreated: (habit: Habit) => void; // Updated to pass back the created habit
}

const predefinedUnits = ["minutes", "hours", "pages", "reps", "sets", "questions", "Custom..."];


/**
 * A form component for creating new habits.
 * Includes fields for name, goal tracking (value/unit), and visibility.
 */
export function HabitCreator({ onHabitCreated }: Readonly<HabitCreatorProps>) {
  const { user } = useAuth();
  const [habitName, setHabitName] = useState("");
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [goalValue, setGoalValue] = useState<number | undefined>(undefined);
  const [goalUnit, setGoalUnit] = useState<string>(predefinedUnits[0]);
  const [customUnit, setCustomUnit] = useState("");
  const [targetTime, setTargetTime] = useState(""); // New state for target_time
  const [isPublic, setIsPublic] = useState(true); // New state for public/private
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
// Canonical Time Logic
  const { simulatedDate } = useSimulatedTime();
  const refDate = getReferenceDateUI(simulatedDate);
  const handleCreate = async () => {
    if (!user?.id) {
      setError("User not authenticated.");
      return;
    }
    if (!habitName.trim()) {
        setError("Habit name cannot be empty.");
        return;
    }

    setLoading(true);
    setError(null);

    let finalGoalUnit = goalUnit;
    if (goalUnit === "Custom...") {
      finalGoalUnit = customUnit.trim();
      if (!finalGoalUnit) {
          setError("Please specify a custom unit.");
          setLoading(false);
          return;
      }
    }
    
    if (showGoalInput) {
        if (goalValue !== undefined && goalValue <= 0) {
            setError("Goal value must be a positive number.");
            setLoading(false);
            return;
        }
        if (goalValue !== undefined && !finalGoalUnit) {
             setError("Unit cannot be empty if value is set.");
             setLoading(false);
             return;
        }
    }


    const newHabitPayload: Partial<Habit> = {
      user_id: user.id,
      name: habitName.trim(),
      is_public: isPublic,
      goal_value: showGoalInput && goalValue !== undefined ? goalValue : undefined,
      goal_unit: showGoalInput && finalGoalUnit ? finalGoalUnit : undefined,
      processed_date: formatISO(refDate),
      target_time: targetTime || undefined // Add target_time
    };
    console.log("[HabitCreator] Submitting new habit:", newHabitPayload);

    try {
      const { data, error } = await createHabit(newHabitPayload);
      if (error || !data) throw error || new Error("Failed to return habit data");

      onHabitCreated(data); // Notify parent with the new habit object

      // Reset form
      setHabitName("");
      setShowGoalInput(false);
      setGoalValue(undefined);
      setGoalUnit(predefinedUnits[0]);
      setCustomUnit("");
      setTargetTime(""); // Reset targetTime
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

  return (<div className="flex flex-col space-y-2 p-4 border rounded-lg shadow-sm">
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
          + Add Goal/Time
        </Button>)}
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
    <div className="grid gap-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          type="number"
          placeholder="Goal value"
          value={goalValue ?? ""}
          onChange={(e) => setGoalValue(Number.parseFloat(e.target.value) || undefined)}
          className="w-full sm:w-32"
          disabled={loading}
        />
        <Select value={goalUnit} onValueChange={setGoalUnit} disabled={loading}>
          <SelectTrigger className="w-full sm:w-[176px]">
            <SelectValue placeholder="Select a unit" />
          </SelectTrigger>
          <SelectContent>
            {predefinedUnits.map((unit) => (<SelectItem key={unit} value={unit}>
              {unit}
            </SelectItem>))}
          </SelectContent>
        </Select>
        {goalUnit === "Custom..." && (<Input
          type="text"
          placeholder="Enter custom unit"
          value={customUnit}
          onChange={(e) => setCustomUnit(e.target.value)}
          className="w-full sm:flex-grow"
          disabled={loading}
        />)}
      </div>
      <div className="flex items-center gap-2">
          <Label htmlFor="target-time" className="shrink-0">Target Time:</Label>
          <Input
            id="target-time"
            type="time"
            value={targetTime}
            onChange={(e) => setTargetTime(e.target.value)}
            className="w-full sm:w-auto"
            disabled={loading}
            step="600"
          />
      </div>
    </div>
    )}
    {error && <p className="text-destructive-foreground mt-2">{error}</p>}
  </div>);
}
