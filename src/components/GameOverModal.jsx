import React from 'react';

export default function GameOverModal({ gameState, reason }) {
  const handleRestart = () => window.location.reload();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="w-full max-w-xl rounded-xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--color-bg-secondary)', border: '3px solid var(--color-danger)', boxShadow: '0 0 40px rgba(192,57,43,0.4)' }}>
        <div className="p-5" style={{ borderBottom: '1px solid rgba(192,57,43,0.4)' }}>
          <h2 className="text-4xl font-bold" style={{ fontFamily: 'Cinzel', color: 'var(--color-danger)' }}>⚰️ Kingdom Fallen</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="rounded-lg p-4" style={{ background: 'var(--color-bg-card)', border: '1px solid rgba(192,57,43,0.3)' }}>
            <p className="text-lg mb-4" style={{ color: 'var(--color-text-primary)' }}>Your kingdom has collapsed...</p>
            <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {reason === 'stability' && (
                <>
                  <p>• Stability reached critical levels: {(gameState?.stability * 100).toFixed(1)}%</p>
                  <p>• Population lost faith in your leadership</p>
                </>
              )}
              {reason === 'population' && (
                <>
                  <p>• Population collapsed due to starvation</p>
                  <p>• Current population: {gameState?.population}</p>
                </>
              )}
              <p>• Turn reached: {gameState?.turn_count}</p>
            </div>
          </div>
          <button onClick={handleRestart} className="w-full py-3 rounded-lg font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--color-danger)', fontFamily: 'Cinzel' }}>
            Restart Game
          </button>
        </div>
      </div>
    </div>
  );
}