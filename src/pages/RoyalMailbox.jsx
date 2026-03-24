import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Mail, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const TYPE_ICONS = {
  council_request: '👑',
  event: '⚡',
  faction_quest: '📋',
  system: '📜'
};

const TYPE_LABELS = {
  council_request: 'Council Request',
  event: 'Event',
  faction_quest: 'Faction Quest',
  system: 'System'
};

export default function RoyalMailbox() {
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('all'); // all | urgent | unread | resolved

  const { data: mailbox = [], refetch } = useQuery({
    queryKey: ['mailbox'],
    queryFn: () => base44.entities.Mailbox.list(),
    staleTime: 5000
  });

  const { data: gameState } = useQuery({
    queryKey: ['userState'],
    queryFn: async () => {
      const states = await base44.entities.UserState.list();
      return states[0];
    }
  });

  const filtered = useMemo(() => {
    return mailbox.filter(msg => {
      if (filter === 'urgent') return msg.is_urgent && !msg.is_resolved;
      if (filter === 'unread') return !msg.is_read;
      if (filter === 'resolved') return msg.is_resolved;
      return true;
    });
  }, [mailbox, filter]);

  const selected = mailbox.find(m => m.id === selectedId);
  const currentTurn = gameState?.turn_count || 1;

  const handleChoice = async (choice) => {
    if (!selected) return;
    try {
      const effects = JSON.parse(
        choice === 'a' ? selected.choice_a_effects : selected.choice_b_effects
      );
      
      // Apply effects to UserState
      const updated = { ...gameState };
      Object.entries(effects).forEach(([key, value]) => {
        if (typeof updated[key] === 'number') {
          updated[key] = Math.max(0, updated[key] + value);
        }
      });
      
      await base44.entities.UserState.update(gameState.id, updated);
      
      // Mark resolved
      await base44.entities.Mailbox.update(selected.id, {
        ...selected,
        is_resolved: true,
        resolution: choice === 'a' ? 'accepted' : 'declined',
        is_read: true
      });
      
      toast.success(`${selected.title} — action recorded`);
      refetch();
      setSelectedId(null);
    } catch (error) {
      console.error('Error resolving mailbox:', error);
      toast.error('Failed to process choice');
    }
  };

  const handleAcknowledge = async () => {
    if (!selected) return;
    try {
      await base44.entities.Mailbox.update(selected.id, {
        ...selected,
        is_resolved: true,
        resolution: 'acknowledged',
        is_read: true
      });
      toast.success(`${selected.title} — acknowledged`);
      refetch();
      setSelectedId(null);
    } catch (error) {
      console.error('Error acknowledging:', error);
      toast.error('Failed to acknowledge');
    }
  };

  const markRead = async (id) => {
    const msg = mailbox.find(m => m.id === id);
    if (msg && !msg.is_read) {
      await base44.entities.Mailbox.update(id, { ...msg, is_read: true });
      refetch();
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden gap-4 p-5" style={{ background: 'rgba(10,8,5,0.6)' }}>
      {/* Left Panel — Mailbox List */}
      <div className="w-80 flex flex-col overflow-hidden rounded-xl" style={{ background: 'rgba(10,8,5,0.85)', border: '1px solid rgba(255,215,0,0.2)' }}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#cd7f32]/20">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5" style={{ color: '#FFD700' }} />
            <h2 className="font-bold text-sm" style={{ fontFamily: 'Cinzel', color: '#FFD700' }}>Royal Mailbox</h2>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {mailbox.filter(m => !m.is_read).length} unread
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 px-3 py-2 border-b border-[#cd7f32]/20 flex-shrink-0">
          {['all', 'urgent', 'unread', 'resolved'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-2 py-1 rounded text-xs font-semibold transition-all capitalize"
              style={{
                background: filter === f ? 'rgba(201,168,76,0.2)' : 'transparent',
                color: filter === f ? '#FFD700' : '#A89880',
                border: filter === f ? '1px solid #C9A84C' : '1px solid transparent'
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Mailbox Items */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
              No messages
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filtered.map(msg => {
                const isExpired = msg.expires_at_turn && msg.expires_at_turn < currentTurn && !msg.is_resolved;
                const isExpiringSoon = msg.expires_at_turn && msg.expires_at_turn <= currentTurn + 2 && !msg.is_resolved && !msg.is_urgent;
                const isSelected = selectedId === msg.id;
                
                return (
                  <button
                    key={msg.id}
                    onClick={() => {
                      setSelectedId(msg.id);
                      markRead(msg.id);
                    }}
                    className="w-full text-left p-2 rounded-lg transition-all"
                    style={{
                      background: isSelected ? 'rgba(201,168,76,0.15)' : 'transparent',
                      borderLeft: msg.is_urgent ? '3px solid #C0392B' : isExpiringSoon ? '3px solid #E67E22' : '3px solid transparent',
                      opacity: isExpired ? 0.5 : 1,
                      borderRadius: '6px'
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">{TYPE_ICONS[msg.type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: '#E8E0D0' }}>
                          {msg.sender_name}
                        </p>
                        <p className="text-[10px] truncate" style={{ color: '#A89880' }}>
                          {msg.title}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>
                            Turn {msg.trigger_turn}
                          </span>
                          {msg.is_urgent && !msg.is_resolved && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold" style={{ background: '#C0392B', color: 'white' }}>
                              URGENT
                            </span>
                          )}
                          {isExpiringSoon && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold" style={{ background: '#E67E22', color: 'white' }}>
                              EXPIRING
                            </span>
                          )}
                        </div>
                      </div>
                      {!msg.is_read && (
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#FFD700' }} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel — Detail */}
      <div className="flex-1 flex flex-col overflow-hidden rounded-xl" style={{ background: 'rgba(10,8,5,0.85)', border: '1px solid rgba(255,215,0,0.2)' }}>
        {!selected ? (
          <div className="flex items-center justify-center h-full" style={{ color: 'var(--color-text-muted)' }}>
            <p className="text-sm">Select a message to read</p>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#cd7f32]/20 flex-shrink-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs font-semibold uppercase" style={{ color: 'var(--color-text-accent)' }}>
                    {TYPE_LABELS[selected.type]}
                  </p>
                  <h3 className="text-lg font-bold mt-1" style={{ color: '#FFD700', fontFamily: 'Cinzel' }}>
                    {selected.title}
                  </h3>
                </div>
                {selected.is_resolved && (
                  <span className="px-2 py-1 rounded text-xs font-bold" style={{ background: 'rgba(39,174,96,0.2)', color: '#27AE60' }}>
                    {selected.resolution.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-xs" style={{ color: '#A89880' }}>
                {selected.sender_name} {selected.sender_faction && `• ${selected.sender_faction}`}
              </p>
              {selected.expires_at_turn && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: selected.expires_at_turn <= currentTurn + 2 ? '#E67E22' : '#A89880' }}>
                  <Clock className="w-3 h-3" />
                  Expires Turn {selected.expires_at_turn}
                </p>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                {selected.body}
              </p>
            </div>

            {/* Actions */}
            {!selected.is_resolved ? (
              <div className="px-5 py-4 border-t border-[#cd7f32]/20 flex-shrink-0 space-y-2">
                {selected.choice_a_label ? (
                  <>
                    <button
                      onClick={() => handleChoice('a')}
                      className="w-full py-2 rounded-lg font-semibold text-sm transition-all"
                      style={{ background: 'rgba(76,201,168,0.2)', border: '1px solid #4CC9A8', color: '#4CC9A8' }}
                    >
                      ✓ {selected.choice_a_label}
                    </button>
                    {selected.choice_b_label && (
                      <button
                        onClick={() => handleChoice('b')}
                        className="w-full py-2 rounded-lg font-semibold text-sm transition-all"
                        style={{ background: 'rgba(192,57,43,0.2)', border: '1px solid #C0392B', color: '#C0392B' }}
                      >
                        ✕ {selected.choice_b_label}
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={handleAcknowledge}
                    className="w-full py-2 rounded-lg font-semibold text-sm transition-all"
                    style={{ background: 'linear-gradient(to right, #C9A84C, #8B6914)', color: '#0A0A0F' }}
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}