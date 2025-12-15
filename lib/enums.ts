/**
 * @fileoverview Enumerations used across the application to define standard states and identifiers.
 */

/**
 * Represents the state of a habit within the "Pile" system.
 * 
 * - `IN_PROGRESS`: Active habits currently in the Today or Yesterday view.
 * - `LIVELY`: Habits in the main pile that are active but not currently selected for the day.
 * - `JUNKED`: Habits that have been discarded or archived.
 */
export enum HabitState {
    TODAY = 'today',
    YESTERDAY = 'yesterday',
    PILE_LIVELY = 'lively',
    PILE_JUNKED = 'junked',
}

/**
 * Identifiers for the columns in the Habit Tracker UI.
 * 
 * - `TODAY`: The column for habits scheduled for the current day.
 * - `YESTERDAY`: The column for habits carried over or relevant to the previous day.
 * - `PILE`: The general repository of all active habits.
 */
export enum HabitColumnId {
    TODAY = 'today',
    YESTERDAY = 'yesterday',
    PILE = 'pile',
}
