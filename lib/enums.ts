export enum HabitState {
    TODAY = 'today', YESTERDAY = 'yesterday', LIVELY = 'lively', JUNKED = 'junked'
}

export enum HabitBoxType {
    TODAY = 'Today', YESTERDAY = 'Yesterday', PILE = 'Pile'
}

export enum HabitLifecycleEvent {
    USER_COMPLETE = 0,
    USER_UNDO = 1,
    DAY_ROLLOVER = 2,
    DAILY_RESOLUTION = 3,
    GRACE_COMPLETE = 4,
    GRACE_INCOMPLETE = 5
}