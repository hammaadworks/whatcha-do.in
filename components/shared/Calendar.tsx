"use client";

import * as React from "react";
import {ChevronLeftIcon, ChevronRightIcon,} from "lucide-react";
import {DayButton, DayPicker, getDefaultClassNames,} from "react-day-picker";

import {cn} from "@/lib/utils";
import {Button, buttonVariants} from "@/components/ui/button";
import {useSimulatedTime} from "@/components/layout/SimulatedTimeProvider.tsx";
import {getReferenceDateUI} from "@/lib/date.ts";


/* ------------------------------------------------------------------ */
/* Calendar */

/* ------------------------------------------------------------------ */

function Calendar({
                      className, classNames, showOutsideDays = true, captionLayout = "label", ...props
                  }: React.ComponentProps<typeof DayPicker>) {


    /**
     * Convert YYYY-MM-DD → Date (for react-day-picker only)
     * NOTE: This is a VIEW concern, not business logic.
     */
    const { simulatedDate } = useSimulatedTime();
    const refDate = getReferenceDateUI(simulatedDate);

    return (<DayPicker
        showOutsideDays={showOutsideDays}
        captionLayout={captionLayout}
        /**
         * Prevent selecting future dates
         * relative to EFFECTIVE (simulated) today
         */
        hidden={{after: refDate}}
        /**
         * Force DayPicker to understand "today"
         * under time travel
         */
        today={refDate}
        className={cn("rounded-xl border bg-background p-3", className)}
        classNames={{
            months: "flex flex-col sm:flex-row gap-4",
            month: "space-y-4",
            caption: "relative flex items-center justify-center pt-1",
            caption_label: "text-sm font-semibold tracking-tight",
            nav: "flex items-center gap-1",
            nav_button: cn(buttonVariants({variant: "ghost"}), "h-7 w-7 rounded-md", "hover:bg-accent hover:text-accent-foreground", "focus-visible:ring-2 focus-visible:ring-ring"),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse",
            head_row: "flex",
            head_cell: "w-9 text-center text-[0.75rem] font-medium text-muted-foreground",
            row: "mt-2 flex w-full",
            cell: "relative h-9 w-9 p-0 text-center text-sm focus-within:z-20",
            day: cn(buttonVariants({variant: "ghost"}), "h-9 w-9 rounded-full p-0 font-normal transition-colors"),
            day_selected: "bg-primary text-primary-foreground hover:bg-primary/90",
            day_today: "border-2 border-primary text-primary",
            day_outside: "text-muted-foreground opacity-40",
            day_disabled: "text-muted-foreground opacity-30",
            day_range_middle: "bg-accent text-accent-foreground rounded-none",
            day_hidden: "invisible", ...classNames,
        }}
        components={{
            Chevron: ({orientation, className, ...props}) => orientation === "left" ? (<ChevronLeftIcon
                className={cn("h-4 w-4", className)}
                {...props}
            />) : (<ChevronRightIcon
                className={cn("h-4 w-4", className)}
                {...props}
            />),
        }}
        {...props}
    />);
}

/* ------------------------------------------------------------------ */
/* Calendar Day Button (Enhanced) */

/* ------------------------------------------------------------------ */

function CalendarDayButton({
                               className, day, modifiers, ...props
                           }: React.ComponentProps<typeof DayButton>) {
    const defaultClassNames = getDefaultClassNames();
    const ref = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
        if (modifiers.focused) ref.current?.focus();
    }, [modifiers.focused]);

    return (<Button
        ref={ref}
        variant="ghost"
        size="icon"
        data-selected={modifiers.selected}
        className={cn("flex h-9 w-9 items-center justify-center rounded-full text-sm transition-all", modifiers.selected && "bg-primary text-primary-foreground", modifiers.today && "border-2 border-primary text-primary", modifiers.outside && "opacity-40", defaultClassNames.day, className)}
        {...props}
    />);
}

export {Calendar, CalendarDayButton};
