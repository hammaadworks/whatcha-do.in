import React, { useState, useRef, useEffect } from 'react';
import { Check, ListTodo, Undo2 } from 'lucide-react'; // Import Undo2
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip"; // Import Check icon
import { toast } from 'sonner'; // Import sonner toast
import { ActionNode } from '@/lib/supabase/types';
import { CircularProgress } from '@/components/ui/circular-progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ActionsList } from '@/components/shared/ActionsList';
import { AddActionForm } from '@/components/shared/AddActionForm';
import { DeletedNodeContext } from '@/lib/utils/actionTreeUtils';

// Helper to recursively count total and completed actions
const getOverallCompletionCounts = (nodes: ActionNode[]): { total: number; completed: number } => {
    let total = 0;
    let completed = 0;

    nodes.forEach(node => {
        total++; // Count the current node
        if (node.completed) {
            completed++;
        }

        if (node.children && node.children.length > 0) {
            const childrenCounts = getOverallCompletionCounts(node.children);
            total += childrenCounts.total;
            completed += childrenCounts.completed;
        }
    });

    return {total, completed};
};

// Flatten the action tree for easier linear navigation
const flattenActionTree = (nodes: ActionNode[]): ActionNode[] => {
    let flattened: ActionNode[] = [];
    nodes.forEach(node => {
        flattened.push(node);
        if (node.children && node.children.length > 0) {
            flattened = flattened.concat(flattenActionTree(node.children));
        }
    });
    return flattened;
};

interface ActionsSectionProps {
    isOwner: boolean;
    isReadOnly?: boolean; // Add isReadOnly prop
    actions: ActionNode[]; // Now required prop
    loading: boolean; // Now required prop
    onActionToggled?: (id: string) => void;
    onActionAdded?: (description: string, parentId?: string, isPublic?: boolean) => void; // Updated signature
    onActionUpdated?: (id: string, newText: string) => void;
    onActionDeleted?: (id: string) => DeletedNodeContext | null; // Updated to return context
    undoDeleteAction?: () => void; // Add undo function prop
    onActionIndented?: (id: string) => void;
    onActionOutdented?: (id: string) => void;
    onActionMovedUp?: (id: string) => void;
    onActionMovedDown?: (id: string) => void;
    onActionPrivacyToggled?: (id: string) => void; // New prop
    onActionAddedAfter?: (afterId: string, description: string, isPublic?: boolean) => void; // New prop
    justCompletedId?: string | null;
    privateCount?: number; // New prop
    timezone: string; // Add timezone prop
}

const ActionsSection: React.FC<ActionsSectionProps> = ({
                                                           isOwner,
                                                           isReadOnly = false, // Set default to false
                                                           actions: itemsToRender, // Direct usage of props
                                                           loading,
                                                           onActionToggled,
                                                           onActionAdded,
                                                           onActionUpdated,
                                                           onActionDeleted,
                                                           undoDeleteAction,
                                                           onActionIndented,
                                                           onActionOutdented,
                                                           onActionMovedUp,
                                                           onActionMovedDown,
                                                           onActionPrivacyToggled,
                                                           onActionAddedAfter,
                                                           justCompletedId,
                                                           privateCount = 0,
                                                           timezone // Destructure timezone prop
                                                       }) => {
    const addActionFormRef = useRef<{
        focusInput: () => void;
        clearInput: () => void;
        isInputFocused: () => boolean;
        isInputEmpty: () => boolean;
        blurInput: () => void;
    }>(null);
    const [focusedActionId, setFocusedActionId] = useState<string | null>(null);

    // Handle delete action and show undo toast
    const handleDeleteAction = (id: string) => {
        if (!onActionDeleted) return;
        
        const deleted = onActionDeleted(id);
        if (deleted && undoDeleteAction) {
            const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const shortcutKey = isMac ? '⌘Z' : 'Ctrl+Z';

            toast("Action deleted.", {
                description: (
                    <div className="flex flex-col gap-1">
                        <span>{deleted.node.description}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                             Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">{shortcutKey}</kbd> to undo
                        </span>
                    </div>
                ),
                action: {
                    label: "Undo",
                    onClick: () => undoDeleteAction(),
                },
                duration: 5000, // Show toast for 5 seconds
                icon: <Undo2 className="h-4 w-4" />,
            });
        }
    };


    useEffect(() => {
        if (!isOwner || isReadOnly) return; // Add isReadOnly check

        const handleKeyDown = (event: KeyboardEvent) => {
            // Check for Alt+A (Toggle Add Action form / List focus)
            if (event.altKey && (event.key === 'a' || event.key === 'A')) {
                event.preventDefault();

                if (addActionFormRef.current) {
                    if (addActionFormRef.current.isInputFocused()) {
                        // If form is focused, blur it and focus the first action item
                        addActionFormRef.current.blurInput();
                        const flattened = flattenActionTree(itemsToRender);
                        if (flattened.length > 0) {
                            setFocusedActionId(flattened[0].id); // Focus the first action item
                        }
                    } else {
                        // Otherwise, focus the form
                        setFocusedActionId(null); // Clear focus from list
                        addActionFormRef.current.focusInput();
                    }
                }
            } 
            // Up Arrow in Input -> Focus Last Item (from AddActionForm input)
            else if (event.key === 'ArrowUp' && addActionFormRef.current?.isInputFocused()) {
                event.preventDefault();
                addActionFormRef.current.blurInput();
                const flattened = flattenActionTree(itemsToRender);
                if (flattened.length > 0) {
                    setFocusedActionId(flattened[flattened.length - 1].id); // Focus the last action item
                }
            }
            // Escape (Clear Input / Blur Input / Focus Last Item)
            else if (event.key === 'Escape' && addActionFormRef.current?.isInputFocused() && addActionFormRef.current?.isInputEmpty()) {
                event.preventDefault();
                addActionFormRef.current.clearInput();
                addActionFormRef.current.blurInput(); // Blur the input
                // Optional: move focus to the last action item if available
                const flattened = flattenActionTree(itemsToRender);
                if (flattened.length > 0) {
                    setFocusedActionId(flattened[flattened.length - 1].id);
                }
            }
            // Ctrl+Z (Undo)
            else if ((event.ctrlKey || event.metaKey) && (event.key === 'z' || event.key === 'Z')) {
                event.preventDefault();
                if (undoDeleteAction) {
                    undoDeleteAction();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOwner, isReadOnly, itemsToRender, focusedActionId, setFocusedActionId, addActionFormRef, loading, undoDeleteAction]); // Add loading to deps

    const {total: overallTotal, completed: overallCompleted} = getOverallCompletionCounts(itemsToRender);
    const overallProgressPercentage = overallTotal > 0 ? (overallCompleted / overallTotal) * 100 : 0;

    const isAllComplete = overallTotal > 0 && overallCompleted === overallTotal;

    if (loading && isOwner && !isReadOnly) { // Use loading from prop
        return (<div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full"/>
                <Skeleton className="h-10 w-11/12"/>
                <Skeleton className="h-10 w-full"/>
                <Skeleton className="h-10 w-10/12"/>
            </div>);
    }

    return (<div className="section mb-10">
            <div className="flex justify-between items-center border-b border-primary pb-4 mb-6">
                <h2 className="text-2xl font-extrabold text-primary">Actions</h2>
                <div className="flex items-center gap-3">
                    {overallTotal > 0 && (isAllComplete ? (
                            <div className="relative flex items-center justify-center" style={{width: 36, height: 36}}>
                                <Check
                                    size={36}
                                    className="text-primary animate-spin-scale" // Need to define this animation
                                />
                                <span
                                    className="absolute text-xs text-muted-foreground">{overallCompleted}/{overallTotal}</span>
                            </div>) : (<CircularProgress
                                progress={overallProgressPercentage}
                                size={36}
                                strokeWidth={3}
                                color="text-primary"
                                bgColor="text-muted-foreground"
                            >
                                <span className="text-xs text-muted-foreground">{overallCompleted}/{overallTotal}</span>
                            </CircularProgress>))}
                </div>
            </div>
            <ActionsList
                actions={itemsToRender}
                onActionToggled={isOwner && !isReadOnly ? onActionToggled : undefined}
                onActionAdded={isOwner && !isReadOnly ? onActionAdded : undefined}
                onActionUpdated={isOwner && !isReadOnly ? onActionUpdated : undefined}
                onActionDeleted={isOwner && !isReadOnly ? handleDeleteAction : undefined}
                onActionIndented={isOwner && !isReadOnly ? onActionIndented : undefined}
                onActionOutdented={isOwner && !isReadOnly ? onActionOutdented : undefined}
                onActionMovedUp={isOwner && !isReadOnly ? onActionMovedUp : undefined}
                onActionMovedDown={isOwner && !isReadOnly ? onActionMovedDown : undefined}
                onActionPrivacyToggled={isOwner && !isReadOnly ? onActionPrivacyToggled : undefined}
                onActionAddedAfter={isOwner && !isReadOnly ? onActionAddedAfter : undefined}
                justCompletedId={justCompletedId}
                focusedActionId={focusedActionId}
                setFocusedActionId={setFocusedActionId}
                flattenedActions={flattenActionTree(itemsToRender)}
            />

            {!isOwner && privateCount > 0 && (
                <div className="mt-6 text-center text-muted-foreground italic text-sm animate-pulse">
                    Pssst... he's working on {privateCount} more actions privately! 🤫
                </div>)}

            {isOwner && !isReadOnly && ( // Conditional rendering for AddActionForm
                <div className="mt-4">
                    <AddActionForm
                        ref={addActionFormRef}
                        onSave={(desc) => {
                            onActionAdded?.(desc, undefined, true); // Pass true for isPublic
                            addActionFormRef.current?.clearInput();
                            addActionFormRef.current?.focusInput();
                        }}
                        onCancel={() => {
                            addActionFormRef.current?.clearInput();
                            const flattened = flattenActionTree(itemsToRender);
                            if (flattened.length > 0) {
                                setFocusedActionId(flattened[flattened.length - 1].id);
                            }
                        }}
                        triggerKey="A" // Pass triggerKey
                        autoFocusOnMount={false}
                    />
                </div>)}
        </div>);
};

export default ActionsSection;