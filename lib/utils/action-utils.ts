import {ActionNode} from '@/lib/supabase/types';

export interface ActionNodeWithOriginalIndex extends ActionNode {
    originalIndex?: number;
}

let globalIndexCounter = 0;

export const addOriginalIndexRecursively = (actions: ActionNodeWithOriginalIndex[]): ActionNodeWithOriginalIndex[] => {
    return actions.map((action) => {
        const newAction: ActionNodeWithOriginalIndex = {...action, originalIndex: globalIndexCounter++};
        if (action.children && action.children.length > 0) {
            newAction.children = addOriginalIndexRecursively(action.children);
        }
        return newAction;
    });
};
