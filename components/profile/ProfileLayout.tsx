'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import InsightsTrigger from '../shared/InsightsTrigger'; // Assuming InsightsTrigger is in shared

interface ProfileLayoutProps {
  username: string;
  bio: string | null;
  isOwner: boolean;
  children: React.ReactNode;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ username, bio, isOwner, children }) => {
  const bioContent = bio || (isOwner ? 'This is your private dashboard. Your bio will appear here, and you can edit it in settings.' : 'This user has not set a bio yet.');

  return (
    <div className="profile-container w-full max-w-lg lg:max-w-7xl mx-auto bg-card border border-card-border shadow-lg rounded-3xl p-6 sm:p-10 lg:px-16 lg:py-14 relative mt-8 mb-8">
      <h1 className="text-4xl font-extrabold text-center text-primary mb-2 mt-4">
        {isOwner ? `Welcome, ${username}!` : username}
      </h1>
      <div className="bio text-lg text-muted-foreground text-center mb-8 leading-relaxed">
        <ReactMarkdown>{bioContent}</ReactMarkdown>
      </div>

      <div className="main-profile-grid">
        <div className="main-content-column">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
