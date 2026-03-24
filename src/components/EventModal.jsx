import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';

export default function EventModal({ event, gameState, factions, onClose, onResolve }) {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChoice = async (choice) => {
    setIsProcessing(true);
    try {
      await base44.functions.invoke('processEventChoice', { event_id: event.id, choice });
      queryClient.invalidateQueries({ queryKey: ['userState'] });
      queryClient.invalidateQueries({ queryKey: ['factions'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onResolve?.();
      onClose();
    } catch (error) {
      console.error('Error resolving event:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--color-bg-secondary)', border: '3px solid var(--color-gold-primary)', boxShadow: '0 0 40px var(--color-gold-glow)' }}>

        {/* Header */}
        <div className="flex justify-between items-start p-5" style={{ borderBottom: '1px solid var(--color-border-default)' }}>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Cinzel', color: 'var(--color-text-accent)' }}>
              ⚡ {event.title}
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>A critical situation demands your attention</p>
          </div>
          <button onClick={onClose} className="ml-4 opacity-60 hover:opacity-100 transition-opacity" style={{ color: 'var(--color-text-accent)' }}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Description */}
          <div className="rounded-lg p-4" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
            <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{event.description}</p>
          </div>

          {/* Choices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => handleChoice('A')} disabled={isProcessing}
              className="group rounded-lg p-4 text-left transition-all disabled:opacity-50"
              style={{ border: '2px solid var(--color-gold-dark)', background: 'var(--color-bg-card)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-gold-primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-gold-dark)'}>
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--color-text-accent)' }}>Choice A</h3>
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>{event.choice_a_title}</p>
              <div className="text-xs space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
                {event.choice_a_effects?.gold && <p>💰 Gold: {event.choice_a_effects.gold > 0 ? '+' : ''}{event.choice_a_effects.gold}</p>}
                {event.choice_a_effects?.food && <p>🍎 Food: {event.choice_a_effects.food > 0 ? '+' : ''}{event.choice_a_effects.food}</p>}
              </div>
            </button>

            <button onClick={() => handleChoice('B')} disabled={isProcessing}
              className="group rounded-lg p-4 text-left transition-all disabled:opacity-50"
              style={{ border: '2px solid rgba(139,32,32,0.6)', background: 'var(--color-bg-card)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-danger)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(139,32,32,0.6)'}>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#E07070' }}>Choice B</h3>
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>{event.choice_b_title}</p>
              <div className="text-xs space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
                {event.choice_b_effects?.gold && <p>💰 Gold: {event.choice_b_effects.gold > 0 ? '+' : ''}{event.choice_b_effects.gold}</p>}
                {event.choice_b_effects?.food && <p>🍎 Food: {event.choice_b_effects.food > 0 ? '+' : ''}{event.choice_b_effects.food}</p>}
              </div>
            </button>
          </div>

          {isProcessing && (
            <div className="flex items-center justify-center gap-2" style={{ color: 'var(--color-text-accent)' }}>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing decision...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}