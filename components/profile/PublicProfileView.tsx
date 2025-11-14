'use client';

import { PublicProfile } from '@/lib/supabase/user';

export default function PublicProfileView({ profile }: { profile: PublicProfile }) {
  return (
    <div>
      <h1>Public Profile</h1>
      
      <h2>Bio</h2>
      <p>{profile.bio || 'No bio yet.'}</p>
      
      <h2>Habits</h2>
      {profile.habits.length > 0 ? (
        <ul>
          {profile.habits.map(habit => (
            <li key={habit.id}>{habit.name}</li>
          ))}
        </ul>
      ) : (
        <p>No public habits yet.</p>
      )}
      
      <h2>Todos</h2>
      {profile.todos.length > 0 ? (
        <ul>
          {profile.todos.map(todo => (
            <li key={todo.id}>{todo.task}</li>
          ))}
        </ul>
      ) : (
        <p>No public todos yet.</p>
      )}
      
      <h2>Journal Entries</h2>
      {profile.journal_entries.length > 0 ? (
        <ul>
          {profile.journal_entries.map(entry => (
            <li key={entry.id}>{entry.content}</li>
          ))}
        </ul>
      ) : (
        <p>No public journal entries yet.</p>
      )}
    </div>
  );
}
