"use client";

import React, {useCallback, useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import ProfileLayout from "@/components/profile/ProfileLayout";
import ActionsSection from "@/components/profile/sections/ActionsSection";
import {HabitsSection} from "@/components/profile/sections/HabitsSection";
import JournalSection from "@/components/profile/sections/JournalSection";
import MotivationsSection from "@/components/profile/sections/MotivationsSection";
import {useActions} from "@/hooks/useActions";
import {useHabitActions} from "@/hooks/useHabitActions";
import {useAuth, User} from "@/packages/auth/hooks/useAuth";
import {updateUserProfile, updateUserTimezone} from "@/lib/supabase/user.client";
import {PublicPage} from "@/components/profile/PublicPage";
import {toast} from "sonner";
import {fetchOwnerHabits} from "@/lib/supabase/habit";
import {fetchJournalEntries} from "@/lib/supabase/journal";
import {ActionNode, Habit, Identity, JournalEntry} from "@/lib/supabase/types";
import {VibeSelector} from "@/components/profile/VibeSelector";
import MeSection from "@/components/profile/sections/MeSection";
import {useKeyboardShortcuts} from "@/components/shared/KeyboardShortcutsProvider";
import {useGracePeriod} from "@/hooks/useGracePeriod";
import {GracePeriodScreen} from "@/components/grace-period/GracePeriodScreen";
import {getReferenceDateUI, getTodayISO} from "@/lib/date";
import {useSimulatedTime} from "@/components/layout/SimulatedTimeProvider";
import {ViewSelector} from "@/components/profile/ViewSelector";
import {HabitState} from "@/lib/enums.ts";

interface OwnerProfileViewProps {
  username: string;
  initialProfileUser: User;
  publicActions: ActionNode[];
  publicHabits: Habit[];
  publicJournalEntries: JournalEntry[];
  publicIdentities: (Identity & { backingCount: number })[];
  publicTargets: ActionNode[];
  privateCount?: number;
}

export default function OwnerProfileView({
                                           username,
                                           initialProfileUser,
                                           publicActions,
                                           publicHabits,
                                           publicJournalEntries,
                                           publicIdentities,
                                           publicTargets,
                                           privateCount = 0
                                         }: Readonly<OwnerProfileViewProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: authenticatedUser, refreshUser } = useAuth();
  const {
    isMeFolded, toggleMeFold, isActionsFolded, toggleActionsFold, isJournalFolded, toggleJournalFold
  } = useKeyboardShortcuts();

  const [optimisticTimezone, setOptimisticTimezone] = useState<string | null>(null);
  const profileToDisplay = authenticatedUser || initialProfileUser;
  const timezone = optimisticTimezone || profileToDisplay?.timezone || "UTC";
  const { simulatedDate } = useSimulatedTime();
  const refDate = getReferenceDateUI(simulatedDate);
  const todayISO = getTodayISO(timezone, refDate);

  // Grace Period Logic
  const {
    graceHabits,
    resolveHabitIncomplete,
    refresh: refreshGraceHabits,
    isLoading: isGraceLoading
  } = useGracePeriod(authenticatedUser?.id, todayISO);

  const currentViewMode = (searchParams.get("vibe") as "edit" | "private" | "public") || "edit";
  const isReadOnly = currentViewMode !== "edit";
  const isCollapsible = currentViewMode === "edit";

  const [ownerHabits, setOwnerHabits] = useState<Habit[]>([]);
  const [ownerHabitsLoading, setOwnerHabitsLoading] = useState(false);
  const [ownerJournalEntries, setOwnerJournalEntries] = useState<JournalEntry[]>([]);
  const [ownerJournalEntriesLoading, setOwnerJournalEntriesLoading] = useState(false);

  const refreshHabits = useCallback(async () => {
    if (!authenticatedUser?.id) return;
    setOwnerHabitsLoading(true);
    try {
      const habits = await fetchOwnerHabits(authenticatedUser.id);
      setOwnerHabits(habits);
    } catch (error) {
      console.error("Failed to fetch owner habits:", error);
    } finally {
      setOwnerHabitsLoading(false);
    }
  }, [authenticatedUser?.id]);

  const refreshJournalEntries = useCallback(async (silent = false) => {
    if (!authenticatedUser?.id) return;
    if (!silent) setOwnerJournalEntriesLoading(true);
    try {
      const entries = await fetchJournalEntries(authenticatedUser.id);
      setOwnerJournalEntries(entries);
    } catch (error) {
      console.error("Failed to fetch owner journal entries:", error);
    } finally {
      if (!silent) setOwnerJournalEntriesLoading(false);
    }
  }, [authenticatedUser?.id]);

  // Sync ownerHabits when Grace Period finishes or initializes with no items
  // This ensures that any server-side lifecycle changes (like Lively -> Junked) are reflected
  useEffect(() => {
    if (!isGraceLoading && graceHabits.length === 0) {
      refreshHabits();
    }
  }, [isGraceLoading, graceHabits.length, refreshHabits]);

  const handleActivityLogged = async () => {
    await Promise.all([refreshHabits(), refreshJournalEntries()]);
  };

  const {
    actions,
    loading: actionsLoading,
    addAction,
    toggleAction,
    updateActionText,
    deleteAction,
    undoDeleteAction,
    indentAction,
    outdentAction,
    moveActionUp,
    moveActionDown,
    toggleActionPrivacy,
    addActionAfter
  } = useActions(true, optimisticTimezone || profileToDisplay?.timezone || "UTC");

  const { handleHabitComplete } = useHabitActions({
    onActivityLogged: handleActivityLogged,
    habits: ownerHabits,
    setOptimisticHabits: setOwnerHabits, // Enable optimistic updates
    todayISO: todayISO
  });

  const handleTimezoneChange = async (newTimezone: string) => {
    if (authenticatedUser?.id) {
      setOptimisticTimezone(newTimezone);
      try {
        await updateUserTimezone(authenticatedUser.id, newTimezone);
      } catch (error) {
        console.error("Failed to update timezone", error);
        setOptimisticTimezone(null);
      }
    }
  };

  const handleBioUpdate = async (newBio: string) => {
    if (!authenticatedUser?.id) return;
    try {
      const { error } = await updateUserProfile(authenticatedUser.id, { bio: newBio });
      if (error) throw error;
      toast.success("Bio updated successfully");
      await refreshUser();
    } catch (error) {
      console.error("Failed to update bio:", error);
      toast.error("Failed to update bio");
      throw error;
    }
  };

  const handleViewModeChange = useCallback((mode: "edit" | "private" | "public") => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("vibe", mode);
    router.replace(`/${username}?${newSearchParams.toString()}`);
  }, [router, searchParams, username]);

  useEffect(() => {
    if (!searchParams.get("vibe")) {
      router.replace(`/${username}?vibe=edit`);
    }
  }, [searchParams, router, username]);

  useEffect(() => {
    if (currentViewMode !== "public" && authenticatedUser?.id) {
      refreshHabits();
      refreshJournalEntries();
    }
  }, [currentViewMode, authenticatedUser?.id]);

  const handleActionToggled = async (id: string) => {
    const newNode = await toggleAction(id);
    await refreshJournalEntries();
    return newNode;
  };

  const handleActionDeleted = async (id: string) => {
    const deletedContext = await deleteAction(id);
    await refreshJournalEntries();
    return deletedContext;
  };

  // Helper functions for Public View Live Preview
  const filterPublicActions = (nodes: ActionNode[]): ActionNode[] => {
    return nodes
      .filter((node) => node.is_public)
      .map((node) => ({
        ...node,
        children: node.children ? filterPublicActions(node.children) : undefined
      }));
  };

  const countNodes = (nodes: ActionNode[]): number => {
    return nodes.reduce((acc, node) => {
      return acc + 1 + (node.children ? countNodes(node.children) : 0);
    }, 0);
  };

  // Derive live public data from owner state
  const livePublicHabits = ownerHabits.length > 0 ? ownerHabits.filter((h) => h.is_public && h.habit_state!=HabitState.JUNKED) : publicHabits;
  const livePublicJournal = ownerJournalEntries.length > 0 ? ownerJournalEntries.filter((j) => j.is_public) : publicJournalEntries;

  // For actions, we need to filter the tree
  // If actions are loading or empty, fallback to publicActions prop (unless we know we have 0 actions)
  // However, useActions loads initially. If it's empty, it might be truly empty.
  // We can check `actionsLoading`.
  const livePublicActions = (!actionsLoading && actions.length > 0)
    ? filterPublicActions(actions)
    : (actionsLoading ? publicActions : []); // If loaded and empty, then empty. If loading, use stale public.

  // Better logic: if we have actions (or finished loading), use derived.
  const derivedPublicActions = filterPublicActions(actions);
  const shouldUseDerivedActions = !actionsLoading;

  const finalPublicActions = shouldUseDerivedActions ? derivedPublicActions : publicActions;

  // Calculate private count
  const totalActionCount = shouldUseDerivedActions ? countNodes(actions) : (publicActions.length + privateCount); // Approx fallback
  const publicActionCount = shouldUseDerivedActions ? countNodes(finalPublicActions) : countNodes(publicActions);
  const livePrivateCount = shouldUseDerivedActions ? (totalActionCount - publicActionCount) : privateCount;


  if (!profileToDisplay) {
    return <div>Error: User profile not found for owner.</div>;
  }

  const headerContent = (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
      <VibeSelector
        currentViewMode={currentViewMode}
        onViewModeChange={handleViewModeChange}
      />
      <ViewSelector />
    </div>
  );

  return (<div className="relative pt-8 lg:pt-4 w-full max-w-6xl">
    <GracePeriodScreen
      habits={graceHabits}
      onComplete={async (id, data) => {
        await handleHabitComplete(id, data, true);
        await refreshGraceHabits(graceHabits, id);
      }}
      onSkip={resolveHabitIncomplete}
      onHabitCreated={(newHabit) => setOwnerHabits((prev) => [...prev, newHabit])}
    />

    {currentViewMode === "public" ? (<div className="animate-in fade-in duration-300">
      <div className="mb-6">{headerContent}</div>
      <PublicPage
        user={profileToDisplay}
        publicActions={finalPublicActions}
        publicHabits={livePublicHabits}
        publicJournalEntries={livePublicJournal}
        publicIdentities={publicIdentities}
        publicTargets={publicTargets}
        privateCount={livePrivateCount}
        showViewSelector={false}
      />
    </div>) : (<ProfileLayout
      username={username}
      isOwner={true}
      isReadOnly={isReadOnly}
      timezone={optimisticTimezone || profileToDisplay.timezone}
      onTimezoneChange={handleTimezoneChange}
      headerContent={headerContent}
    >
      <MeSection
        isCollapsible={isCollapsible}
        isReadOnly={isReadOnly}
        username={username}
        profileToDisplay={profileToDisplay}
        ownerHabits={ownerHabits}
        onBioUpdate={handleBioUpdate}
        onActivityLogged={handleActivityLogged}
        timezone={optimisticTimezone || profileToDisplay.timezone || "UTC"}
        isFolded={isMeFolded}
        toggleFold={toggleMeFold}
      />

      <ActionsSection
        isOwner={true}
        isReadOnly={isReadOnly}
        actions={actions}
        loading={actionsLoading}
        onActionToggled={handleActionToggled}
        onActionAdded={addAction}
        onActionUpdated={updateActionText}
        onActionDeleted={handleActionDeleted}
        undoDeleteAction={undoDeleteAction}
        onActionIndented={indentAction}
        onActionOutdented={outdentAction}
        onActionMovedUp={moveActionUp}
        onActionMovedDown={moveActionDown}
        onActionPrivacyToggled={toggleActionPrivacy}
        onActionAddedAfter={addActionAfter}
        isCollapsible={isCollapsible}
        isFolded={isActionsFolded}
        toggleFold={toggleActionsFold}
      />
      <HabitsSection
        isOwner={true}
        isReadOnly={isReadOnly}
        habits={ownerHabits}
        loading={ownerHabitsLoading}
        onActivityLogged={handleActivityLogged}
        setOwnerHabits={setOwnerHabits} // Pass setter for optimistic updates
        todayISO={todayISO}
      />
      <JournalSection
        isOwner={true}
        isReadOnly={isReadOnly}
        journalEntries={ownerJournalEntries}
        loading={ownerJournalEntriesLoading}
        isCollapsible={isCollapsible}
        isFolded={isJournalFolded}
        toggleFold={toggleJournalFold}
        onEntrySaved={() => refreshJournalEntries(true)}
      />
      <MotivationsSection
        username={username}
        isOwner={true}
        isReadOnly={isReadOnly}
        loading={false}
      />
    </ProfileLayout>)}
  </div>);
}
