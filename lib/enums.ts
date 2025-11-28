// lib/enums.ts

export enum HabitPileState {
    IN_PROGRESS = 'in_progress', // For habits in Today/Yesterday columns
    LIVELY = 'lively',
    JUNKED = 'junked',
}

export enum HabitColumnId {
    TODAY = 'today',
    YESTERDAY = 'yesterday',
    PILE = 'pile',
}