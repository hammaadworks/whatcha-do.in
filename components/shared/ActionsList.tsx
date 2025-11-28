"use client";

import { cn } from "@/lib/utils";
import { ActionItem } from "./ActionItem"; // Import ActionItem

export interface Action {
  id: string;
  description: string;
  completed: boolean;
  children?: Action[]; // Optional array of child actions for nesting
  originalIndex: number; // Add originalIndex for sorting stability
}

interface ActionsListProps {
  actions: Action[];
  onActionToggled?: (id: string) => void;
  onActionAdded?: (description: string, parentId?: string) => void;
  justCompletedId?: string | null;
  level?: number; // Add level prop for indentation
}

export const ActionsList: React.FC<ActionsListProps> = ({ actions, onActionToggled, onActionAdded, justCompletedId, level = 0 }) => {
  return (
    <div className={cn("grid grid-cols-1 gap-y-2", { // Changed gap to gap-y-2 for better vertical spacing
    })}>
      {actions.map((action) => (
        <ActionItem
          key={action.id}
          action={action}
          onActionToggled={onActionToggled}
          onActionAdded={onActionAdded}
          justCompletedId={justCompletedId}
          level={level}
        />
      ))}
    </div>
  );
};
