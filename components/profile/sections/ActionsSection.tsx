'use client';

import React from 'react';
import { ActionsList } from '@/components/shared/ActionsList';
import { mockActionsData, mockPublicActionsData } from '@/lib/mock-data';

interface ActionItem {
  id: string;
  description: string;
  completed: boolean;
}

interface ActionsSectionProps {
  isOwner: boolean;
  actions?: ActionItem[]; // Make actions optional
  onActionToggled?: (id: string) => void;
  justCompletedId?: string | null;
}

const ActionsSection: React.FC<ActionsSectionProps> = ({ isOwner, actions: propActions, onActionToggled, justCompletedId }) => {
  // Use propActions if provided, otherwise use internal mock data based on isOwner
  const currentActions = propActions || (isOwner ? mockActionsData : mockPublicActionsData);

  return (
    <div className="section mb-10">
      <h2 className="text-2xl font-extrabold border-b border-card-border pb-4 mb-6 text-foreground">Actions</h2>
      <ActionsList actions={currentActions} onActionToggled={isOwner ? onActionToggled : undefined} justCompletedId={justCompletedId} />
    </div>
  );
};

export default ActionsSection;
