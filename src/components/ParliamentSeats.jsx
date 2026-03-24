import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function ParliamentSeats({ gameState }) {
  const { data: councilMembers = [] } = useQuery({
    queryKey: ['councilMembers'],
    queryFn: async () => {
      return await base44.entities.CouncilMember.list();
    }
  });

  const { data: electionCycle } = useQuery({
    queryKey: ['electionCycle'],
    queryFn: async () => {
      const cycles = await base44.entities.ElectionCycle.list();
      return cycles[0] || { cycle_length: 10, last_election_turn: 0 };
    }
  });

  const turnsUntilElection = electionCycle ? 
    Math.max(0, electionCycle.cycle_length - (gameState?.turn_count - electionCycle.last_election_turn)) : 0;

  const factionColors = {
    'Gilded Council': '#B8860B',
    'Iron Vanguard': '#DC143C',
    'Common Folk': '#FFD700',
    'Archive': '#9370DB'
  };

  const factionAbbr = {
    'Gilded Council': 'C',
    'Iron Vanguard': 'V',
    'Common Folk': 'F',
    'Archive': 'A'
  };

  // Generate seat array (total 20 seats)
  const seats = [];
  councilMembers.forEach(member => {
    for (let i = 0; i < member.seat_count; i++) {
      seats.push({
        faction: member.faction_name,
        color: factionColors[member.faction_name] || '#666',
        abbr: factionAbbr[member.faction_name] || '?'
      });
    }
  });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>Parliament Seats (20 Total)</h3>
      <div className="rounded-xl p-6" style={{ border: '2px solid var(--color-gold-dark)', background: 'var(--color-bg-card)', backdropFilter: 'blur(4px)' }}>
        <div className="grid grid-cols-10 gap-2">
          {seats.map((seat, idx) => (
            <div key={idx}
              className="h-8 rounded flex items-center justify-center font-bold text-white text-xs transition-transform hover:scale-110 cursor-pointer"
              style={{ backgroundColor: seat.color }}
              title={seat.faction}>
              {seat.abbr}
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-accent)' }}>Faction Representation</h4>
          {councilMembers.map(member => (
            <div key={member.id} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: factionColors[member.faction_name] || '#666' }} />
                <span style={{ color: 'var(--color-text-primary)' }}>{member.faction_name}</span>
              </div>
              <span className="font-semibold" style={{ color: 'var(--color-text-accent)' }}>{member.seat_count} seats</span>
            </div>
          ))}
          <div className="pt-3" style={{ borderTop: '1px solid var(--color-border-default)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-accent)' }}>
              ⏰ Next Election in: <span style={{ color: 'var(--color-gold-bright)' }}>{turnsUntilElection} turns</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}