import React, { useCallback, useEffect, useRef, useState } from "react";
import { TargetBucket, useTargets } from "@/hooks/useTargets";
import { ActionsList } from "@/components/shared/ActionsList";
import { AddActionForm } from "@/components/shared/AddActionForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { getCurrentMonthStartISO, getReferenceDateUI, parseISO } from "@/lib/date";
import { ActionNode } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { Undo2 } from "lucide-react"; // Removed Check, Undo2
import { CircularProgress } from "@/components/ui/circular-progress"; // Added CircularProgress
import { toast } from "sonner"; // Import sonner toast
import { useSimulatedTime } from "@/components/layout/SimulatedTimeProvider";

interface TargetsSectionProps {
  isOwner: boolean;
  isReadOnly?: boolean; // Add isReadOnly prop
  timezone: string;
  targets?: ActionNode[]; // Optional targets prop
  onActivityLogged?: () => void; // New prop
  isCollapsible?: boolean; // New prop
  isFolded?: boolean; // New prop
  toggleFold?: () => void; // New prop
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

  return { total, completed };
};

export default function TargetsSection({
                                         isOwner, isReadOnly = false, timezone, targets: propTargets, onActivityLogged,
                                         isCollapsible = false, isFolded, toggleFold // Destructure new props
                                       }: TargetsSectionProps) {
  const {
    buckets, loading, addTarget, addTargetAfter, // Destructure new function
    toggleTarget, updateTargetText, deleteTarget, undoDeleteTarget, // Add undoDeleteTarget
    lastDeletedTargetContext, // Add lastDeletedTargetContext
    indentTarget, outdentTarget, moveTargetUp, moveTargetDown, toggleTargetPrivacy, // Add this
    moveTargetToBucket
  } = useTargets(isOwner, timezone, propTargets); // Pass propTargets to hook

  const { simulatedDate } = useSimulatedTime();
  const refDate = getReferenceDateUI(simulatedDate);

  const [activeTab, setActiveTab] = useState<TargetBucket>("current");
  const [focusedActionId, setFocusedActionId] = useState<string | null>(null); // Add focus state
  const [newlyAddedActionId, setNewlyAddedActionId] = useState<string | null>(null); // New state for newly added action
  const handleNewlyAddedActionProcessed = useCallback(() => {
    setNewlyAddedActionId(null);
  }, []);
  const addTargetFormRef = useRef<{
    focusInput: () => void;
    clearInput: () => void;
    isInputFocused: () => boolean;
    isInputEmpty: () => boolean;
    blurInput: () => void;
  }>(null);

  // Handle delete target and show undo toast
  const handleDeleteTarget = async (bucket: TargetBucket, id: string) => {
    const deletedContext = await deleteTarget(bucket, id);
    if (deletedContext) {
      const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const shortcutKey = isMac ? "⌘Z" : "Ctrl+Z";

      toast("Target deleted.", {
        description: (<div className="flex flex-col gap-1">
          <span>{deletedContext.node.description}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
                             Press <kbd
            className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">{shortcutKey}</kbd> to undo
                        </span>
        </div>), action: {
          label: "Undo", onClick: () => undoDeleteTarget()
        }, duration: 5000, // Show toast for 5 seconds
        icon: <Undo2 className="h-4 w-4" />
      });
    }
  };

  // Keyboard event handling for Alt+A and ArrowUp
  useEffect(() => {
    if (!isOwner || isReadOnly) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + T (Toggle Add Target form / List focus) - Changed from Alt + A
      if (event.altKey && !event.shiftKey && event.code === "KeyT") {
        event.preventDefault();

        if (addTargetFormRef.current) {
          if (addTargetFormRef.current.isInputFocused()) {
            addTargetFormRef.current.blurInput();
            const flattened = flattenActionTree(buckets[activeTab]);
            const activeItems = flattened.filter(a => !a.completed);

            if (activeItems.length > 0) {
              setFocusedActionId(activeItems[0].id);
            } else if (flattened.length > 0) {
              // Only completed items exist, focus Yay button
              setFocusedActionId("yay-toggle-root");
            }
          } else {
            setFocusedActionId(null);
            addTargetFormRef.current.focusInput();
          }
        }
      }
      // ArrowUp in Input -> Focus Last Item (from AddActionForm input)
      else if (event.key === "ArrowUp" && addTargetFormRef.current?.isInputFocused()) {
        event.preventDefault();
        addTargetFormRef.current.blurInput();
        const flattened = flattenActionTree(buckets[activeTab]);
        const activeItems = flattened.filter(a => !a.completed);

        if (activeItems.length > 0) {
          setFocusedActionId(activeItems[activeItems.length - 1].id);
        } else if (flattened.length > 0) {
          // Only completed items exist, focus Yay button
          setFocusedActionId("yay-toggle-root");
        }
      }
      if (event.key === "Escape") {
        event.preventDefault(); // Prevent default browser behavior

        // Scenario 1: AddTargetForm is focused and empty -> clear and blur it.
        if (addTargetFormRef.current?.isInputFocused() && addTargetFormRef.current?.isInputEmpty()) {
          addTargetFormRef.current.clearInput();
          addTargetFormRef.current.blurInput();
          const flattened = flattenActionTree(buckets[activeTab]);
          if (flattened.length > 0) {
            setFocusedActionId(flattened[flattened.length - 1].id); // Focus the last item
          } else {
            setFocusedActionId(null);
            (document.activeElement as HTMLElement)?.blur(); // Truly exit section focus
          }
        }
        // Scenario 2: AddTargetForm is focused and HAS content -> clear and blur it.
        else if (addTargetFormRef.current?.isInputFocused()) {
          addTargetFormRef.current.clearInput();
          addTargetFormRef.current.blurInput();
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
      else if ((event.ctrlKey || event.metaKey) && (event.key === "z" || event.key === "Z")) {
        event.preventDefault();
        // Check if current bucket or future allows editing
        const canEdit = activeTab === "current" || activeTab === "future";
        if (canEdit && lastDeletedTargetContext) {
          undoDeleteTarget();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOwner, isReadOnly, activeTab, buckets, addTargetFormRef]);


  // Date labels
  const currentMonthLabel = format(parseISO(getCurrentMonthStartISO(timezone, refDate)), "MMM yyyy");
  const prevMonthLabel = format(parseISO(getCurrentMonthStartISO(timezone, refDate, -1)), "MMM");
  const prev1MonthLabel = format(parseISO(getCurrentMonthStartISO(timezone, refDate, -2)), "MMM");

  // Calculate progress for the current month's targets
  const {
    total: currentMonthTotal,
    completed: currentMonthCompleted
  } = getMonthlyTargetCompletionCounts(buckets.current);
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
    const canEdit = isOwner && !isReadOnly && (bucket === "current"); // Only allow *marking/unmarking and other destructive edits* for the current month

    // Flatten for ActionsList focus management
    const flattened = flattenActionTree(actions);

    return (<div className="mt-4">
      <ActionsList
        actions={actions}
        onActionToggled={canEdit ? async (id) => {
          const toggledNode = await toggleTarget(bucket, id); // AWAIT HERE
          onActivityLogged?.();
          return toggledNode;
        } : undefined}
        onActionAdded={canEdit ? async (desc, parentId) => { // Make async
          await addTarget(bucket, desc, parentId); // AWAIT HERE
        } : undefined}
        onActionUpdated={canEdit ? (id, text) => updateTargetText(bucket, id, text) : undefined}
        onActionDeleted={canEdit ? (id) => handleDeleteTarget(bucket, id) : undefined} // Use local handler
        onActionIndented={canEdit ? async (id) => { // Make async
          await indentTarget(bucket, id); // AWAIT HERE
        } : undefined}
        onActionOutdented={canEdit ? (id) => outdentTarget(bucket, id) : undefined}
        onActionMovedUp={canEdit ? (id) => moveTargetUp(bucket, id) : undefined}
        onActionMovedDown={canEdit ? (id) => moveTargetDown(bucket, id) : undefined}
        onActionPrivacyToggled={canEdit ? (id) => toggleTargetPrivacy(bucket, id) : undefined} // Enable privacy toggle
        onActionAddedAfter={canEdit ? async (afterId, description, isPublic) => { // Make async
          const newActionId = await addTargetAfter(bucket, afterId, description, isPublic); // AWAIT HERE
          setNewlyAddedActionId(newActionId);
          setFocusedActionId(newActionId);
          return newActionId;
        } : undefined} // New
        flattenedActions={flattened.filter(a => !a.completed)}
        focusedActionId={focusedActionId} // Pass focusedActionId
        setFocusedActionId={setFocusedActionId} // Pass setFocusedActionId
        newlyAddedActionId={newlyAddedActionId} // Pass new prop
        onNewlyAddedActionProcessed={handleNewlyAddedActionProcessed} // Pass new prop
        // New props for future bucket functionality
        isFutureBucket={bucket === "future"}
        onActionMoveToCurrent={isOwner && !isReadOnly && bucket === "future" ? async (id) => {
          await moveTargetToBucket(bucket, "current", id);
          toast.success("Target moved to current month!");
        } : undefined}
      />

      {(isOwner && !isReadOnly && (bucket === "current" || bucket === "future")) && (<div className="mt-4">
        <AddActionForm
          ref={addTargetFormRef}
          onSave={async (desc) => { // Make async
            await addTarget(bucket, desc); // AWAIT HERE
          }}
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

      {/* Removed the "Move selected items to current month?" placeholder */}
    </div>);
  };

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  // If not owner and not read-only (shouldn't happen in public view, but safe guard)
  // Actually, if targets are empty and not owner, maybe hide?
  // But let's show empty state if that's desired.
  if (!isOwner && !isReadOnly) return null;

  return (<>
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-primary pb-4 mb-6">
          <h2 className="text-2xl font-extrabold text-primary">Monthly Targets</h2>
          <div className="flex items-center gap-3">
            {currentMonthTotal > 0 && (<CircularProgress
              progress={currentMonthProgressPercentage}
              size={36}
              strokeWidth={3}
              color="text-primary"
              bgColor="text-background/80"
              showTickOnComplete={isCurrentMonthAllComplete}
            >                        {!isCurrentMonthAllComplete && (<span className="text-xs text-muted-foreground">
                                    {currentMonthCompleted}/{currentMonthTotal}
                                </span>)}
            </CircularProgress>)}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as TargetBucket)} className="w-full">
          <div className="w-full flex justify-center pt-4 sm:pt-0"> {/* Outer container for centering and padding */}
            <TabsList
              className="w-full flex items-center justify-between bg-card rounded-full p-2 shadow-md border border-primary gap-x-4"> {/* Inner container styling */}
              <TabsTrigger
                value="prev1"
                className={cn(
                  "px-3 py-1 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap flex items-center justify-center", // VibeSelector base
                  "bg-background/80 text-muted-foreground hover:bg-accent/50", // VibeSelector unselected (default)
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:hover:bg-primary/90", // VibeSelector selected override
                  "data-[state=active]:shadow-none data-[state=active]:border data-[state=active]:border-primary", // Custom active styles
                  "focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-100 disabled:cursor-default" // Remove focus ring, disable opacity
                )}
              >{prev1MonthLabel}</TabsTrigger>
              <TabsTrigger
                value="prev"
                className={cn(
                  "px-3 py-1 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap flex items-center justify-center",
                  "bg-background/80 text-muted-foreground hover:bg-accent/50",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:hover:bg-primary/90",
                  "data-[state=active]:shadow-none data-[state=active]:border data-[state=active]:border-primary",
                  "focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-100 disabled:cursor-default"
                )}
              >{prevMonthLabel}</TabsTrigger>
              <TabsTrigger
                value="current"
                className={cn(
                  "px-3 py-1 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap flex items-center justify-center",
                  "bg-background/80 text-muted-foreground hover:bg-accent/50",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:hover:bg-primary/90",
                  "data-[state=active]:shadow-none data-[state=active]:border data-[state=active]:border-primary",
                  "focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-100 disabled:cursor-default"
                )}
              >{currentMonthLabel}</TabsTrigger>
              <TabsTrigger
                value="future"
                className={cn(
                  "px-3 py-1 text-xs sm:text-sm font-medium rounded-full whitespace-nowrap flex items-center justify-center",
                  "bg-background/80 text-muted-foreground hover:bg-accent/50",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:hover:bg-primary/90",
                  "data-[state=active]:shadow-none data-[state=active]:border data-[state=active]:border-primary",
                  "focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-100 disabled:cursor-default"
                )}
              >Future</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="prev1">{renderTabContent("prev1")}</TabsContent>
          <TabsContent value="prev">{renderTabContent("prev")}</TabsContent>
          <TabsContent value="current">{renderTabContent("current")}</TabsContent>
          <TabsContent value="future">{renderTabContent("future")}</TabsContent>
        </Tabs>
      </div>
    </>
  );
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