import React, { useRef, useEffect, useCallback } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery"; // Import useMediaQuery
import { MovingBorder } from "@/components/ui/moving-border";
import { UserClock } from "./UserClock";
import { useAuth } from "@/hooks/useAuth";
import { useUiStore } from "@/lib/store/uiStore"; // Import the Zustand store
import { toast } from "sonner"; // Import toast for user feedback
import { SectionViewLayout } from "./SectionViewLayout";
import { cn } from "@/lib/utils";

interface ProfileLayoutProps {
    username: string;
    isOwner: boolean;
    isReadOnly?: boolean;
    timezone?: string | null;
    onTimezoneChange?: (newTimezone: string) => Promise<void>;
    children: React.ReactNode;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({
                                                         username,
                                                         isOwner,
                                                         isReadOnly = false,
                                                         timezone,
                                                         onTimezoneChange,
                                                         children,
                                                     }) => {
    const { user: viewer } = useAuth();
    const usernameRef = useRef<HTMLHeadingElement>(null); // Ref for the username heading
    const { setUsernameSticky, setStickyUsername, layoutMode } = useUiStore(); // Zustand store actions
    const isLargeScreen = useMediaQuery("(min-width: 1024px)"); // Define large screen breakpoint

    useEffect(() => {
        if (!isLargeScreen) {
            setUsernameSticky(false);
            setStickyUsername(null);
            return;
        }

        // If the username heading is not present (e.g., in Focus/Section View),
        // we should always show the sticky username so the context is clear.
        if (!usernameRef.current) {
            setUsernameSticky(true);
            setStickyUsername(username);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                setUsernameSticky(!entry.isIntersecting);
                setStickyUsername(entry.isIntersecting ? null : username);
            },
            {
                root: null, // relative to the viewport
                rootMargin: "0px",
                threshold: 0.1, // Trigger when 10% of the item is visible/invisible
            }
        );

        observer.observe(usernameRef.current);

        return () => {
            observer.disconnect();
        };
    }, [username, setUsernameSticky, setStickyUsername, layoutMode, isLargeScreen]);

    const handleCopyProfileLink = useCallback(() => {
        const profileLink = `${window.location.origin}/${username}`;
        navigator.clipboard
            .writeText(profileLink)
            .then(() => {
                toast.success("Profile link copied to clipboard!");
            })
            .catch((err) => {
                console.error("Failed to copy: ", err);
                toast.error("Failed to copy profile link.");
            });
    }, [username]);

    const renderContent = () => {
        if (layoutMode === "section") {
            return <SectionViewLayout>{children}</SectionViewLayout>;
        }

        return <div className="main-content-column">{children}</div>;
    };

    const isCardMode = layoutMode === "card";

    return (
        <div
            className={cn(
                "profile-container w-full mx-auto relative transition-all duration-300",

                isCardMode
                    ? "bg-card border border-primary shadow-lg rounded-3xl mt-8 mb-8"
                    : "mt-0 mb-0 max-w-none"
            )}
        >
            {/* Top Right Controls (Owner Only) */}

            {isOwner && (
                <div
                    className={cn(
                        "absolute z-30 flex items-center gap-3",
                        isCardMode
                            ? "top-4 sm:top-8 right-4 md:top-14 md:right-6"
                            : "hidden" // Hide in section mode (fixed positioning removed)
                    )}
                >
                    {/* LayoutToggleSettings is in Drawer, but we can keep a quick toggle here if desired,

                           or rely on the drawer. The plan said Drawer for Owner.

                           Let's keep the clock here only for card mode. */}

                    {timezone && isCardMode && ( // Double check condition
                        <UserClock
                            timezone={timezone}
                            isOwner={isOwner}
                            viewerTimezone={viewer?.timezone}
                        />
                    )}
                </div>
            )}

            {/* Top Right Controls (Guest Only - Clock) */}

            {!isOwner && timezone && (
                <div
                    className={cn(
                        "absolute z-30",
                        isCardMode
                            ? "top-12 right-4 md:top-14 md:right-6"
                            : "top-4 right-4 fixed" // Guest view might still want it fixed?
                            // User request was specific to "focus view" (Edit Mode / Owner View).
                            // Guest view typically doesn't have "Focus View" in the same way, or uses Card Mode.
                            // If Guest View uses Section Mode, we might want it fixed.
                            // But for now, let's leave Guest as is, or hide it if consistent.
                            // Let's assume this change is for Owner Edit Mode.
                    )}
                >
                    <UserClock
                        timezone={timezone}
                        isOwner={isOwner}
                        viewerTimezone={viewer?.timezone}
                    />
                </div>
            )}

            {/* Main card content with its own padding and z-index */}

            <div
                className={cn(
                    "relative z-10",
                    isCardMode ? "p-6 pt-12 sm:p-8 md:p-10 lg:p-12" : "p-0"
                )}
            >
                {isCardMode && (
                    <h1
                        ref={usernameRef} // Attach ref
                        className="text-4xl font-extrabold text-center text-primary mb-8 mt-4 cursor-pointer" // Add cursor-pointer
                        onClick={handleCopyProfileLink} // Attach onClick handler
                    >
                        {isOwner ? `Welcome, ${username}!` : username}
                    </h1>
                )}

                <div className={cn("main-profile-grid", !isCardMode && "w-full")}>
                    {!isCardMode && timezone && isOwner && (
                        <div className="flex justify-end px-4 md:px-8 mb-2">
                             <UserClock
                                timezone={timezone}
                                isOwner={isOwner}
                                viewerTimezone={viewer?.timezone}
                             />
                        </div>
                    )}
                    {renderContent()}
                </div>
            </div>

            {!isOwner && isCardMode && (
                <div className="absolute inset-0 rounded-[inherit] z-20 pointer-events-none">
                    <MovingBorder duration={24000} rx="24" ry="24">
                        <div className="h-1 w-6 bg-[radial-gradient(var(--primary)_60%,transparent_100%)] opacity-100 shadow-[0_0_25px_var(--primary)]" />
                    </MovingBorder>
                </div>
            )}
        </div>
    );
};

export default ProfileLayout;
