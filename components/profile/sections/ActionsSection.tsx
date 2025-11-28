'use client';

import React, { useState } from 'react';
import { ActionsList, Action } from '@/components/shared/ActionsList';
import { mockActionsData, mockPublicActionsData } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { AddActionForm } from '@/components/shared/AddActionForm';

interface ActionsSectionProps {
  isOwner: boolean;
  actions?: Action[]; // Use imported Action type
  onActionToggled?: (id: string) => void;
  onActionAdded?: (description: string, parentId?: string) => void;
  justCompletedId?: string | null;
}

const ActionsSection: React.FC<ActionsSectionProps> = ({ isOwner, actions: propActions, onActionToggled, onActionAdded, justCompletedId }) => {
  const [isAdding, setIsAdding] = useState(false);

  // Use propActions if provided, otherwise use internal mock data based on isOwner
  const currentActions = propActions || (isOwner ? mockActionsData : mockPublicActionsData);

  const handleSave = (description: string) => {
    onActionAdded?.(description);
    setIsAdding(false);
  };

  return (
    <div className="section mb-10">
      <div className="flex justify-between items-center border-b border-primary pb-4 mb-6">
        <h2 className="text-2xl font-extrabold">Actions</h2>
        {isOwner && (
          <Button onClick={() => setIsAdding(true)}>Add Action</Button>
        )}
      </div>
      {isAdding && (
        <div className="mb-4">
          <AddActionForm onSave={handleSave} onCancel={() => setIsAdding(false)} />
        </div>
      )}
      <ActionsList actions={currentActions} onActionToggled={isOwner ? onActionToggled : undefined} onActionAdded={isOwner ? onActionAdded : undefined} justCompletedId={justCompletedId} />
    </div>
  );
};

export default ActionsSection;
