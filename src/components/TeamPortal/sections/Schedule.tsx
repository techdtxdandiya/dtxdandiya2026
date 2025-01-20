import React from 'react';
import { ScheduleEvent, TeamInfo } from '../../../types/team';

interface ScheduleProps {
  schedule: TeamInfo['schedule'];
}

function renderScheduleSection(
  title: string,
  events: ScheduleEvent[] | undefined
) {
  if (!events || events.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-2xl text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {events.map((event, index) => (
          <div key={index} className="p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/20">
            <div className="grid grid-cols-[auto,1fr,auto] gap-4 items-center">
              <div className="text-blue-200 font-medium">{event.time}</div>
              <div className="text-white">{event.event}</div>
              <div className="text-blue-200/80">{event.location}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Schedule({ schedule }: ScheduleProps) {
  if (!schedule?.isPublished) {
    return (
      <div>
        <h2 className="text-3xl font-['Harry_Potter'] text-white mb-6">Schedule</h2>
        <div className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/20">
          <p className="text-blue-200/60">Schedule will be published soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-['Harry_Potter'] text-white mb-6">Schedule</h2>
      <div>
        {schedule.showOrder !== null && (
          <div className="mb-8 p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/20">
            <p className="text-xl text-white">Performance Order: Team {schedule.showOrder}</p>
          </div>
        )}
        
        {renderScheduleSection('Friday', schedule.friday)}
        {renderScheduleSection('Saturday Tech Time', schedule.saturdayTech)}
        {renderScheduleSection('Saturday Pre-Show', schedule.saturdayPreShow)}
        {renderScheduleSection('Saturday Show', schedule.saturdayShow)}
        
        <div className="mb-8">
          <h3 className="text-2xl text-white mb-4">Saturday Post-Show</h3>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="text-xl text-blue-200 mb-4">Placing Teams</h4>
              <div className="space-y-3">
                {(schedule.saturdayPostShow?.placing || []).map((event, index) => (
                  <div key={index} className="p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/20">
                    <div className="grid grid-cols-[auto,1fr,auto] gap-4 items-center">
                      <div className="text-blue-200 font-medium">{event.time}</div>
                      <div className="text-white">{event.event}</div>
                      <div className="text-blue-200/80">{event.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xl text-blue-200 mb-4">Non-Placing Teams</h4>
              <div className="space-y-3">
                {(schedule.saturdayPostShow?.nonPlacing || []).map((event, index) => (
                  <div key={index} className="p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/20">
                    <div className="grid grid-cols-[auto,1fr,auto] gap-4 items-center">
                      <div className="text-blue-200 font-medium">{event.time}</div>
                      <div className="text-white">{event.event}</div>
                      <div className="text-blue-200/80">{event.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 