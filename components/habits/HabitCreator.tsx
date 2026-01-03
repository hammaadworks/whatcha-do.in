"use client";

import React, {useState} from "react";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {createHabit} from "@/lib/supabase/habit"; // Import createHabit
import {useAuth} from "@/packages/auth/hooks/useAuth";
import {Switch} from "@/components/ui/switch"; // Import Switch
import {Label} from "@/components/ui/label"; // Import Label
import {Habit} from "@/lib/supabase/types";
import {formatISO, getReferenceDateUI} from "@/lib/date.ts";
import {useSimulatedTime} from "@/components/layout/SimulatedTimeProvider.tsx";
import TimeDropdown from "@/components/shared/TimeDropdown"; // Import the new TimeDropdown component

interface HabitCreatorProps {
    onHabitCreated: (habit: Habit) => void; // Updated to pass back the created habit
}

const predefinedUnits = ["minutes", "hours", "pages", "reps", "sets", "questions", "Custom..."];


/**
 * A form component for creating new habits.
 * Includes fields for name, goal tracking (value/unit), and visibility.
 */
export function HabitCreator({onHabitCreated}: Readonly<HabitCreatorProps>) {
    const {user} = useAuth();
    const [habitName, setHabitName] = useState("");
    const [description, setDescription] = useState("");
    // Removed showGoalInput state - options are always visible
    const [goalValue, setGoalValue] = useState<number | undefined>(undefined);
    const [goalUnit, setGoalUnit] = useState<string>(predefinedUnits[0]);
    const [customUnit, setCustomUnit] = useState("");
    const [targetTime, setTargetTime] = useState<string | null>("23:45");
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {simulatedDate} = useSimulatedTime();
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
        if (goalUnit === "Custom...") { // Fixed string check to match "Custom..."
            finalGoalUnit = customUnit.trim();
            if (!finalGoalUnit) {
                setError("Please specify a custom unit.");
                setLoading(false);
                return;
            }
        }

        // Logic for goal validation remains
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

        const newHabitPayload: Partial<Habit> = {
            user_id: user.id,
            name: habitName.trim(),
            descriptions: description.trim() || null,
            is_public: isPublic,
            goal_value: goalValue ?? undefined,
            goal_unit: finalGoalUnit || undefined,
            processed_date: formatISO(refDate),
            target_time: targetTime || undefined
        };
        console.log("[HabitCreator] Submitting new habit:", newHabitPayload);

        try {
            const {data, error} = await createHabit(newHabitPayload);
            if (error || !data) throw error || new Error("Failed to return habit data");

            onHabitCreated(data);

            setHabitName("");
            setGoalValue(undefined);
            setGoalUnit(predefinedUnits[0]);
            setCustomUnit("");
            setTargetTime("23:45");
            setIsPublic(true);
            setDescription("");
        } catch (err: unknown) {
            setError((err instanceof Error) ? err.message : "Failed to create habit.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey && !loading) {
            event.preventDefault();
            handleCreate();
        }
    };

    return (<div className="flex flex-col gap-4 p-1"> {/* Clean container */}

            {/* Name Input */}
            <div>
                <Input
                    type="text"
                    placeholder="Habit Name (e.g., Drink Water)"
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full text-lg font-medium"
                    disabled={loading}
                    autoFocus
                />
            </div>

            {/* Goal Inputs */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2 flex-1">
                    <Input
                        type="number"
                        placeholder="Goal e.g. 10"
                        min="1" // 1. Browser standard: prevents arrow buttons from going below 1
                        inputMode="numeric" // 2. Mobile UX: forces the number-only keypad (no symbols)
                        onKeyDown={(e) => {
                            // 3. Prevent typing symbols like '-', '+', and scientific 'e'
                            if (["-", "+", "e", "E"].includes(e.key)) {
                                e.preventDefault();
                            }
                        }}
                        onPaste={(e) => {
                            // 4. Prevent pasting negative values
                            const pasteData = e.clipboardData.getData("text");
                            if (Number(pasteData) < 0) {
                                e.preventDefault();
                            }
                        }}
                        value={goalValue ?? ""}
                        onChange={(e) => {
                            const val = Number.parseFloat(e.target.value);
                            // 5. Final state check: only allow positive numbers or empty input
                            if (val > 0 || isNaN(val)) {
                                setGoalValue(isNaN(val) ? undefined : val);
                            }
                        }}
                        className="w-30 shrink-0"
                        disabled={loading}
                    />

                    <Select value={goalUnit} onValueChange={setGoalUnit} disabled={loading}>
                        <SelectTrigger className="flex-1 min-w-[100px]">
                            <SelectValue placeholder="Unit"/>
                        </SelectTrigger>
                        <SelectContent>
                            {predefinedUnits.map((unit) => (<SelectItem key={unit} value={unit}>
                                    {unit}
                                </SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>

                {goalUnit === "Custom..." && (<Input
                        type="text"
                        placeholder="Custom unit name"
                        value={customUnit}
                        onChange={(e) => setCustomUnit(e.target.value)}
                        className="flex-1"
                        disabled={loading}
                    />)}
            </div>

            {/* Target Time */}
            <div className="flex items-center gap-2">
                <Label htmlFor="target-time" className="shrink-0 text-muted-foreground w-20">Target Time</Label>
                <TimeDropdown
                    value={targetTime}
                    onChange={setTargetTime}
                    disabled={loading}
                />
            </div>

            {/* Description */}
            <div>
                <Textarea
                    placeholder="Description or motivation (optional)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="resize-none min-h-[80px]"
                    disabled={loading}
                />
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4 mt-2">
                <div className="flex items-center space-x-2">
                    <Switch
                        id="is-public-switch"
                        checked={isPublic}
                        onCheckedChange={setIsPublic}
                        disabled={loading}
                    />
                    <Label htmlFor="is-public-switch" className="cursor-pointer">Public Visibility</Label>
                </div>

                <Button
                    onClick={handleCreate}
                    disabled={loading || !habitName.trim()}
                    className="w-full sm:w-auto"
                >
                    {loading ? "Creating..." : "Create Habit"}
                </Button>
            </div>

            {error && <p className="text-destructive text-sm text-center">{error}</p>}
        </div>);
}