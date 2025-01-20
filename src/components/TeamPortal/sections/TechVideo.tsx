import React from 'react';
import { TeamInfo } from '../../../types/team';

interface TechVideoProps {
  techVideo: TeamInfo['techVideo'];
}

export function TechVideo({ techVideo }: TechVideoProps) {
  return (
    <div>
      <h2 className="text-3xl font-['Harry_Potter'] text-white mb-6">Tech Video</h2>
      {techVideo?.youtubeUrl ? (
        <div className="space-y-6">
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src={techVideo.youtubeUrl.replace('watch?v=', 'embed/')}
              title={techVideo.title}
              className="w-full rounded-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/20">
            <h3 className="text-xl text-white mb-4">{techVideo.title}</h3>
            {techVideo.description && (
              <p className="text-blue-200/80 whitespace-pre-wrap">{techVideo.description}</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-blue-200/60">Tech video will be available soon.</p>
      )}
    </div>
  );
} 