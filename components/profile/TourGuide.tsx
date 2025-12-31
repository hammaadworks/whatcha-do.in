"use client";

import { TourProvider, useTour, Tour, Step } from "@/components/ui/tour"; // Fixed imports
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const TOUR_STORAGE_KEY = "whatcha-doin-tour-completed";
const PROFILE_TOUR_ID = "profile-tour";

const steps: Step[] = [
    {
      id: "welcome",
      title: "Welcome to your space!",
      content: "This is your private dashboard where you track your life. Let's take a quick tour.",
    },
    {
      id: "vibe",
      title: "Vibe Check",
      content: "Switch between 'Edit Mode' to manage your tasks, and 'Public View' to see what others see.",
    },
    {
      id: "me",
      title: "It's You!",
      content: "Your bio, time, and quick stats live here. Keep it fresh.",
    },
    {
      id: "actions",
      title: "Actions",
      content: "Your daily tasks. Nest them, complete them, and watch your journal auto-fill.",
    },
    {
      id: "habits",
      title: "Habits",
      content: "Build consistency. Track your daily habits and keep the streak alive.",
    },
    {
      id: "journal",
      title: "Journal",
      content: "Your automated diary. Actions and habits you complete appear here automatically.",
    }
    // Settings button selector might be tricky if it's in header outside. Skipping specific selector for now or assuming it works if we can select it.
    // Ideally we add data-tour attributes to target elements.
];

const tours: Tour[] = [
    {
        id: PROFILE_TOUR_ID,
        steps: steps.map(step => ({
            ...step,
            // Map selector logic to data-tour-step-id if needed, or update component to use data-tour
            // The Tour component in ui/tour.tsx selects by `[data-tour-step-id*='${step.id}']`
            // So we need to add `data-tour-step-id="welcome"` etc to elements.
        }))
    }
];

function TourAutoStarter() {
    const { start } = useTour();
    const pathname = usePathname();

    useEffect(() => {
        const segments = pathname?.split('/').filter(Boolean);
        // Assuming /username is the profile page
        const isProfilePage = segments?.length === 1 && !['me', 'logins'].includes(segments[0]);

        if (isProfilePage) {
            const hasCompletedTour = localStorage.getItem(TOUR_STORAGE_KEY);
            if (!hasCompletedTour) {
                // Delay to ensure elements are rendered
                const timer = setTimeout(() => {
                    start(PROFILE_TOUR_ID);
                    // We assume the user completes it or closes it. 
                    // The UI lib doesn't seem to expose onFinish callback easily in the Provider usage 
                    // without modifying the Context.
                    // For now, we set the key when started or maybe we should modify the lib to call a callback?
                    // Or we just set it here.
                    localStorage.setItem(TOUR_STORAGE_KEY, "true");
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [pathname, start]);

    return null;
}

export function ProfileTourProvider({ children }: { children: React.ReactNode }) {
    return (
        <TourProvider tours={tours}>
            <TourAutoStarter />
            {children}
        </TourProvider>
    );
}

export function restartTour() {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    window.location.reload();
}