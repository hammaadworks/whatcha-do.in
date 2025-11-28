// hooks/useActions.ts
"use client";

import {useState} from 'react';
import {Action} from '@/components/shared/ActionsList';
import {mockActionsData} from '@/lib/mock-data';

export const useActions = () => {
    const [actions, setActions] = useState<Action[]>(() => {
        return [...mockActionsData].sort((a, b) => {
            if (a.completed && !b.completed) return 1;
            if (!a.completed && b.completed) return -1;
            return a.originalIndex - b.originalIndex;
        });
    });
    const [justCompletedId, setJustCompletedId] = useState<string | null>(null);

    // TODO: Replace with a call to fetch actions from Supabase
    const getActions = async () => {
        // For now, we are using mock data
        return actions;
    };

    const sortActions = (actionsToSort: Action[]) => {
        return [...actionsToSort].sort((a, b) => {
            if (a.completed && !b.completed) return 1;
            if (!a.completed && b.completed) return -1;
            return a.originalIndex - b.originalIndex;
        });
    };

    // TODO: Replace with a call to toggle an action in Supabase
    const toggleAction = (id: string) => {
        let actionToHighlight: Action | undefined;

        const checkParentCompletion = (children: Action[] | undefined): boolean => {
            if (!children || children.length === 0) {
                return false;
            }
            return children.every(child => child.completed);
        };

        const toggleActionAndFind = (currentActions: Action[]): Action[] => {
            return currentActions.map(action => {
                let currentAction = {...action};

                if (currentAction.id === id) {
                    currentAction.completed = !currentAction.completed;
                    if (currentAction.children) {
                        currentAction.children = currentAction.children.map(child => ({
                            ...child,
                            completed: currentAction.completed
                        }));
                    }
                    actionToHighlight = currentAction;
                } else if (currentAction.children && currentAction.children.length > 0) {
                    currentAction.children = toggleActionAndFind(currentAction.children);
                    const allChildrenCompleted = checkParentCompletion(currentAction.children);
                    if (currentAction.completed !== allChildrenCompleted) {
                        currentAction.completed = allChildrenCompleted;
                    }
                }

                if (!actionToHighlight && currentAction.children && currentAction.children.some(child => child.id === id)) {
                    actionToHighlight = currentAction.children.find(child => child.id === id);
                }

                return currentAction;
            });
        };

        setActions(currentActions => {
            const updatedActions = toggleActionAndFind(currentActions);

            if (actionToHighlight && actionToHighlight.completed) {
                setJustCompletedId(id);
                setTimeout(() => {
                    setJustCompletedId(null);
                    setActions(prev => sortActions(prev));
                }, 500);
            } else {
                return sortActions(updatedActions);
            }
            return updatedActions;
        });
    };

    // TODO: Replace with a call to add an action in Supabase
    const addAction = (description: string, parentId?: string) => {
        const newAction: Action = {
            id: Date.now().toString(), description, completed: false, originalIndex: actions.length, children: [],
        };

        if (parentId) {
            setActions(currentActions => {
                const addToAction = (current: Action[]): Action[] => {
                    return current.map(action => {
                        if (action.id === parentId) {
                            return {...action, children: [...(action.children || []), newAction]};
                        }
                        if (action.children && action.children.length > 0) {
                            return {...action, children: addToAction(action.children)};
                        }
                        return action;
                    });
                };
                return addToAction(currentActions);
            });
        } else {
            setActions(currentActions => [...currentActions, newAction]);
        }
    };

    return {
        actions, justCompletedId, toggleAction, addAction,
    };
};