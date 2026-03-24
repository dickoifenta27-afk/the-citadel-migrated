import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Loader2, AlertCircle, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function ScenarioInfo({ gameState, onTurnEnd, onCouncilRequest, onProjectionsUpdate, pendingEventCount = 0 }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMailboxId, setSelectedMailboxId] = useState(null);

  const { data: activeScenario } = useQuery({
    queryKey: ['activeScenario'],
    queryFn: async () => {
      const scenarios = await base44.entities.ScenarioMaster.list();
      return scenarios.find(s => s.is_active) || null;
    },
    staleTime: 60000,
  });

  const { data: mailbox = [], refetch: refetchMailbox } = useQuery({
    queryKey: ['mailbox'],
    queryFn: () => base44.entities.Mailbox.list(),
    staleTime: 5000
  });

  const unresolvedMailbox = useMemo(() => {
    return mailbox.filter(m => !m.is_resolved).sort((a, b) => {
      if (a.is_urgent && !b.is_urgent) return -1;
      if (!a.is_urgent && b.is_urgent) return 1;
      return (a.expires_at_turn || 999) - (b.expires_at_turn || 999);
    });
  }, [mailbox]);

  const selectedMailbox = mailbox.find(m => m.id === selectedMailboxId);

  const handleMailboxChoice = async (choice) => {
    if (!selectedMailbox) return;
    try {
      const effects = JSON.parse(
        choice === 'a' ? selectedMailbox.choice_a_effects : selectedMailbox.choice_b_effects
      );
      
      const updated = { ...gameState };
      Object.entries(effects).forEach(([key, value]) => {
        if (typeof updated[key] === 'number') {
          updated[key] = Math.max(0, updated[key] + value);
        }
      });
      
      await base44.entities.UserState.update(gameState.id, updated);
      await base44.entities.Mailbox.update(selectedMailbox.id, {
        is_resolved: true,
        resolution: choice === 'a' ? 'accepted' : 'declined',
        is_read: true
      });
      
      toast.success(`${selectedMailbox.title} — action recorded`);
      refetchMailbox();
      setSelectedMailboxId(null);
    } catch (error) {
      console.error('Error resolving mailbox:', error);
      toast.error('Failed to process choice');
    }
  };

  const criticalResources = useMemo(() => {
    if (!gameState) return [];
    const resources = [
      { name: 'Gold', delta: gameState.gold_delta || 0 },
      { name: 'Food', delta: gameState.food_delta || 0 },
      { name: 'Iron', delta: gameState.iron_delta || 0 },
      { name: 'Wood', delta: gameState.wood_delta || 0 }
    ];
    const negative = resources.filter(r => r.delta < 0).sort((a, b) => a.delta - b.delta);
    return negative.slice(0, 3);
  }, [gameState]);

  const handleEndTurn = async () => {
    if (pendingEventCount > 0) return;
    setIsProcessing(true);
    try {
      const response = await base44.functions.invoke('endTurn', {});
      if (response.data?.success) {
        onTurnEnd?.();
      }
    } catch (error) {
      console.error('Error ending turn:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const panelStyle = {
    background: 'rgba(20, 16, 10, 0.15)',
    backdropFilter: 'blur(6px)',
    border: '1px solid rgba(201,168,76,0.15)',
    borderRadius: 10,
    padding: '14px'
  };

  return (
    <div className="rounded-xl overflow-hidden space-y-3 p-4"
      style={{ background: 'rgba(10, 8, 5, 0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(201,168,76,0.2)' }}>

      <h2 className="font-semibold text-sm" style={{ fontFamily: 'Cinzel', color: 'var(--color-gold-bright)' }}>
        Scenario & Actions
      </h2>

      {/* Mission Info */}
      {activeScenario && (
        <div style={panelStyle} className="space-y-3">
          <div>
            <p className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-accent)' }}>Active Mission</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-gold-bright)' }}>{activeScenario.title}</p>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{activeScenario.objective_desc}</p>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between mb-1 text-[10px]">
                <span style={{ color: 'var(--color-text-accent)' }}>Turn Progress</span>
                <span style={{ color: 'var(--color-gold-bright)' }}>{gameState?.turn_count}/{activeScenario.target_turn}</span>
              </div>
              <div className="w-full rounded h-1.5" style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)' }}>
                <div className="h-full rounded" style={{ width: `${Math.min(100, (gameState?.turn_count / activeScenario.target_turn) * 100)}%`, background: 'var(--color-gold-primary)' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1 text-[10px]">
                <span style={{ color: 'var(--color-text-accent)' }}>Stability Required</span>
                <span style={{ color: (gameState?.stability ?? 0) >= activeScenario.target_stability ? 'var(--color-success)' : 'var(--color-warning)' }}>
                  {((gameState?.stability ?? 0) * 100).toFixed(0)}% / {(activeScenario.target_stability * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full rounded h-1.5" style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-default)' }}>
                <div className="h-full rounded" style={{
                  width: `${Math.min(100, (gameState?.stability ?? 0) * 100)}%`,
                  background: (gameState?.stability ?? 0) >= activeScenario.target_stability ? 'var(--color-success)' : 'var(--color-warning)'
                }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Turn Counter */}
      <div style={panelStyle}>
        <p className="text-xs font-medium uppercase mb-1" style={{ color: 'var(--color-text-accent)' }}>Current Turn</p>
        <p className="text-2xl font-bold" style={{ color: 'var(--color-gold-bright)' }}>{gameState?.turn_count}</p>
      </div>

      {/* Resource Alert */}
      {criticalResources.length > 0 ? (
        <div style={{ ...panelStyle, borderColor: 'rgba(192,57,43,0.4)' }}>
          <p className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--color-danger)' }}>⚠ Watch</p>
          <div className="space-y-1.5">
            {criticalResources.map(r => (
              <div key={r.name} className="flex justify-between text-[11px]">
                <span style={{ color: 'var(--color-text-accent)' }}>{r.name}</span>
                <span className="font-bold" style={{ color: 'var(--color-danger)' }}>{r.delta}/turn</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ ...panelStyle, borderColor: 'rgba(39,174,96,0.4)' }}>
          <p className="text-xs font-bold uppercase" style={{ color: 'var(--color-success)' }}>✓ All resources stable</p>
        </div>
      )}

      {/* Royal Correspondence */}
      <div style={panelStyle} className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase" style={{ color: 'var(--color-text-accent)' }}>Royal Correspondence</p>
          {unresolvedMailbox.length > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: 'rgba(192,57,43,0.2)', color: '#C0392B' }}>
              {unresolvedMailbox.length}
            </span>
          )}
        </div>
        <div style={{ height: '1px', background: 'linear-gradient(to right, rgba(201,168,76,0.3), transparent)' }} />
        
        {unresolvedMailbox.length === 0 ? (
          <p className="text-xs text-center italic py-4" style={{ color: 'var(--color-text-muted)' }}>
            No pending matters, Your Majesty.
          </p>
        ) : (
          <div className="space-y-1">
            {unresolvedMailbox.map(msg => {
              const isExpiringSoon = msg.expires_at_turn && msg.expires_at_turn <= gameState.turn_count + 1;
              const isSelected = selectedMailboxId === msg.id;
              return (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMailboxId(msg.id)}
                  className="w-full text-left p-2 rounded transition-all text-xs"
                  style={{
                    background: isSelected ? 'rgba(201,168,76,0.15)' : 'transparent',
                    border: isSelected ? '1px solid rgba(201,168,76,0.4)' : '1px solid transparent'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{msg.is_urgent ? '🔴' : isExpiringSoon ? '🟡' : '⚪'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate" style={{ color: '#E8E0D0' }}>{msg.title}</p>
                      <p style={{ color: '#A89880' }}>{msg.sender_name}</p>
                    </div>
                    {msg.expires_at_turn && (
                      <span style={{ color: '#A89880', whiteSpace: 'nowrap' }}>T{msg.expires_at_turn}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Mailbox Detail Modal */}
      {selectedMailbox && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setSelectedMailboxId(null)}>
          <div style={{
            background: 'rgba(10,8,5,0.95)',
            border: '1px solid rgba(201,168,76,0.4)',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            maxHeight: '70vh',
            overflow: 'auto',
            backdropFilter: 'blur(8px)'
          }} onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Cinzel', color: '#FFD700' }}>{selectedMailbox.title}</h3>
            <p className="text-xs mb-4" style={{ color: '#A89880' }}>{selectedMailbox.sender_name}</p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-text-primary)' }}>{selectedMailbox.body}</p>
            
            {!selectedMailbox.is_resolved && (
              <div className="flex gap-2">
                {selectedMailbox.choice_a_label ? (
                  <>
                    <button
                      onClick={() => handleMailboxChoice('a')}
                      className="flex-1 py-2 rounded font-semibold text-sm transition-all"
                      style={{ background: 'rgba(76,201,168,0.2)', border: '1px solid #4CC9A8', color: '#4CC9A8' }}
                    >
                      {selectedMailbox.choice_a_label}
                    </button>
                    {selectedMailbox.choice_b_label && (
                      <button
                        onClick={() => handleMailboxChoice('b')}
                        className="flex-1 py-2 rounded font-semibold text-sm transition-all"
                        style={{ background: 'rgba(192,57,43,0.2)', border: '1px solid #C0392B', color: '#C0392B' }}
                      >
                        {selectedMailbox.choice_b_label}
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => handleMailboxChoice('a')}
                    className="w-full py-2 rounded font-semibold text-sm"
                    style={{ background: 'linear-gradient(to right, #C9A84C, #8B6914)', color: '#0A0A0F' }}
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            )}
            <button
              onClick={() => setSelectedMailboxId(null)}
              className="w-full mt-4 py-2 rounded text-xs font-semibold transition-all"
              style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: 'var(--color-text-accent)' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleEndTurn}
        disabled={isProcessing || pendingEventCount > 0}
        title={pendingEventCount > 0 ? `Complete all ${pendingEventCount} urgent dispatch(es) before ending turn` : ''}
        className="w-full font-bold py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(to right, var(--color-gold-primary), var(--color-gold-dark))', color: '#0A0A0F', fontFamily: 'Cinzel' }}
      >
        {pendingEventCount > 0 ? '⏳ Complete Dispatches' : isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Processing Turn...
          </span>
        ) : 'End Turn'}
      </button>
    </div>
  );
}