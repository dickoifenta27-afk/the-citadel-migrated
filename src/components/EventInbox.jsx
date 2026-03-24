import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';

const PRIORITY_COLORS = {
  CRITICAL: { bg: 'bg-red-900/30', border: 'border-red-600', badge: 'bg-red-600' },
  WARNING: { bg: 'bg-amber-900/30', border: 'border-amber-600', badge: 'bg-amber-600' },
  INFO: { bg: 'bg-blue-900/30', border: 'border-blue-600', badge: 'bg-blue-600' }
};

export default function EventInbox({ onSelectEvent }) {
  const { data: events = [] } = useQuery({
    queryKey: ['activeEvents'],
    queryFn: async () => await base44.entities.ActiveEvent.filter({ is_read: false }),
    staleTime: 5000
  });

  if (events.length === 0) return null;

  return (
    <div className="mt-6 rounded-lg backdrop-blur-sm" style={{
      background: 'rgba(10,8,5,0.85)',
      border: '1px solid rgba(201,168,76,0.25)',
      padding: '20px'
    }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📜</span>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-accent)' }}>
            Urgent Dispatches
          </h2>
          <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white">
            {events.length}
          </span>
        </div>
      </div>

      {/* Event List */}
      <div className="space-y-2">
        {events.map((event) => {
          const colors = PRIORITY_COLORS[event.priority] || PRIORITY_COLORS.INFO;
          return (
            <div
              key={event.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${colors.bg} ${colors.border}`}
              style={{ borderWidth: '1px' }}
            >
              <div className="flex items-center gap-3 flex-1">
                <span className={`px-2 py-1 rounded text-xs font-bold text-white ${colors.badge}`}>
                  {event.priority}
                </span>
                <span className="text-lg">📜</span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {event.title}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    From {event.speaker_advisor_id || 'Advisor'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onSelectEvent(event.id)}
                className="px-4 py-1.5 rounded text-sm font-semibold transition-all"
                style={{
                  background: 'rgba(201,168,76,0.2)',
                  border: '1px solid rgba(201,168,76,0.5)',
                  color: 'var(--color-text-accent)'
                }}
              >
                Baca
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}