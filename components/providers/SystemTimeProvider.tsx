"use client";

import React, {createContext, useContext, useState} from 'react';
import {useRouter} from 'next/navigation';

interface SystemTimeContextType {
    simulatedDate: Date | null;
    setSystemTime: (date: Date | null) => void;
}

const SystemTimeContext = createContext<SystemTimeContextType | undefined>(undefined);

export function SystemTimeProvider({children, initialSimulatedDate}: Readonly<{
    children: React.ReactNode, initialSimulatedDate?: string | null
}>) {
    const [simulatedDate, setSimulatedDate] = useState<Date | null>(initialSimulatedDate ? new Date(initialSimulatedDate) : null);
    const router = useRouter();

    const setSystemTime = (date: Date | null) => {
        setSimulatedDate(date);
        if (date) {
            document.cookie = `simulated_date=${date.toISOString()}; path=/; max-age=86400`; // 1 day
        } else {
            document.cookie = `simulated_date=; path=/; max-age=0`; // Delete
        }
        router.refresh(); // Refresh server components to pick up the new cookie
    };

    return (<SystemTimeContext.Provider value={{simulatedDate, setSystemTime}}>
            {children}
        </SystemTimeContext.Provider>);
}

export const useSystemTime = () => {
    const context = useContext(SystemTimeContext);
    if (context === undefined) {
        throw new Error('useSystemTime must be used within a SystemTimeProvider');
    }
    return context;
};
