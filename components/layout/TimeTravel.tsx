"use client";

import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {toast} from "sonner";
import {useSimulatedTime} from "@/components/layout/SimulatedTimeProvider";

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

// Safely parses <input type="datetime-local" />
function parseLocalDateTime(input: string): Date | null {
    if (!input) return null;

    const [datePart, timePart] = input.split("T");
    if (!datePart || !timePart) return null;

    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    return new Date(year, month - 1, day, hour, minute);
}

/* ------------------------------------------------------------------ */
/* Component */

/* ------------------------------------------------------------------ */

export function TimeTravelSection() {
    const {simulatedDate, setSimulatedDate} = useSimulatedTime();
    const [timeTravelInput, setTimeTravelInput] = useState("");


    const handleApplyTimeTravel = () => {
        if (!timeTravelInput) {
            setSimulatedDate(null);
            toast.success("Back to the present 🕒");
            return;
        }

        const parsedDate = parseLocalDateTime(timeTravelInput);

        if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
            toast.error("Invalid date/time");
            return;
        }

        setSimulatedDate(parsedDate);
        toast.success("Time travel engaged ⚡️");
    };

    const handleResetTimeTravel = () => {
        setTimeTravelInput("");
        setSimulatedDate(null);
        toast.success("Timeline restored 🧭");
    };

    return (<section className="space-y-4 border-t border-dashed border-yellow-500 pt-4">
        <h3 className="flex items-center gap-2 border-b pb-2 text-lg font-medium text-yellow-600">
            🚧 Time Travel (Dev Only)
        </h3>

        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="time-travel-input">
                    Simulate Date & Time
                </Label>

                <Input
                    id="time-travel-input"
                    type="datetime-local"
                    value={timeTravelInput}
                    onChange={(e) => setTimeTravelInput(e.target.value)}
                />

                <p className="text-[0.8rem] text-muted-foreground">
                    Overrides system date for habit resolution, streaks, and “Today”.
                </p>
            </div>

            <div className="flex gap-2">
                <Button className="w-full" onClick={handleApplyTimeTravel}>
                    {timeTravelInput ? "Engage Flux Capacitor ⚡️" : "Reset to Present"}
                </Button>

                {simulatedDate && (<Button variant="outline" onClick={handleResetTimeTravel}>
                    Reset
                </Button>)}
            </div>

            {simulatedDate && (<div
                className="rounded border border-yellow-500/20 bg-yellow-500/10 p-2 text-xs font-mono text-yellow-600">
                Simulated Time: {simulatedDate.toLocaleString()}
            </div>)}
        </div>
    </section>);
}
