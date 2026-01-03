'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SparklesText } from '@/components/ui/sparkles-text';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from "framer-motion";
import { Shuffle, Pencil, RotateCcw } from 'lucide-react'; // Added RotateCcw for Reset
import { Button } from '@/components/ui/button';
import CustomQuotesModal from '@/components/profile/CustomQuotesModal';
import { useAuth } from '@/hooks/useAuth';
import { QuoteItem } from '@/lib/supabase/types';
import {
    fetchUserMotivations,
    addUserMotivation,
    editUserMotivation,
    deleteUserMotivation,
    getUserByUsernameClient // To fetch user ID for public profiles
} from '@/lib/supabase/user.client';
import { toast } from 'sonner';
import { useParams } from 'next/navigation'; // Import useParams

interface MotivationsSectionProps {
    username: string; // Passed username for public profiles
    isOwner: boolean;
    isReadOnly?: boolean;
    loading: boolean; // Prop indicating if parent data is loading
}

const defaultQuote: QuoteItem = { id: 'default', text: "Work on your dreams as if your life depends on it. Because it does." };

const hardcoded_quotes = [
    "Get up. Discipline is how ambition turns into money.",
    "Consistency is boring,but it pays rent and freedom.",
    "Your habits are literally designing your bank account.",
    "Stand up and act like the disciplined version of you.",
    "One focused action today builds tomorrow's income.",
    "Discipline beats motivation, especially on lazy days.",
    "Do the small habit now. Let compounding cook.",
    "Your identity decides your income, move accordingly.",
    "Lock in daily. Success loves predictable effort.",
    "Consistency is how underachievers turn unstoppable.",
    "Build habits that make success automatic.",
    "Focus is currency, stop spending it on nothing.",
    "Act broke in effort, rich in discipline.",
    "You don't feel disciplined. You act disciplined.",
    "Your routine is your wealth strategy.",
    "Show up tired. Consistency still counts.",
    "Discipline today funds freedom tomorrow.",
    "Stack disciplined days. Watch money follow.",
    "Habits don't ask how you feel. Neither should you.",
    "Get up. Become the person who doesn't quit."
];

const MotivationsSection: React.FC<MotivationsSectionProps> = ({ username, loading, isOwner }) => {
    const { user, loading: isAuthLoading } = useAuth();
    const [isInteracting, setIsInteracting] = useState(false);
    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
    const [motivations, setMotivations] = useState<QuoteItem[]>([]);
    const [currentQuote, setCurrentQuote] = useState<QuoteItem>(defaultQuote);
    const [initialGuestQuote, setInitialGuestQuote] = useState<QuoteItem>(defaultQuote); // Stores the first quote seen by guest
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const authUserId = user?.id; // Authenticated user's ID
    const params = useParams();
    const profileUsername = params.username as string; // The username from the URL

    // Determine the actual userId to fetch motivations for
    // If it's the owner, use their authUserId. If it's a guest, we need to fetch the profile owner's ID
    const userIdToFetch = isOwner ? authUserId : undefined; // Will be determined in useEffect for guests

    useEffect(() => {
        const getMotivations = async () => {
            let targetUserId: string | undefined;

            if (isOwner && authUserId) {
                targetUserId = authUserId;
            } else if (!isOwner && profileUsername) {
                // For guests viewing a public profile, fetch the user's ID first
                const profileUser = await getUserByUsernameClient(profileUsername);
                if (profileUser) {
                    targetUserId = profileUser.id;
                }
            }

            if (targetUserId) {
                const fetchedMotivations = await fetchUserMotivations(targetUserId);
                if (fetchedMotivations && fetchedMotivations.length > 0) {
                    setMotivations(fetchedMotivations);
                    setCurrentQuote(fetchedMotivations[0]); // Set initial quote to the first one
                    setInitialGuestQuote(fetchedMotivations[0]); // Also set for guest reset
                } else {
                    setMotivations([]);
                    setCurrentQuote(defaultQuote);
                    setInitialGuestQuote(defaultQuote);
                }
            } else {
                setMotivations([]);
                setCurrentQuote(defaultQuote);
                setInitialGuestQuote(defaultQuote);
            }
        };

        getMotivations();
    }, [authUserId, isOwner, profileUsername]); // Depend on authUserId for owner, profileUsername for guest

    const handleInteraction = useCallback(() => {
        setIsInteracting(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsInteracting(false);
        }, 5000); // Increased to 5s
    }, []);

    const handleShuffle = useCallback(() => {
        // Pick a random quote from the hardcoded list
        const randomIndex = Math.floor(Math.random() * hardcoded_quotes.length);
        const randomText = hardcoded_quotes[randomIndex];
        
        setCurrentQuote({
            id: `hardcoded-${Date.now()}`, // Temporary unique ID
            text: randomText
        });
        
        toast.info("Work in progress stay tuned");
    }, []);

    const handleReset = useCallback(() => {
        setCurrentQuote(initialGuestQuote);
        toast.info("Motivation reset to original.");
    }, [initialGuestQuote]);


    const handleAddQuote = async (text: string) => {
        if (!authUserId) return; // Use authUserId for owner actions
        const { data, error: _error } = await addUserMotivation(authUserId, text);
        if (data) {
            setMotivations(data);
            setCurrentQuote(data[0]); // Set newly added quote as current
            toast.success("Quote added!");
        } else {
            toast.error("Failed to add quote.");
        }
    };

    const handleEditQuote = async (id: string, newText: string) => {
        if (!authUserId) return; // Use authUserId for owner actions
        const { data, error: _error } = await editUserMotivation(authUserId, id, newText);
        if (data) {
            setMotivations(data);
            if (currentQuote.id === id) {
                setCurrentQuote({ id, text: newText }); // Update current quote if it was the edited one
            }
            toast.success("Quote updated!");
        } else {
            toast.error("Failed to update quote.");
        }
    };

    const handleDeleteQuote = async (id: string) => {
        if (!authUserId) return; // Use authUserId for owner actions
        const { data, error: _error } = await deleteUserMotivation(authUserId, id);
        if (data) {
            setMotivations(data);
            if (currentQuote.id === id) {
                setCurrentQuote(data.length > 0 ? data[0] : defaultQuote); // If deleted, set to first or default
            }
            toast.success("Quote removed.");
        } else {
            toast.error("Failed to remove quote.");
        }
    };

    const handleSelectQuote = useCallback((text: string) => {
        const selected = motivations.find(q => q.text === text);
        if (selected) {
            setCurrentQuote(selected);
            // toast.success("New motivation selected!"); // Removed to avoid double toasts
        }
    }, [motivations]);


    if (loading || isAuthLoading) return null; // Show loading if parent or auth is loading

    const showAuthorTag = !isOwner && currentQuote.id !== 'default';
    const hasMotivations = motivations.length > 0;

    return (
        <>
            <div
                className="flex flex-col items-center justify-center py-6 px-4 w-full text-center group select-none cursor-default"
                onMouseEnter={handleInteraction}
                onClick={handleInteraction}
                onTouchStart={handleInteraction}
            >
                <div className="relative max-w-4xl">
                     {/* Decorative large quote mark */}
                    <span className={cn(
                        "absolute -top-6 -left-2 text-6xl md:-top-10 md:-left-12 md:text-9xl font-serif leading-none select-none pointer-events-none transition-all duration-700",
                        "text-primary/30 translate-y-0 opacity-100", // Muted color as requested
                        isInteracting ? "scale-110 text-primary/40" : "scale-100"
                    )}>
                        &ldquo;
                    </span>

                    <SparklesText
                        className={cn(
                            "text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed italic tracking-wide transition-all duration-500",
                            "text-primary", // Default text color
                            isInteracting && "text-primary", // Highlight on interaction
                            "font-serif"
                        )}
                        colors={{ first: "var(--primary)", second: "var(--accent)" }} // Use theme colors, avoid black
                        sparklesCount={12}
                        active={isInteracting}
                    >
                        {currentQuote.text}
                    </SparklesText>

                    {showAuthorTag && (
                        <p className="mt-2 text-xs text-muted-foreground font-light tracking-wide">- {username}</p>
                    )}

                    <div className="h-10 mt-6 overflow-hidden relative w-full flex justify-center items-center">
                        <AnimatePresence>
                            {isInteracting && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="flex items-center gap-6"
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-5 text-sm font-medium rounded-full border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/60 transition-all duration-300 backdrop-blur-sm shadow-sm gap-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleShuffle();
                                        }}
                                    >
                                        <Shuffle className="w-4 h-4" />
                                        Shuffle
                                    </Button>

                                    {isOwner ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 px-5 text-sm font-medium rounded-full border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/60 transition-all duration-300 backdrop-blur-sm shadow-sm gap-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsCustomModalOpen(true);
                                            }}
                                        >
                                            <Pencil className="w-4 h-4" />
                                            Custom
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 px-5 text-sm font-medium rounded-full border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/60 transition-all duration-300 backdrop-blur-sm shadow-sm gap-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleReset();
                                            }}
                                            disabled={currentQuote.id === initialGuestQuote.id || currentQuote.id === defaultQuote.id}
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Reset
                                        </Button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <CustomQuotesModal
                isOpen={isCustomModalOpen}
                onClose={() => setIsCustomModalOpen(false)}
                initialQuotes={motivations}
                onAddQuote={handleAddQuote}
                onDeleteQuote={handleDeleteQuote}
                onEditQuote={handleEditQuote}
                onSelectQuote={(text) => {
                    handleSelectQuote(text);
                    setIsCustomModalOpen(false); // Close modal after selection
                }}
            />
        </>
    );
};

export default MotivationsSection;