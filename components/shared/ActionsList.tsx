"use client";

import { cn } from "@/lib/utils";
import { ActionItem } from "./ActionItem";
import { ActionNode } from '@/lib/supabase/types'; // Import ActionNode from centralized types

interface ActionsListProps {
  actions: ActionNode[]; // Use ActionNode
  onActionToggled?: (id: string) => void;
  onActionAdded?: (description: string, parentId?: string, isPublic?: boolean) => void;
  onActionUpdated?: (id: string, newText: string) => void;
  onActionDeleted?: (id: string) => void;
  onActionIndented?: (id: string) => void;
  onActionOutdented?: (id: string) => void;
  onActionMovedUp?: (id: string) => void;
  onActionMovedDown?: (id: string) => void;
  onActionPrivacyToggled?: (id: string) => void; // New prop
  justCompletedId?: string | null;
  level?: number;
  focusedActionId: string | null;
  setFocusedActionId: (id: string | null) => void;
  flattenedActions: ActionNode[];
}

export const ActionsList: React.FC<ActionsListProps> = ({ 
  actions, 
  onActionToggled, 
  onActionAdded, 
  onActionUpdated,
  onActionDeleted,
  onActionIndented,
  onActionOutdented,
  onActionMovedUp,
  onActionMovedDown,
  onActionPrivacyToggled, // Destructure prop
  justCompletedId, 
  level = 0,
  focusedActionId,
  setFocusedActionId,
  flattenedActions
}) => {
  return (
    <div className={cn("grid grid-cols-1 gap-y-2")}>
      {actions.map((action) => (
        <ActionItem
          key={action.id}
          action={action}
          onActionToggled={onActionToggled}
          onActionAdded={onActionAdded}
          onActionUpdated={onActionUpdated}
          onActionDeleted={onActionDeleted}
          onActionIndented={onActionIndented}
          onActionOutdented={onActionOutdented}
          onActionMovedUp={onActionMovedUp}
          onActionMovedDown={onActionMovedDown}
          onActionPrivacyToggled={onActionPrivacyToggled} // Propagate prop
          justCompletedId={justCompletedId}
          level={level}
          focusedActionId={focusedActionId}
          setFocusedActionId={setFocusedActionId}
          flattenedActions={flattenedActions}
        />
      ))}
    </div>
  );
};