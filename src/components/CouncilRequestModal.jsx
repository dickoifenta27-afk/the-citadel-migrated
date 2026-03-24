import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { FACTION_COLORS } from '@/lib/gameConstants';

export default function CouncilRequestModal({ request, onClose, onResolve }) {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChoice = async (choiceKey) => {
    setIsProcessing(true);
    try {
      const councilMembers = await base44.entities.CouncilMember.list();
      const speaker = councilMembers.find(c => c.faction_name === request.faction);
      if (!speaker) throw new Error(`Speaker not found for faction: ${request.faction}`);
      const choice = request[choiceKey];
      if (!choice) throw new Error(`Choice ${choiceKey} not found`);
      await base44.entities.CouncilMember.update(speaker.id, { ...speaker, favor_points: speaker.favor_points + choice.favor_delta });
      queryClient.invalidateQueries({ queryKey: ['councilMembers'] });
      onResolve();
      onClose();
    } catch (error) {
      console.error('Error processing council choice:', error);
      alert('Failed to process council request: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 p-4" style={{ background: 'rgba(0,0,0,0.82)' }}>
      <div className="w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--color-bg-secondary)', border: '3px solid var(--color-gold-primary)', boxShadow: '0 0 40px var(--color-gold-glow)' }}>

        <div className="p-5" style={{ borderBottom: '1px solid var(--color-border-default)' }}>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Cinzel', color: 'var(--color-text-accent)' }}>📜 Council Request</h2>
          <p className="font-semibold text-lg" style={{ color: FACTION_COLORS[request.faction] ? undefined : 'var(--color-text-primary)', ...(FACTION_COLORS[request.faction] ? {} : {}) }}>
            {request.speaker_name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{request.faction}</p>
        </div>

        <div className="p-5 space-y-5">
          <div className="rounded-lg p-4" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
            <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{request.dialog}</p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-lg cursor-pointer transition-all"
              style={{ borderLeft: '4px solid var(--color-success)', background: 'rgba(39,174,96,0.1)' }}
              onClick={() => handleChoice('choice_a')}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(39,174,96,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(39,174,96,0.1)'}>
              <p className="font-semibold mb-1" style={{ color: 'var(--color-success)' }}>✓ {request.choice_a.title}</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{request.choice_a.description}</p>
              <p className="text-xs mt-2 font-mono" style={{ color: 'var(--color-success)' }}>
                Favor: {request.choice_a.favor_delta > 0 ? '+' : ''}{request.choice_a.favor_delta}
              </p>
            </div>

            <div className="p-4 rounded-lg cursor-pointer transition-all"
              style={{ borderLeft: '4px solid var(--color-danger)', background: 'rgba(192,57,43,0.1)' }}
              onClick={() => handleChoice('choice_b')}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(192,57,43,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(192,57,43,0.1)'}>
              <p className="font-semibold mb-1" style={{ color: '#E07070' }}>✗ {request.choice_b.title}</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{request.choice_b.description}</p>
              <p className="text-xs mt-2 font-mono" style={{ color: '#E07070' }}>
                Favor: {request.choice_b.favor_delta > 0 ? '+' : ''}{request.choice_b.favor_delta}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => handleChoice('choice_a')} disabled={isProcessing}
              className="flex-1 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50"
              style={{ background: 'var(--color-success)', color: '#fff' }}>
              {isProcessing ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Processing...</span> : request.choice_a.title}
            </button>
            <button onClick={() => handleChoice('choice_b')} disabled={isProcessing}
              className="flex-1 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50"
              style={{ background: 'var(--color-danger)', color: '#fff' }}>
              {isProcessing ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Processing...</span> : request.choice_b.title}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}