import React from 'react';

export default function VictoryModal({ gameState, scenario }) {
  const handleRestart = () => window.location.reload();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="w-full max-w-xl rounded-xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--color-bg-secondary)', border: '3px solid var(--color-gold-primary)', boxShadow: '0 0 40px var(--color-gold-glow)' }}>
        <div className="p-5" style={{ borderBottom: '1px solid var(--color-border-default)' }}>
          <h2 className="text-4xl font-bold" style={{ fontFamily: 'Cinzel', color: 'var(--color-gold-bright)' }}>👑 Victory!</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="rounded-lg p-4" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
            <p className="text-lg mb-4" style={{ color: 'var(--color-text-primary)' }}>You have achieved the objective!</p>
            <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <p className="font-semibold mb-2" style={{ color: 'var(--color-text-accent)' }}>✓ {scenario?.title}</p>
              <p>• Turns Survived: {gameState?.turn_count}</p>
              <p>• Final Stability: {gameState?.stability.toFixed(1)}%</p>
              <p>• Final Population: {gameState?.population.toLocaleString()}</p>
              <p>• Final Gold: {gameState?.gold.toLocaleString()}</p>
            </div>
          </div>
          <button onClick={handleRestart} className="w-full py-3 rounded-lg font-bold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(to right, var(--color-gold-primary), var(--color-gold-dark))', color: '#0A0A0F', fontFamily: 'Cinzel' }}>
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}