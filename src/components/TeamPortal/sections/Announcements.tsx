import React from 'react';
import { TeamInfo } from '../../../types/team';

interface AnnouncementsProps {
  announcements: TeamInfo['announcements'];
}

export function Announcements({ announcements }: AnnouncementsProps) {
  return (
    <div>
      <h2 className="text-3xl font-['Harry_Potter'] text-white mb-6">Announcements</h2>
      <div className="space-y-4">
        {announcements?.length > 0 ? (
          announcements.map((announcement) => (
            <div key={announcement.id} className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/20">
              <h3 className="text-xl text-white mb-2">{announcement.title}</h3>
              <p className="text-blue-200/80 whitespace-pre-wrap mb-4">{announcement.content}</p>
              <p className="text-sm text-blue-200/60">
                Posted: {new Date(announcement.timestamp).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-blue-200/60">No announcements at this time.</p>
        )}
      </div>
    </div>
  );
} 