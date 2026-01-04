import React, { useCallback, useEffect, useRef, useState } from "react";
import { TargetBucket, useTargets } from "@/hooks/useTargets";
import { ActionsList } from "@/components/shared/ActionsList";
import { AddActionForm } from "@/components/shared/AddActionForm";
import { Tabs, TabsContent } from "@/components/ui/tabs"; // Removed TabsList, TabsTrigger
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { getCurrentMonthStartISO, getReferenceDateUI, parseISO } from "@/lib/date";
import { ActionNode } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { Undo2 } from "lucide-react";
import { CircularProgress } from "@/components/ui/circular-progress";
import { toast } from "sonner";
import { useSimulatedTime } from "@/components/layout/SimulatedTimeProvider";
import { ToggleButtonGroup } from "@/components/shared/ToggleButtonGroup"; // Import ToggleButtonGroup

interface TargetsSectionProps {
  isOwner: boolean;
  isReadOnly?: boolean;
  timezone: string;
  targets?: ActionNode[];
  onActivityLogged?: () => void;
  isCollapsible?: boolean;
  isFolded?: boolean;
  toggleFold?: () => void;
}

const getMonthlyTargetCompletionCounts = (nodes: ActionNode[]): { total: number; completed: number } => {
  let total = 0;
  let completed = 0;

  nodes.forEach(node => {
    total++;
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
                                         isCollapsible = false, isFolded, toggleFold
                                       }: TargetsSectionProps) {
  const {
    buckets, loading, addTarget, addTargetAfter,
    toggleTarget, updateTargetText, deleteTarget, undoDeleteTarget,
    lastDeletedTargetContext,
    indentTarget, outdentTarget, moveTargetUp, moveTargetDown, toggleTargetPrivacy,
    moveTargetToBucket
  } = useTargets(isOwner, timezone, propTargets ? { current: propTargets } : undefined);

  const { simulatedDate } = useSimulatedTime();
  const refDate = getReferenceDateUI(simulatedDate);

  const [activeTab, setActiveTab] = useState<TargetBucket>("current");
  const [focusedActionId, setFocusedActionId] = useState<string | null>(null);
  const [newlyAddedActionId, setNewlyAddedActionId] = useState<string | null>(null);
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
        }, duration: 5000,
        icon: <Undo2 className="h-4 w-4" />
      });
    }
  };

  useEffect(() => {
    if (!isOwner || isReadOnly) return;

    const handleKeyDown = (event: KeyboardEvent) => {
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
              setFocusedActionId("yay-toggle-root");
            }
          } else {
            setFocusedActionId(null);
            addTargetFormRef.current.focusInput();
          }
        }
      }
      else if (event.key === "ArrowUp" && addTargetFormRef.current?.isInputFocused()) {
        event.preventDefault();
        addTargetFormRef.current.blurInput();
        const flattened = flattenActionTree(buckets[activeTab]);
        const activeItems = flattened.filter(a => !a.completed);

        if (activeItems.length > 0) {
          setFocusedActionId(activeItems[activeItems.length - 1].id);
        } else if (flattened.length > 0) {
          setFocusedActionId("yay-toggle-root");
        }
      }
      if (event.key === "Escape") {
        event.preventDefault();

        if (addTargetFormRef.current?.isInputFocused() && addTargetFormRef.current?.isInputEmpty()) {
          addTargetFormRef.current.clearInput();
          addTargetFormRef.current.blurInput();
          const flattened = flattenActionTree(buckets[activeTab]);
          if (flattened.length > 0) {
            setFocusedActionId(flattened[flattened.length - 1].id);
          } else {
            setFocusedActionId(null);
            (document.activeElement as HTMLElement)?.blur();
          }
        }
        else if (addTargetFormRef.current?.isInputFocused()) {
          addTargetFormRef.current.clearInput();
          addTargetFormRef.current.blurInput();
          setFocusedActionId(null);
          (document.activeElement as HTMLElement)?.blur();
        }
        else if (focusedActionId) {
          setFocusedActionId(null);
          (document.activeElement as HTMLElement)?.blur();
        }
        else {
          (document.activeElement as HTMLElement)?.blur();
        }
      }
      else if ((event.ctrlKey || event.metaKey) && (event.key === "z" || event.key === "Z")) {
        event.preventDefault();
        const canEdit = activeTab === "current" || activeTab === "future";
        if (canEdit && lastDeletedTargetContext) {
          undoDeleteTarget();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOwner, isReadOnly, activeTab, buckets, addTargetFormRef]);


  const currentMonthLabel = format(parseISO(getCurrentMonthStartISO(timezone, refDate)), "MMM yyyy");
  const prevMonthLabel = format(parseISO(getCurrentMonthStartISO(timezone, refDate, -1)), "MMM");
  const prev1MonthLabel = format(parseISO(getCurrentMonthStartISO(timezone, refDate, -2)), "MMM");

  const {
    total: currentMonthTotal,
    completed: currentMonthCompleted
  } = getMonthlyTargetCompletionCounts(buckets.current);
  const currentMonthProgressPercentage = currentMonthTotal > 0 ? (currentMonthCompleted / currentMonthTotal) * 100 : 0;
  const isCurrentMonthAllComplete = currentMonthTotal > 0 && currentMonthCompleted === currentMonthTotal;


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
    const canEdit = isOwner && !isReadOnly && (bucket === "current");

    const flattened = flattenActionTree(actions);

    return (<div className="mt-4">
      <ActionsList
        actions={actions}
        onActionToggled={canEdit ? async (id) => {
          const toggledNode = await toggleTarget(bucket, id);
          onActivityLogged?.();
          return toggledNode;
        } : undefined}
        onActionAdded={canEdit ? async (desc, parentId) => {
          await addTarget(bucket, desc, parentId);
        } : undefined}
        onActionUpdated={canEdit ? (id, text) => updateTargetText(bucket, id, text) : undefined}
        onActionDeleted={canEdit ? (id) => handleDeleteTarget(bucket, id) : undefined}
        onActionIndented={canEdit ? async (id) => {
          await indentTarget(bucket, id);
        } : undefined}
        onActionOutdented={canEdit ? (id) => outdentTarget(bucket, id) : undefined}
        onActionMovedUp={canEdit ? (id) => moveTargetUp(bucket, id) : undefined}
        onActionMovedDown={canEdit ? (id) => moveTargetDown(bucket, id) : undefined}
        onActionPrivacyToggled={canEdit ? (id) => toggleTargetPrivacy(bucket, id) : undefined}
        onActionAddedAfter={canEdit ? async (afterId, description, isPublic) => {
          const newActionId = await addTargetAfter(bucket, afterId, description, isPublic);
          setNewlyAddedActionId(newActionId);
          setFocusedActionId(newActionId);
          return newActionId;
        } : undefined}
        flattenedActions={flattened.filter(a => !a.completed)}
        focusedActionId={focusedActionId}
        setFocusedActionId={setFocusedActionId}
        newlyAddedActionId={newlyAddedActionId}
        onNewlyAddedActionProcessed={handleNewlyAddedActionProcessed}
        isFutureBucket={bucket === "future"}
        onActionMoveToCurrent={isOwner && !isReadOnly && bucket === "future" ? async (id) => {
          await moveTargetToBucket(bucket, "current", id);
          toast.success("Target moved to current month!");
        } : undefined}
      />

      {(isOwner && !isReadOnly && (bucket === "current" || bucket === "future")) && (<div className="mt-4">
        <AddActionForm
          ref={addTargetFormRef}
          onSave={async (desc) => {
            await addTarget(bucket, desc);
          }}
          onCancel={() => {
            addTargetFormRef.current?.clearInput();
            const currentFlattened = flattenActionTree(buckets[activeTab]);
            if (currentFlattened.length > 0) {
              setFocusedActionId(currentFlattened[currentFlattened.length - 1].id);
            }
          }}
          triggerKey="T"
          autoFocusOnMount={false}
        />
      </div>)}
    </div>);
  };

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!isOwner && !isReadOnly) return null;

  const MONTH_OPTIONS = [
    { id: "prev1", label: prev1MonthLabel },
    { id: "prev", label: prevMonthLabel },
    { id: "current", label: currentMonthLabel },
    { id: "future", label: "Future" },
  ];

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

        <div className="w-full flex justify-center pt-4 sm:pt-0"> {/* Outer container for centering and padding */}
            <ToggleButtonGroup
                options={MONTH_OPTIONS}
                selectedValue={activeTab}
                onValueChange={(value) => setActiveTab(value as TargetBucket)}
                className="w-full flex-1" // Make it full width to fill container
                itemClassName="flex-1" // Make items flex-1 to distribute space
            />
        </div>

        <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as TargetBucket)} className="w-full">
          <TabsContent value="prev1">{renderTabContent("prev1")}</TabsContent>
          <TabsContent value="prev">{renderTabContent("prev")}</TabsContent>
          <TabsContent value="current">{renderTabContent("current")}</TabsContent>
          <TabsContent value="future">{renderTabContent("future")}</TabsContent>
        </Tabs>
      </div>
    </>
  );
}

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