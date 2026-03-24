import React from 'react';

export default function KingdomStatus({ gameState }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-active)' }}>
      <h2 className="font-semibold mb-4" style={{ fontFamily: 'Cinzel', color: 'var(--color-gold-bright)' }}>Kingdom Status</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-accent)' }}>Stability</span>
            <span className="font-bold" style={{ color: 'var(--color-gold-bright)' }}>{(gameState?.stability * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full rounded-full h-3" style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)' }}>
            <div className="h-3 rounded-full"
              style={{ width: `${gameState?.stability * 100}%`, background: 'linear-gradient(to right, var(--color-info), #5DB8E8)' }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-accent)' }}>Mana</span>
            <span className="font-bold" style={{ color: 'var(--color-gold-bright)' }}>{(gameState?.mana * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full rounded-full h-3" style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)' }}>
            <div className="h-3 rounded-full"
              style={{ width: `${gameState?.mana * 100}%`, background: 'linear-gradient(to right, var(--color-resource-mana), #B06AD0)' }} />
          </div>
        </div>

        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border-default)' }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-accent)' }}>Population</p>
              <p className="text-xl font-bold" style={{ color: 'var(--color-gold-bright)' }}>{gameState?.population.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-accent)' }}>Turn</p>
              <p className="text-xl font-bold" style={{ color: 'var(--color-gold-bright)' }}>{gameState?.turn_count}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}