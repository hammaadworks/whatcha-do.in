"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Dumbbell, Flame, StickyNote } from "lucide-react";
import { CompletionsData, Habit } from "@/lib/supabase/types";

interface HabitCompletionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit;
  onConfirm: (data: CompletionsData) => Promise<void>;
}

/**
 * Modal for logging the completion of a habit.
 * Collects metadata like mood, duration, and notes.
 */
export const HabitCompletionsModal: React.FC<HabitCompletionsModalProps> = ({ isOpen, onClose, habit, onConfirm }) => {
  const [mood, setMood] = useState(3); // 1-5
  const [workValue, setWorkValue] = useState<string>("");
  const [timeTaken, setTimeTaken] = useState<string>("");
  const [timeTakenUnit, setTimeTakenUnit] = useState("minutes");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setMood(3);
      setWorkValue("");
      setTimeTaken("");
      setTimeTakenUnit("minutes");
      setNotes("");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const data: CompletionsData = {
      mood: mood, notes: notes.trim() || undefined
    };

    if (workValue) data.work_value = Number.parseFloat(workValue);
    if (timeTaken) {
      data.time_taken = Number.parseFloat(timeTaken);
      data.time_taken_unit = timeTakenUnit;
    }

    try {
      await onConfirm(data);
      onClose();
    } catch (error) {
      console.error("Completion failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          Complete: <span className="text-primary">{habit.name}</span>
        </DialogTitle>
      </DialogHeader>

      <div className="grid gap-6 py-4">
        {/* Streak Preview */}
        <div className="flex justify-center items-center gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Current</p>
            <Badge variant="secondary" className="text-lg px-3 py-1 mt-1">{habit.streak}</Badge>
          </div>
          <div className="text-primary font-bold text-xl">→</div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">New Streak</p>
            <Badge variant="default" className="text-lg px-3 py-1 mt-1 bg-green-500 hover:bg-green-600">
              <Flame className="w-4 h-4 mr-1 fill-current" />
              {habit.streak < 1 ? 1 : habit.streak + 1}
            </Badge>
          </div>
        </div>

        {/* Mood Emoji Picker */}
        <div className="space-y-3">
          <Label>How ya feeling!</Label>
          <div className="flex justify-between gap-1">
            {[
              { value: 1, emoji: "😫", label: "Drained" },
              { value: 2, emoji: "😕", label: "Meh" },
              { value: 3, emoji: "😐", label: "Okay" },
              { value: 4, emoji: "🙂", label: "Good" },
              { value: 5, emoji: "🤩", label: "Pumped!" }
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setMood(item.value)}
                className={cn(
                  "flex flex-col items-center justify-center p-2 flex-1 rounded-lg transition-all",
                  mood === item.value
                    ? "bg-primary/10 ring-2 ring-primary scale-105"
                    : "hover:bg-muted opacity-70 hover:opacity-100"
                )}
                type="button"
              >
                <span className="text-2xl mb-1">{item.emoji}</span>
                <span
                  className="text-[10px] text-muted-foreground font-medium text-center leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Work / Goal Input */}
        {habit.goal_value && (<div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Dumbbell size={16} />
            Work Done (Goal: {habit.goal_value} {habit.goal_unit})
          </Label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder={`${habit.goal_value}`}
              value={workValue}
              onChange={(e) => setWorkValue(e.target.value)}
            />
            <span className="text-sm font-medium text-muted-foreground">
                                    {habit.goal_unit}
                                </span>
          </div>
        </div>)}

        {/* Duration */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock size={16} /> Duration
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0"
              value={timeTaken}
              onChange={(e) => setTimeTaken(e.target.value)}
              className="flex-1"
            />
            <Select value={timeTakenUnit} onValueChange={setTimeTakenUnit}>
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">mins</SelectItem>
                <SelectItem value="hours">hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <StickyNote size={16} /> Reflections
          </Label>
          <Textarea
            placeholder="How did it go?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="resize-none h-20"
          />
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "Logging..." : "Complete Habit"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>);
};
