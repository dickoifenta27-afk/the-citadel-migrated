import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function FactionStatus() {
  const { data: factions = [], isLoading } = useQuery({
    queryKey: ['factions'],
    queryFn: async () => await base44.entities.FactionRegistry.list(),
    staleTime: 30000
  });

  if (isLoading) return <div className="text-sm p-4" style={{ color: 'var(--color-text-secondary)' }}>Loading factions...</div>;

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {factions.map((faction) => (
          <div key={faction.id} className="rounded-xl p-4"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', backdropFilter: 'blur(4px)' }}>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>{faction.faction_name}</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm" style={{ color: 'var(--color-text-accent)' }}>Loyalty</span>
                  <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{faction.loyalty}%</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--color-border-default)' }}>
                  <div className="h-2 rounded-full transition-all"
                    style={{ width: `${faction.loyalty}%`, background: 'linear-gradient(to right, var(--color-gold-dark), var(--color-gold-primary))' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm" style={{ color: 'var(--color-text-accent)' }}>Influence</span>
                  <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{faction.influence}%</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--color-border-default)' }}>
                  <div className="h-2 rounded-full transition-all"
                    style={{ width: `${faction.influence}%`, background: 'linear-gradient(to right, #8B6914, #C9A84C)' }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}