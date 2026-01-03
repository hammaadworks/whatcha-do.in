"use client";

import * as React from "react";
import {ChevronLeftIcon, ChevronRightIcon,} from "lucide-react";
import {DayButton, DayPicker, getDefaultClassNames,} from "react-day-picker";

import {cn} from "@/lib/utils";
import {Button, buttonVariants} from "@/components/ui/button";
import {useSimulatedTime} from "@/components/layout/SimulatedTimeProvider";
import {getReferenceDateUI} from "@/lib/date";


import {MagicCard} from "@/components/ui/magic-card";
import {useTheme} from "next-themes";

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
    const { resolvedTheme } = useTheme();
    const refDate = getReferenceDateUI(simulatedDate);

    return (
    <MagicCard 
        className={cn("rounded-xl border p-3 shadow-lg", className)} 
        gradientColor={resolvedTheme === "dark" ? "#262626" : "#D9D9D955"}
    >
    <DayPicker
        showOutsideDays={showOutsideDays}
        captionLayout={captionLayout}
        /**
         * Prevent selecting future dates
         * relative to EFFECTIVE (simulated) today
         */
        disabled={{after: refDate}}
        /**
         * Force DayPicker to understand "today"
         * under time travel
         */
        today={refDate}
        className={cn("bg-transparent", className)}
        classNames={{
            months: "flex flex-col sm:flex-row gap-4",
            month: "space-y-4 w-full",
            caption: "relative flex items-center justify-center pt-1 mb-2",
            caption_label: "text-sm font-bold tracking-tight text-foreground",
            nav: "flex items-center gap-1",
            nav_button: cn(buttonVariants({variant: "ghost"}), "h-7 w-7 rounded-md bg-transparent", "hover:bg-primary/10 hover:text-primary transition-colors", "focus-visible:ring-2 focus-visible:ring-ring"),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex w-full justify-between mb-2",
            head_cell: "w-9 text-center text-[0.7rem] uppercase font-bold text-muted-foreground tracking-wider",
            row: "flex w-full mt-2 justify-between",
            cell: "relative h-9 w-9 p-0 text-center text-sm focus-within:z-20",
            day: cn(buttonVariants({variant: "ghost"}), "h-9 w-9 rounded-full p-0 font-normal transition-all duration-200 hover:scale-110 hover:bg-primary/20 hover:text-primary", "text-foreground"),
            day_selected: "relative z-10 !bg-primary !text-primary-foreground shadow-xl shadow-primary/60 hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground scale-110 font-bold !ring-4 ring-primary ring-offset-2 ring-offset-background aria-selected:opacity-100",
            day_today: "relative z-10 bg-transparent text-primary font-bold ring-2 ring-primary ring-offset-2 ring-offset-background",
            day_outside: "text-muted-foreground opacity-30",
            day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed pointer-events-none hover:bg-transparent hover:text-muted-foreground",
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
    />
    </MagicCard>);
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
