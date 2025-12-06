import {fetchTargets, updateTargets} from '@/lib/supabase/targets';
import {fetchJournalEntryByDate, upsertJournalEntry} from '@/lib/supabase/journal';
import {getMonthStartDate, getStartOfTodayInTimezone} from '@/lib/date';
import {ActionNode} from '@/lib/supabase/types';
import {format} from 'date-fns';

export async function processTargetLifecycle(userId: string, timezone: string) {
    const startOfToday = getStartOfTodayInTimezone(timezone);
    const currentMonthDate = getMonthStartDate(0, timezone);
    const prevMonthDate = getMonthStartDate(-1, timezone);

    // 1. Rollover Logic
    const currentTargets = await fetchTargets(userId, currentMonthDate);

    // Only rollover if current month is essentially empty (or we assume we check if we already rolled over? 
    // Simple check: if currentTargets is empty array, check prev month.)
    if (currentTargets.length === 0) {
        const prevTargets = await fetchTargets(userId, prevMonthDate);
        if (prevTargets.length > 0) {
            const {active, completed} = splitActiveCompleted(prevTargets);

            if (active.length > 0) {
                // Move active to current
                await updateTargets(userId, currentMonthDate, active);
                // Keep only completed in prev
                await updateTargets(userId, prevMonthDate, completed);
                console.log('Rolled over targets from previous month.');
            }
        }
    }

    // 2. Clearing Logic (Run for all relevant buckets)
    // We check Future (null), Current, Prev, Prev-1
    const buckets = [null, currentMonthDate, prevMonthDate, getMonthStartDate(-2, timezone)];

    for (const bucketDate of buckets) {
        const targets = await fetchTargets(userId, bucketDate);
        if (targets.length === 0) continue;

        const {cleanedTree, itemsToJournal} = extractCompletedItems(targets, startOfToday);

        if (itemsToJournal.length > 0) {
            // Group by date to minimize journal calls
            const byDate: Record<string, ActionNode[]> = {};
            itemsToJournal.forEach(item => {
                const date = item.completed_at ? item.completed_at.split('T')[0] : getCurrentDateISO(timezone);
                if (!byDate[date]) byDate[date] = [];
                byDate[date].push(item);
            });

            // Write to Journal
            for (const [date, items] of Object.entries(byDate)) {
                // Determine privacy? Targets usually private. Let's assume private journal.
                // FR-1.9.3 doesn't specify, but FR-3.6 says "Journal System: ...absolute separation...".
                // We'll put it in Private Journal.
                const isPublic = false;

                // Fetch existing to append
                const existingEntry = await fetchJournalEntryByDate(userId, date, isPublic);
                let content = existingEntry?.content || '';

                if (content) content += '\n';
                content += `### Completed Targets\n`;
                items.forEach(item => {
                    content += `- [x] ${item.description}\n`;
                });

                await upsertJournalEntry({
                    user_id: userId, entry_date: date, is_public: isPublic, content: content
                });
            }

            // Update Targets DB (Remove cleaned items)
            await updateTargets(userId, bucketDate, cleanedTree);
            console.log(`Cleared ${itemsToJournal.length} items from bucket ${bucketDate || 'Future'}`);
        }
    }
}

// Helpers

function splitActiveCompleted(nodes: ActionNode[]): { active: ActionNode[], completed: ActionNode[] } {
    const active: ActionNode[] = [];
    const completed: ActionNode[] = [];

    // Shallow split for rollover (we move top-level items?)
    // Requirement: "unmarked targets ... carried over".
    // If a parent is unmarked but child is marked? 
    // Usually we move the whole active tree.
    // If a node is completed, it stays. If not, it moves.
    // Recursive split is hard because a parent might be incomplete but child complete.
    // If parent moves, child moves. 
    // We assume: if parent is not completed, it moves (with all children).

    nodes.forEach(node => {
        if (!node.completed) {
            active.push(node);
        } else {
            completed.push(node);
        }
    });

    return {active, completed};
}

function extractCompletedItems(nodes: ActionNode[], startOfToday: number): {
    cleanedTree: ActionNode[],
    itemsToJournal: ActionNode[]
} {
    let itemsToJournal: ActionNode[] = [];

    const filter = (currentNodes: ActionNode[]): ActionNode[] => {
        const filtered: ActionNode[] = [];
        for (const node of currentNodes) {
            // Process children first
            const filteredChildren = node.children ? filter(node.children) : [];
            const hasVisibleChildren = filteredChildren.length > 0;

            let shouldClear = false;
            if (node.completed && node.completed_at) {
                const completedTime = new Date(node.completed_at).getTime();
                if (completedTime < startOfToday) {
                    shouldClear = true;
                    // Add to journal list
                    itemsToJournal.push(node);
                }
            }

            if (!shouldClear || hasVisibleChildren) {
                // Keep node
                filtered.push({
                    ...node, children: filteredChildren
                });
            }
            // Else: node is cleared and has no children -> removed from tree
        }
        return filtered;
    };

    const cleanedTree = filter(nodes);
    return {cleanedTree, itemsToJournal};
}

function getCurrentDateISO(timezone: string): string {
    // Fallback date generator
    // Actually should use lib/date but I need strict 'YYYY-MM-DD'
    return format(new Date(), 'yyyy-MM-dd');
}
