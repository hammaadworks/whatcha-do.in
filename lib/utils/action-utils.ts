import {Action} from '@/components/shared/ActionsList';

let globalIndexCounter = 0;

export const addOriginalIndexRecursively = (actions: any[]): Action[] => {
    return actions.map((action) => {
        const newAction: Action = {...action, originalIndex: globalIndexCounter++};
        if (action.children && action.children.length > 0) {
            newAction.children = addOriginalIndexRecursively(action.children);
        }
        return newAction;
    });
};
