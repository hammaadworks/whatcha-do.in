'use client';

import { PublicProfile } from '@/lib/supabase/user';

export default function PublicProfileView({ profile }: { profile: PublicProfile }) {
  return (
    <div className="p-4">
      <h1 className="text-[var(--font-size-3xl)] font-bold mb-4 text-foreground">Public Profile</h1>
      
      <h2 className="text-[var(--font-size-xl)] font-bold mb-2 text-foreground">Bio</h2>
      <p className="mb-4 text-foreground">{profile.bio || 'No bio yet.'}</p>
      
      <h2 className="text-[var(--font-size-xl)] font-bold mb-2 text-foreground">Habits</h2>
      {profile.habits.length > 0 ? (
        <ul className="mb-4">
          {profile.habits.map(habit => (
            <li key={habit.id} className="text-foreground">{habit.name}</li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-foreground">No public habits yet.</p>
      )}
      
      <h2 className="text-[var(--font-size-xl)] font-bold mb-2 text-foreground">Todos</h2>
      {profile.todos.length > 0 ? (
        <ul className="mb-4">
          {profile.todos.map(todo => (
            <li key={todo.id} className="text-foreground">{todo.task}</li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-foreground">No public todos yet.</p>
      )}
      
      <h2 className="text-[var(--font-size-xl)] font-bold mb-2 text-foreground">Journal Entries</h2>
      {profile.journal_entries.length > 0 ? (
        <ul className="mb-4">
          {profile.journal_entries.map(entry => (
            <li key={entry.id} className="text-foreground">{entry.content}</li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-foreground">No public journal entries yet.</p>
      )}
    </div>
  );
}
