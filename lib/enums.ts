export enum HabitState {
  TODAY = "today", YESTERDAY = "yesterday", LIVELY = "lively", JUNKED = "junked"
}

export enum HabitBoxType {
  TODAY = "Today", YESTERDAY = "Yesterday", PILE = "Pile"
}

export enum HabitLifecycleEvent {
  USER_COMPLETE = 0,
  USER_UNDO = 1,
  GRACE_COMPLETE = 2,
  GRACE_INCOMPLETE = 3,
  LOG_EXTRA = 4,
}