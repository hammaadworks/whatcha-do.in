"use client";

import React, {createContext, type ReactNode, useCallback, useContext, useMemo, useState, useEffect} from "react";
import {SIMULATED_DATE_COOKIE} from "@/lib/constants.ts";

/* ------------------------------------------------------------------ */
/* Types */

/* ------------------------------------------------------------------ */

interface SimulatedTimeContextValue {
    simulatedDate: Date | null;
    setSimulatedDate: (date: Date | null) => void;
}

interface SimulatedTimeProviderProps {
    children: ReactNode;
    initialSimulatedDate?: string | null;
}

/* ------------------------------------------------------------------ */
/* Context */
/* ------------------------------------------------------------------ */

const SimulatedTimeContext = createContext<SimulatedTimeContextValue | undefined>(undefined);

/* ------------------------------------------------------------------ */
/* Provider */

/* ------------------------------------------------------------------ */

export function SimulatedTimeProvider({
                                          children, initialSimulatedDate,
                                      }: Readonly<SimulatedTimeProviderProps>) {
    // Initialize with prop if available
    const [simulatedDate, setSimulatedDate] = useState<Date | null>(
        initialSimulatedDate ? new Date(initialSimulatedDate) : null
    );

    // Read cookie on mount if not provided via props (Client-side fallback)
    useEffect(() => {
        if (!initialSimulatedDate) {
            const match = document.cookie.match(new RegExp(`(^| )${SIMULATED_DATE_COOKIE}=([^;]+)`));
            if (match) {
                const cookieValue = match[2];
                if (cookieValue) {
                    setSimulatedDate(new Date(cookieValue));
                }
            }
        }
    }, [initialSimulatedDate]);

    // ✅ Stable setter (good practice)
    const updateSimulatedDate = useCallback((date: Date | null) => {
        setSimulatedDate(date);

        if (date) {
            document.cookie = [`${SIMULATED_DATE_COOKIE}=${date.toISOString()}`, "path=/", "max-age=86400"].join("; ");
        } else {
            document.cookie = [`${SIMULATED_DATE_COOKIE}=`, "path=/", "max-age=0"].join("; ");
        }

    }, [setSimulatedDate]);

    // ✅ Memoized context value (fixes warning)
    const contextValue = useMemo(() => ({
        simulatedDate, setSimulatedDate: updateSimulatedDate,
    }), [simulatedDate, updateSimulatedDate]);

    return (<SimulatedTimeContext.Provider value={contextValue}>
        {children}
    </SimulatedTimeContext.Provider>);
}

/* ------------------------------------------------------------------ */
/* Hook */

/* ------------------------------------------------------------------ */

export function useSimulatedTime(): SimulatedTimeContextValue {
    const context = useContext(SimulatedTimeContext);

    if (!context) {
        throw new Error("useSimulatedTime must be used within a SimulatedTimeProvider");
    }

    return context;
}
