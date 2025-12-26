'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { EllipsisVertical, Lock, Globe, Trash, Undo2 } from 'lucide-react'; // Added Undo2 just in case, though toast handles it
import { cn } from '@/lib/utils';
import { ActivityLogEntry } from '@/lib/supabase/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo, AnimatePresence } from 'framer-motion';

interface JournalActivityItemProps {
    activity: ActivityLogEntry;
    onDelete: (id: string) => void;
    onToggleVisibility: (id: string, currentIsPublic: boolean) => void;
    isOwner: boolean;
}

// Helper function to format activity log entries for display
const formatActivityLogEntry = (entry: ActivityLogEntry): string => {
    const time = format(new Date(entry.timestamp), 'hh:mm a');
    const details = entry.details ? Object.entries(entry.details)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => {
            if (key === 'mood_score') return `Mood: ${value}/100`;
            if (key === 'work_value' && entry.details?.duration_unit) return `${value} ${entry.details.duration_unit}`;
            if (key === 'duration_value' && entry.details?.duration_unit) return `${value} ${entry.details.duration_unit}`;
            return `${key}: ${value}`;
        })
        .join(', ') : '';
    const detailString = details ? ` (${details})` : '';

    return `- [${entry.status === 'completed' ? 'x' : ' '}] ${time} ${entry.description}${detailString}`;
};

const LONG_PRESS_DURATION = 500; // ms
const SWIPE_THRESHOLD = 50; // pixels
const BUTTONS_WIDTH = 150;

export const JournalActivityItem: React.FC<JournalActivityItemProps> = ({
    activity,
    onDelete,
    onToggleVisibility,
    isOwner,
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Framer Motion controls
    const x = useMotionValue(0);
    const controls = useAnimation();
    
    // Derived value for buttons position (they follow the content)
    // When x is 0, buttons are at BUTTONS_WIDTH (hidden)
    // When x is -BUTTONS_WIDTH, buttons are at 0 (visible)
    const buttonsX = useTransform(x, (value) => value + BUTTONS_WIDTH);

    // Long press logic
    const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handlePointerDown = useCallback(() => {
        if (!isOwner) return;
        longPressTimeoutRef.current = setTimeout(() => {
            setIsMenuOpen(true);
        }, LONG_PRESS_DURATION);
    }, [isOwner]);

    const cancelLongPress = useCallback(() => {
        if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
            longPressTimeoutRef.current = null;
        }
    }, []);

    const handleDragStart = useCallback(() => {
        cancelLongPress(); // Cancel long press if dragging starts
    }, [cancelLongPress]);

    const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        if (offset < -SWIPE_THRESHOLD || velocity < -500) {
            // Swipe Left - Reveal
            await controls.start({ x: -BUTTONS_WIDTH });
        } else {
            // Snap back
            await controls.start({ x: 0 });
        }
    };

    // Close menu or reset swipe when needed
    useEffect(() => {
        if (isMenuOpen) {
            controls.start({ x: 0 }); // Reset swipe if menu opens
        }
    }, [isMenuOpen, controls]);

    const handleDeleteClick = useCallback(() => {
        onDelete(activity.id);
        setIsMenuOpen(false);
        controls.start({ x: 0 });
    }, [onDelete, activity.id, controls]);

    const handleToggleVisibilityClick = useCallback(() => {
        onToggleVisibility(activity.id, activity.is_public);
        setIsMenuOpen(false);
        controls.start({ x: 0 });
    }, [onToggleVisibility, activity.id, activity.is_public, controls]);

    const formattedActivity = formatActivityLogEntry(activity);

    return (
        <motion.li
            className="relative flex items-center justify-between py-1 overflow-hidden"
            onPointerDown={handlePointerDown}
            onPointerUp={cancelLongPress}
            onPointerLeave={cancelLongPress}
            layout // Helper for list reordering animations if used in AnimatePresence
        >
            {/* Swipeable Content */}
            <motion.div
                className="flex-1 flex items-center pr-4 bg-background z-10 relative"
                drag={isOwner ? "x" : false}
                dragConstraints={{ left: -BUTTONS_WIDTH, right: 0 }}
                dragElastic={0.1}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                animate={controls}
                style={{ x }}
            >
                {/* Desktop Menu Trigger */}
                {isOwner && (
                    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 mr-2 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(true); }}
                            >
                                <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleToggleVisibilityClick}>
                                {activity.is_public ? (
                                    <>
                                        <Lock className="mr-2 h-4 w-4" /> Make Private
                                    </>
                                ) : (
                                    <>
                                        <Globe className="mr-2 h-4 w-4" /> Make Public
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDeleteClick} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
                
                <span className="text-sm text-foreground/80 flex-1 break-words select-none pointer-events-none">
                    {formattedActivity}
                    {isOwner && (
                        <span className="ml-2 text-xs opacity-50 align-middle">
                            {activity.is_public ? <Globe className="inline-block h-3 w-3" /> : <Lock className="inline-block h-3 w-3" />}
                        </span>
                    )}
                </span>
            </motion.div>

            {/* Swipe Buttons (Revealed from right) */}
            {isOwner && (
                <motion.div
                    className="absolute right-0 top-0 bottom-0 flex"
                    style={{ x: buttonsX, width: BUTTONS_WIDTH }}
                >
                    <Button
                        variant="ghost"
                        className="rounded-none h-full flex-1 flex-col justify-center items-center bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                        onClick={handleToggleVisibilityClick}
                    >
                        {activity.is_public ? (
                            <Lock className="h-4 w-4 mb-1" />
                        ) : (
                            <Globe className="h-4 w-4 mb-1" />
                        )}
                        <span className="text-[10px] leading-tight">{activity.is_public ? 'Private' : 'Public'}</span>
                    </Button>
                    <Button
                        variant="ghost"
                        className="rounded-none h-full flex-1 flex-col justify-center items-center bg-red-600 text-white hover:bg-red-700 hover:text-white"
                        onClick={handleDeleteClick}
                    >
                        <Trash className="h-4 w-4 mb-1" />
                        <span className="text-[10px] leading-tight">Delete</span>
                    </Button>
                </motion.div>
            )}
        </motion.li>
    );
};
