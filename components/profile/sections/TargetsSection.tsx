import React, {useState, useEffect, useRef} from 'react';
import {TargetBucket, useTargets} from '@/hooks/useTargets';
import {ActionsList} from '@/components/shared/ActionsList';
import {AddActionForm} from '@/components/shared/AddActionForm';
import {Button} from '@/components/ui/button';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Skeleton} from '@/components/ui/skeleton';
import {format, parseISO} from 'date-fns';
import {getMonthStartDate} from '@/lib/date';
import {ActionNode} from '@/lib/supabase/types';
import {Activity, Check, Undo2} from 'lucide-react'; // Added Check, Undo2
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from "@/components/ui/tooltip";
import {CircularProgress} from '@/components/ui/circular-progress'; // Added CircularProgress
import { toast } from 'sonner'; // Import sonner toast

interface TargetsSectionProps {
    isOwner: boolean;
    isReadOnly?: boolean; // Add isReadOnly prop
    timezone: string;
    targets?: ActionNode[]; // Optional targets prop
}

// Helper to recursively count total and completed actions for a given list of ActionNodes
const getMonthlyTargetCompletionCounts = (nodes: ActionNode[]): { total: number; completed: number } => {
    let total = 0;
    let completed = 0;

    nodes.forEach(node => {
        total++; // Count the current node
        if (node.completed) {
            completed++;
        }

        if (node.children && node.children.length > 0) {
            const childrenCounts = getMonthlyTargetCompletionCounts(node.children);
            total += childrenCounts.total;
            completed += childrenCounts.completed;
        }
    });

    return {total, completed};
};

export default function TargetsSection({
                                           isOwner,
                                           isReadOnly = false,
                                           timezone,
                                           targets: propTargets
                                       }: TargetsSectionProps) {
    const {
        buckets,
        loading,
        addTarget,
        addTargetAfter, // Destructure new function
        toggleTarget,
        updateTargetText,
        deleteTarget,
        undoDeleteTarget, // Add undoDeleteTarget
        lastDeletedTargetContext, // Add lastDeletedTargetContext
        indentTarget,
        outdentTarget,
        moveTargetUp,
        moveTargetDown,
        toggleTargetPrivacy, // Add this
        moveTargetToBucket
    } = useTargets(isOwner, timezone, propTargets); // Pass propTargets to hook

    const [activeTab, setActiveTab] = useState<TargetBucket>('current');
    const [focusedActionId, setFocusedActionId] = useState<string | null>(null); // Add focus state
    const addTargetFormRef = useRef<{
        focusInput: () => void;
        clearInput: () => void;
        isInputFocused: () => boolean;
        isInputEmpty: () => boolean;
        blurInput: () => void;
    }>(null);

    // Handle delete target and show undo toast
    const handleDeleteTarget = (bucket: TargetBucket, id: string) => {
        const deleted = deleteTarget(bucket, id);
        if (deleted) {
            const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const shortcutKey = isMac ? '⌘Z' : 'Ctrl+Z';

            toast("Target deleted.", {
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
                    onClick: () => undoDeleteTarget(),
                },
                duration: 5000, // Show toast for 5 seconds
                icon: <Undo2 className="h-4 w-4" />,
            });
        }
    };

    // Keyboard event handling for Alt+A and ArrowUp
    useEffect(() => {
        if (!isOwner || isReadOnly) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            // Alt + T (Toggle Add Target form / List focus) - Changed from Alt + A
            if (event.altKey && (event.key === 't' || event.key === 'T')) {
                event.preventDefault();

                if (addTargetFormRef.current) {
                    if (addTargetFormRef.current.isInputFocused()) {
                        addTargetFormRef.current.blurInput();
                        const flattened = flattenActionTree(buckets[activeTab]);
                        if (flattened.length > 0) {
                            setFocusedActionId(flattened[0].id);
                        }
                    } else {
                        setFocusedActionId(null);
                        addTargetFormRef.current.focusInput();
                    }
                }
            }
            // ArrowUp in Input -> Focus Last Item (from AddActionForm input)
            else if (event.key === 'ArrowUp' && addTargetFormRef.current?.isInputFocused()) {
                event.preventDefault();
                addTargetFormRef.current.blurInput();
                const flattened = flattenActionTree(buckets[activeTab]);
                if (flattened.length > 0) {
                    setFocusedActionId(flattened[flattened.length - 1].id);
                }
            }
            // Escape (Clear Input / Blur Input / Focus Last Item)
            else if (event.key === 'Escape' && addTargetFormRef.current?.isInputFocused() && addTargetFormRef.current?.isInputEmpty()) {
                event.preventDefault();
                addTargetFormRef.current.clearInput();
                addTargetFormRef.current.blurInput();
                const flattened = flattenActionTree(buckets[activeTab]);
                if (flattened.length > 0) {
                    setFocusedActionId(flattened[flattened.length - 1].id);
                }
            }
            // Ctrl+Z (Undo)
            else if ((event.ctrlKey || event.metaKey) && (event.key === 'z' || event.key === 'Z')) {
                event.preventDefault();
                // Check if current bucket or future allows editing
                const canEdit = activeTab === 'current' || activeTab === 'future';
                if (canEdit && lastDeletedTargetContext) {
                    undoDeleteTarget();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOwner, isReadOnly, activeTab, buckets, addTargetFormRef]);


    // Date labels
    const currentMonthLabel = format(parseISO(getMonthStartDate(0, timezone)), 'MMM yyyy');
    const prevMonthLabel = format(parseISO(getMonthStartDate(-1, timezone)), 'MMM');
    const prev1MonthLabel = format(parseISO(getMonthStartDate(-2, timezone)), 'MMM');

    // Calculate progress for the current month's targets
    const {total: currentMonthTotal, completed: currentMonthCompleted} = getMonthlyTargetCompletionCounts(buckets.current);
    const currentMonthProgressPercentage = currentMonthTotal > 0 ? (currentMonthCompleted / currentMonthTotal) * 100 : 0;
    const isCurrentMonthAllComplete = currentMonthTotal > 0 && currentMonthCompleted === currentMonthTotal;

    // Helper (duplicated from ActionsSection, ideally move to utils)
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

    const renderTabContent = (bucket: TargetBucket) => {
        const actions = buckets[bucket];
        const canEdit = isOwner && !isReadOnly && (bucket === 'current' || bucket === 'future');

        // Flatten for ActionsList focus management
        const flattened = flattenActionTree(actions);

        return (<div className="mt-4">
                <ActionsList
                    actions={actions}
                    onActionToggled={canEdit ? (id) => toggleTarget(bucket, id) : undefined}
                    onActionAdded={canEdit ? (desc, parentId) => addTarget(bucket, desc, parentId) : undefined}
                    onActionUpdated={canEdit ? (id, text) => updateTargetText(bucket, id, text) : undefined}
                    onActionDeleted={canEdit ? (id) => handleDeleteTarget(bucket, id) : undefined} // Use local handler
                    onActionIndented={canEdit ? (id) => indentTarget(bucket, id) : undefined}
                    onActionOutdented={canEdit ? (id) => outdentTarget(bucket, id) : undefined}
                    onActionMovedUp={canEdit ? (id) => moveTargetUp(bucket, id) : undefined}
                    onActionMovedDown={canEdit ? (id) => moveTargetDown(bucket, id) : undefined}
                    onActionPrivacyToggled={canEdit ? (id) => toggleTargetPrivacy(bucket, id) : undefined} // Enable privacy toggle
                    onActionAddedAfter={canEdit ? (afterId, description, isPublic) => addTargetAfter(bucket, afterId, description, isPublic) : undefined} // New
                    flattenedActions={flattened}
                    focusedActionId={focusedActionId} // Pass focusedActionId
                    setFocusedActionId={setFocusedActionId} // Pass setFocusedActionId
                />

                {canEdit && (<div className="mt-4">
                        <AddActionForm
                            ref={addTargetFormRef}
                            onSave={(desc) => addTarget(bucket, desc)}
                            onCancel={() => {
                                addTargetFormRef.current?.clearInput();
                                const currentFlattened = flattenActionTree(buckets[activeTab]); // Get fresh flattened list
                                if (currentFlattened.length > 0) {
                                    setFocusedActionId(currentFlattened[currentFlattened.length - 1].id);
                                }
                            }}
                            triggerKey="T" // Pass triggerKey for Targets (Alt+T)
                            autoFocusOnMount={false}
                        />
                    </div>)}

                {/* Move to Current button for Future items */}
                {bucket === 'future' && isOwner && actions.length > 0 && !isReadOnly && ( // Only show if not read-only
                    <div className="mt-4 p-4 bg-muted/20 rounded-md border border-dashed">
                        <p className="text-xs text-muted-foreground mb-2">Move selected items to current month?</p>
                    </div>)}
            </div>);
    };

    if (loading) {
        return <Skeleton className="h-64 w-full"/>;
    }

    // If not owner and not read-only (shouldn't happen in public view, but safe guard)
    // Actually, if targets are empty and not owner, maybe hide?
    // But let's show empty state if that's desired.
    if (!isOwner && !isReadOnly) return null;

    return (<div className="space-y-4">
            <div className="flex justify-between items-center border-b border-primary pb-4 mb-6">
                <h2 className="text-2xl font-extrabold text-primary">Targets</h2>
                <div className="flex items-center gap-3">
                    {currentMonthTotal > 0 && (isCurrentMonthAllComplete ? (
                            <div className="relative flex items-center justify-center" style={{width: 36, height: 36}}>
                                <Check
                                    size={36}
                                    className="text-primary animate-spin-scale" // Need to define this animation
                                />
                                <span
                                    className="absolute text-xs text-muted-foreground">{currentMonthCompleted}/{currentMonthTotal}</span>
                            </div>) : (<CircularProgress
                                progress={currentMonthProgressPercentage}
                                size={36}
                                strokeWidth={3}
                                color="text-primary"
                                bgColor="text-muted-foreground"
                            >
                                <span className="text-xs text-muted-foreground">{currentMonthCompleted}/{currentMonthTotal}</span>
                            </CircularProgress>))}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as TargetBucket)} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="prev1">{prev1MonthLabel}</TabsTrigger>
                    <TabsTrigger value="prev">{prevMonthLabel}</TabsTrigger>
                    <TabsTrigger value="current">{currentMonthLabel}</TabsTrigger>
                    <TabsTrigger value="future">Future</TabsTrigger>
                </TabsList>

                <TabsContent value="prev1">{renderTabContent('prev1')}</TabsContent>
                <TabsContent value="prev">{renderTabContent('prev')}</TabsContent>
                <TabsContent value="current">{renderTabContent('current')}</TabsContent>
                <TabsContent value="future">{renderTabContent('future')}</TabsContent>
            </Tabs>
        </div>);
}

// Helper (duplicated from ActionsSection, ideally move to utils)
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