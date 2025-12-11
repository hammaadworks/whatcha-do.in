import React, {useEffect, useRef, useState, useCallback} from 'react';
import {Undo2} from 'lucide-react'; // Removed Check
import {toast} from 'sonner'; // Import sonner toast
import {ActionNode} from '@/lib/supabase/types';
import {CircularProgress} from '@/components/ui/circular-progress';
import {Skeleton} from '@/components/ui/skeleton';
import {ActionsList} from '@/components/shared/ActionsList';
import {AddActionForm} from '@/components/shared/AddActionForm';
import {DeletedNodeContext} from '@/lib/utils/actionTreeUtils';
import {CollapsibleSectionWrapper} from '@/components/ui/collapsible-section-wrapper';
import { Confetti, ConfettiRef } from '@/components/ui/confetti'; // Import Confetti
import { useConfettiColors } from '@/hooks/useConfettiColors'; // Import useConfettiColors

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
    onActionToggled?: (id: string) => Promise<ActionNode | undefined>;
    onActionAdded?: (description: string, parentId?: string, isPublic?: boolean) => Promise<void>;
    onActionUpdated?: (id: string, newText: string) => void;
    onActionDeleted?: (id: string) => Promise<DeletedNodeContext | null>;
    undoDeleteAction?: () => void;
    onActionIndented?: (id: string) => Promise<void>;
    onActionOutdented?: (id: string) => void;
    onActionMovedUp?: (id: string) => void;
    onActionMovedDown?: (id: string) => void;
    onActionPrivacyToggled?: (id: string) => void;
    onActionAddedAfter?: (afterId: string, description: string, isPublic?: boolean) => Promise<string>;
    newlyAddedActionId?: string | null; // New prop for focusing and editing a newly added item
    onNewlyAddedActionProcessed?: (id: string) => void; // New prop
    justCompletedId?: string | null;
    privateCount?: number; // New prop
    timezone: string; // Add timezone prop
    isCollapsible?: boolean;
    isFolded?: boolean; // New prop, now optional
    toggleFold?: () => void; // New prop, now optional
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
                                                           timezone, // Destructure timezone prop
                                                           isCollapsible = false,
                                                           isFolded, // Destructure new prop
                                                           toggleFold, // Destructure new prop
                                                       }) => {
    const addActionFormRef = useRef<{
        focusInput: () => void;
        clearInput: () => void;
        isInputFocused: () => boolean;
        isInputEmpty: () => boolean;
        blurInput: () => void;
    }>(null);
    const [focusedActionId, setFocusedActionId] = useState<string | null>(null);
    const [newlyAddedActionId, setNewlyAddedActionId] = useState<string | null>(null); // New state for newly added action
    const handleNewlyAddedActionProcessed = useCallback(() => {
        setNewlyAddedActionId(null);
    }, []);

    const confettiRef = useRef<ConfettiRef>(null); // Confetti ref
    const colors = useConfettiColors(); // Confetti colors hook

    // Handle delete action and show undo toast
    const handleDeleteAction = async (id: string) => {
        if (!onActionDeleted) return;

        const deleted = await onActionDeleted(id);
        if (deleted && undoDeleteAction) {
            const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const shortcutKey = isMac ? '⌘Z' : 'Ctrl+Z';

            toast("Action deleted.", {
                description: (<div className="flex flex-col gap-1">
                    <span>{deleted.node.description}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                             Press <kbd
                        className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">{shortcutKey}</kbd> to undo
                        </span>
                </div>), action: {
                    label: "Undo", onClick: () => undoDeleteAction(),
                }, duration: 5000, // Show toast for 5 seconds
                icon: <Undo2 className="h-4 w-4"/>,
            });
        }
    };

    const handleConfettiTrigger = (rect: DOMRect, isParent: boolean) => {
        if (confettiRef.current) {
            confettiRef.current.fire({
                particleCount: isParent ? 80 : 40, // High density for parent, low for child
                startVelocity: 25,
                spread: 360,
                ticks: 250, // Adjusted for 3s
                origin: {
                    x: (rect.left + rect.width / 2) / window.innerWidth,
                    y: (rect.top + rect.height / 2) / window.innerHeight,
                },
                colors: colors,
                shapes: ['star'],
                disableForReducedMotion: true,
                scalar: isParent ? 1.2 : 0.8,
                decay: 0.9 // Adjusted for 3s
            });
        }
    };


    useEffect(() => {
        if (!isOwner || isReadOnly) return; // Add isReadOnly check

        const handleKeyDown = (event: KeyboardEvent) => {
            // Check for Alt+A (Toggle Add Action form / List focus)
            // Robust check: KeyA code OR explicit characters (including Mac 'å')
            const isA = event.code === 'KeyA' || event.key === 'a' || event.key === 'A' || event.key === 'å';
            if (event.altKey && !event.shiftKey && isA) {
                event.preventDefault();

                if (addActionFormRef.current) {
                    if (addActionFormRef.current.isInputFocused()) {
                        // If form is focused, blur it and focus the first action item
                        addActionFormRef.current.blurInput();
                        const flattened = flattenActionTree(itemsToRender);
                        const activeItems = flattened.filter(a => !a.completed);

                        if (activeItems.length > 0) {
                            setFocusedActionId(activeItems[0].id); // Focus the first active action item
                        } else if (flattened.length > 0) {
                            // Only completed items exist, focus Yay button
                            setFocusedActionId('yay-toggle-root');
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
                const activeItems = flattened.filter(a => !a.completed);

                if (activeItems.length > 0) {
                    setFocusedActionId(activeItems[activeItems.length - 1].id); // Focus the last active action item
                } else if (flattened.length > 0) {
                     // Only completed items exist, focus Yay button
                     setFocusedActionId('yay-toggle-root');
                }
            }
            if (event.key === 'Escape') {
                event.preventDefault(); // Prevent default browser behavior

                // Scenario 1: AddActionForm is focused and empty -> clear and blur it.
                if (addActionFormRef.current?.isInputFocused() && addActionFormRef.current?.isInputEmpty()) {
                    addActionFormRef.current.clearInput();
                    addActionFormRef.current.blurInput();
                    const flattened = flattenActionTree(itemsToRender);
                    if (flattened.length > 0) {
                        setFocusedActionId(flattened[flattened.length - 1].id); // Focus the last item
                    } else {
                        setFocusedActionId(null);
                        (document.activeElement as HTMLElement)?.blur(); // Truly exit section focus
                    }
                }
                // Scenario 2: AddActionForm is focused and HAS content -> clear and blur it.
                else if (addActionFormRef.current?.isInputFocused()) {
                    addActionFormRef.current.clearInput();
                    addActionFormRef.current.blurInput();
                    setFocusedActionId(null); // Clear focus from list
                    (document.activeElement as HTMLElement)?.blur(); // Blur current focus
                }
                // Scenario 3: An ActionItem is focused (but not editing)
                else if (focusedActionId) {
                    setFocusedActionId(null); // Clear focus from the ActionItem
                    (document.activeElement as HTMLElement)?.blur(); // Blur current focus
                }
                // Scenario 4: Nothing specific in the section is focused.
                // This means focus should leave the whole section.
                else {
                    (document.activeElement as HTMLElement)?.blur(); // Blur whatever is currently focused
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

    useEffect(() => {
        if (isAllComplete && confettiRef.current) {
            // Left cannon
            setTimeout(() => { // Add 2-second delay
                if (confettiRef.current) { // Add null check
                    confettiRef.current.fire({
                        particleCount: 100,
                        spread: 70,
                        origin: { x: 0, y: 0.5 }, // From left middle
                        colors: colors,
                        shapes: ['square', 'circle'],
                        disableForReducedMotion: true,
                        scalar: 1.2,
                        ticks: 350, // Adjusted for 6s
                        decay: 0.88 // Adjusted for 6s
                    });
                }
            }, 2000); // 2-second delay
            // Right cannon
            setTimeout(() => { // Add 2-second delay
                if (confettiRef.current) { // Add null check
                    confettiRef.current.fire({
                        particleCount: 100,
                        spread: 70,
                        origin: { x: 1, y: 0.5 }, // From right middle
                        colors: colors,
                        shapes: ['square', 'circle'],
                        disableForReducedMotion: true,
                        scalar: 1.2,
                        ticks: 350, // Adjusted for 6s
                        decay: 0.88 // Adjusted for 6s
                    });
                }
            }, 2000); // 2-second delay
        }
    }, [isAllComplete, colors]); // Trigger when completion status changes

    if (loading && isOwner && !isReadOnly) { // Use loading from prop
        return (<div className="p-4 space-y-3">
            <Skeleton className="h-10 w-full"/>
            <Skeleton className="h-10 w-11/12"/>
            <Skeleton className="h-10 w-full"/>
            <Skeleton className="h-10 w-10/12"/>
        </div>);
    }

    return (
        <CollapsibleSectionWrapper
            title="Actions"
            isCollapsible={isCollapsible}
            isFolded={isFolded} // Pass new prop
            toggleFold={toggleFold} // Pass new prop
            rightElement={
                <div className="flex items-center gap-3">
                    {overallTotal > 0 && (
                        <CircularProgress
                            progress={overallProgressPercentage}
                            size={36}
                            strokeWidth={3}
                            color="text-primary"
                            bgColor="text-muted-foreground"
                            showTickOnComplete={isAllComplete}
                        >
                            {!isAllComplete && (
                                <span className="text-xs text-muted-foreground">{overallCompleted}/{overallTotal}</span>
                            )}
                        </CircularProgress>
                    )}
                </div>
            }
        >
        <Confetti
            ref={confettiRef}
            className="pointer-events-none fixed inset-0 z-[100] w-full h-full"
            manualstart={true}
        />
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
                        flattenedActions={flattenActionTree(itemsToRender).filter(a => !a.completed)}
                        onConfettiTrigger={handleConfettiTrigger} // Pass handler
                        newlyAddedActionId={newlyAddedActionId} // Pass new prop
                        onNewlyAddedActionProcessed={handleNewlyAddedActionProcessed} // Pass new prop
                    />
        {!isOwner && privateCount > 0 && (
            <div className="mt-6 text-center text-muted-foreground italic text-sm animate-pulse">
                Pssst... he's working on {privateCount} more actions privately! 🤫
            </div>)}

        {isOwner && !isReadOnly && ( // Conditional rendering for AddActionForm
            <div className="mt-4">
                <AddActionForm
                    ref={addActionFormRef}
                    onSave={async (desc) => {
                        await onActionAdded?.(desc, undefined, true); // Now awaited
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
    </CollapsibleSectionWrapper>);
};

export default ActionsSection;