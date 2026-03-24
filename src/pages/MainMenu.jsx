import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabase-client.js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Sword, Clock } from 'lucide-react';

const ICONS = {
  Gold: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/120da579d_gold.png',
  Food: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/206bfbc58_food.png',
  Iron: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/ebe2e7076_iron.png',
  Wood: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/21930e5bf_wood.png',
  PP: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/1eefb7830_political_points.png',
  Stability: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/ad30333c8_stability.png',
  Mana: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/7efcb30af_mana.png',
  Population: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/f77789096_population.png'
};

const DIFFICULTY_CONFIG = {
  Easy: { color: '#5DBB63', border: 'var(--color-difficulty-easy)', bg: 'rgba(46,125,82,0.15)', badgeBg: '#1a3d2a', badgeText: '#5DBB63' },
  Normal: { color: '#C9A84C', border: 'var(--color-difficulty-normal)', bg: 'rgba(139,105,20,0.15)', badgeBg: '#2a1f00', badgeText: '#C9A84C' },
  Hard: { color: '#E07070', border: 'var(--color-difficulty-hard)', bg: 'rgba(139,32,32,0.15)', badgeBg: '#2a0000', badgeText: '#E07070' },
  Insane: { color: '#9B7FCC', border: 'var(--color-difficulty-insane)', bg: 'rgba(91,45,142,0.15)', badgeBg: '#1a0030', badgeText: '#9B7FCC' }
};

function DifficultyStars({ difficulty }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }).map((_, i) =>
        <div key={i} className={`w-1.5 h-1.5 rounded-sm ${i < difficulty ? 'bg-current' : 'bg-white/10'}`} />
      )}
    </div>
  );
}

function EmberParticles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 200,
      size: Math.random() * 1.2 + 0.3,
      speedY: Math.random() * 0.7 + 0.2,
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      baseOpacity: Math.random() * 0.5 + 0.2,
      hue: Math.random() * 20 + 10,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.025 + 0.008,
      flicker: Math.random() * Math.PI * 2,
      flickerSpeed: Math.random() * 0.12 + 0.06,
    }));

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y -= p.speedY;
        p.wobble += p.wobbleSpeed;
        p.flicker += p.flickerSpeed;
        p.x += p.speedX + Math.sin(p.wobble) * 0.3;
        p.baseOpacity -= 0.0006;
        // Flicker effect
        const flickerMod = 0.5 + 0.5 * Math.sin(p.flicker) * Math.sin(p.flicker * 2.3 + 1.1);
        p.opacity = Math.max(0, p.baseOpacity * flickerMod);
        if (p.y < -10 || p.baseOpacity <= 0) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 10;
          p.baseOpacity = Math.random() * 0.5 + 0.2;
          p.size = Math.random() * 1.2 + 0.3;
          p.flickerSpeed = Math.random() * 0.12 + 0.06;
        }
        ctx.save();
        ctx.globalAlpha = p.opacity;
        // Warm ember core: white-yellow center → orange → transparent
        const r = p.size * 2;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        gradient.addColorStop(0, `hsl(${p.hue + 40}, 100%, 98%)`);
        gradient.addColorStop(0.3, `hsl(${p.hue + 20}, 100%, 70%)`);
        gradient.addColorStop(0.7, `hsl(${p.hue}, 100%, 45%)`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />;
}

export default function MainMenu() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);

  const { data: userState } = useQuery({
    queryKey: ['userState'],
    queryFn: async () => {
      const states = await base44.entities.UserState.list();
      return states[0];
    }
  });

  const { data: scenarios } = useQuery({
    queryKey: ['scenarios'],
    queryFn: () => base44.entities.ScenarioMaster.list()
  });

  const { data: factions } = useQuery({
    queryKey: ['factions'],
    queryFn: () => base44.entities.FactionRegistry.list()
  });

  const applyInitialState = async (initialState, factionLoyalties) => {
    const defaultState = {
      turn_count: 1,
      gold: 5000, food: 3000, iron: 800, wood: 1200,
      population: 5000, stability: 0.65, mana: 100,
      political_points: 50, prosperity: 0.5, corruption_reduction: 0
    };
    const parsedInitialState = typeof initialState === 'string' ? JSON.parse(initialState) : (initialState || {});
    const state = { ...defaultState, ...parsedInitialState };

    if (userState) {
      await base44.entities.UserState.update(userState.id, state);
    } else {
      // Get current user and add user_id for RLS policy
      const { data: { user } } = await supabase.auth.getUser();
      await base44.entities.UserState.create({ ...state, user_id: user.id });
    }

    // Invalidate userState query cache so Layout.jsx fetches fresh data
    queryClient.invalidateQueries({ queryKey: ['userState'] });

    // Clear TurnHistory, ActiveEvents, and MarketRates for fresh start
    try {
      const turnHistories = await base44.entities.TurnHistory.list();
      for (const th of turnHistories) {
        await base44.entities.TurnHistory.delete(th.id);
      }
      const activeEvents = await base44.entities.ActiveEvent.list();
      for (const ae of activeEvents) {
        await base44.entities.ActiveEvent.delete(ae.id);
      }
      // Clear market rates history
      const marketRates = await base44.entities.MarketRates.list();
      for (const mr of marketRates) {
        await base44.entities.MarketRates.delete(mr.id);
      }
    } catch (err) {
      // Ignore if entities don't exist
    }

    // Note: Faction loyalties are now handled per-user in user_states
    // The faction_registry table contains base values, not user-specific
  };

  const handleNewGame = async () => {
    setIsLoading(true);
    try {
      await applyInitialState({}, {});
      if (scenarios?.length > 0) {
        for (const s of scenarios) {
          await base44.entities.ScenarioMaster.update(s.id, { ...s, is_active: false });
        }
      }
      navigate('/Citadel');
    } catch (error) {
      console.error('Error starting new game:', error);
      alert('Failed to start new game');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (userState) navigate('/Citadel');
    else alert('No saved game found');
  };

  const handleStartScenario = async () => {
    if (!selectedScenario) return;
    setIsLoading(true);
    try {
      await applyInitialState(selectedScenario.initial_state, selectedScenario.faction_loyalties);
      if (scenarios?.length > 0) {
        for (const s of scenarios) {
          await base44.entities.ScenarioMaster.update(s.id, {
            ...s,
            is_active: s.scenario_id === selectedScenario.scenario_id
          });
        }
      }
      navigate('/Citadel');
    } catch (error) {
      console.error('Error loading scenario:', error);
      alert('Failed to load scenario');
    } finally {
      setIsLoading(false);
    }
  };

  const sortedScenarios = scenarios?.slice().sort((a, b) => (a.difficulty || 5) - (b.difficulty || 5));
  const activeScenario = scenarios?.find(s => s.is_active);

  return (
    <div
      className="h-screen bg-[#0a0a0c] flex flex-col items-center justify-center overflow-hidden relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.7)), url('https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/0401a2039_generated_image.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>

      <EmberParticles />

      <div className="w-full max-w-5xl px-6 flex flex-col gap-4" style={{ position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div className="text-center">
          <img
            src="https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/143d9bc35_logo_transparent_v2.png"
            alt="The Citadel: Crown & Counsel"
            className="mx-auto w-72"
            style={{ mixBlendMode: 'lighten' }} />
        </div>

        {/* Continue - only shown if save exists */}
        {userState && (
          <button
            onClick={handleContinue}
            disabled={isLoading}
            className="w-full rounded-xl px-5 py-4 transition-all backdrop-blur-sm border text-left"
            style={{ background: 'rgba(20,16,10,0.82)', borderColor: 'var(--color-border-active)', boxShadow: '0 0 24px rgba(201,168,76,0.12)' }}>

            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sword className="w-5 h-5 shrink-0" style={{ color: 'var(--color-gold-primary)' }} />
                <p className="font-bold text-sm" style={{ fontFamily: 'Cinzel', color: 'var(--color-text-accent)' }}>Continue Your Campaign</p>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded" style={{ background: 'rgba(201,168,76,0.15)' }}>
                <Clock className="w-3 h-3" style={{ color: 'var(--color-text-accent)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-accent)' }}>Turn {userState.turn_count}</span>
              </div>
            </div>

            {/* Active scenario name */}
            {activeScenario && (
              <p className="text-xs mb-3 pl-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                📜 {activeScenario.title}
                {activeScenario.difficulty_label && (
                  <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                    style={{
                      background: DIFFICULTY_CONFIG[activeScenario.difficulty_label]?.badgeBg || '#2a1f00',
                      color: DIFFICULTY_CONFIG[activeScenario.difficulty_label]?.badgeText || '#C9A84C'
                    }}>
                    {activeScenario.difficulty_label}
                  </span>
                )}
              </p>
            )}

            {/* Resource snapshot */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: ICONS.Gold, value: userState.gold?.toLocaleString(), label: 'Gold' },
                { icon: ICONS.Food, value: userState.food?.toLocaleString(), label: 'Food' },
                { icon: ICONS.Iron, value: userState.iron?.toLocaleString(), label: 'Iron' },
                { icon: ICONS.Wood, value: userState.wood?.toLocaleString(), label: 'Wood' },
              ].map(r => (
                <div key={r.label} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5" style={{ background: 'transparent' }}>
                  <img src={r.icon} alt={r.label} className="w-5 h-5 object-contain" />
                  <div>
                    <p className="text-[9px] uppercase" style={{ color: 'var(--color-text-muted)' }}>{r.label}</p>
                    <p className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{r.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </button>
        )}

        {/* Scenario Selection */}
        <div className="bg-black/50 border border-[#cd7f32]/40 rounded-2xl backdrop-blur-sm overflow-hidden">
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border-default)' }}>
            <h2 className="font-bold text-sm" style={{ fontFamily: 'Cinzel', color: 'var(--color-text-accent)' }}>⚔ Choose Your Campaign</h2>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Select a scenario to begin a new game</p>
          </div>

          <div className="p-3 flex flex-col gap-3">
            {/* Scenario Grid - always 3 cols */}
            <div className="grid grid-cols-3 gap-2">
              {sortedScenarios?.map((scenario) => {
                const label = scenario.difficulty_label || 'Normal';
                const cfg = DIFFICULTY_CONFIG[label] || DIFFICULTY_CONFIG.Normal;
                const isSelected = selectedScenario?.scenario_id === scenario.scenario_id;
                return (
                  <button
                    key={scenario.id}
                    onClick={() => setSelectedScenario(isSelected ? null : scenario)}
                    className="rounded-xl p-3 text-left transition-all"
                    style={{
                      background: isSelected ? cfg.bg : 'rgba(10,8,5,0.5)',
                      border: isSelected ? `2px solid ${cfg.border}` : '1px solid var(--color-border-default)',
                      color: cfg.color
                    }}>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="font-bold text-xs leading-tight truncate" style={{ fontFamily: 'Cinzel' }}>{scenario.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-semibold" style={{ background: cfg.badgeBg, color: cfg.badgeText }}>{label}</span>
                    </div>
                    <DifficultyStars difficulty={scenario.difficulty || 5} />
                  </button>
                );
              })}
              {(!sortedScenarios || sortedScenarios.length === 0) && (
                <p className="text-xs col-span-3 p-2" style={{ color: 'var(--color-text-muted)' }}>No scenarios available</p>
              )}
            </div>

            {/* Detail Panel - below grid when selected */}
            {selectedScenario && (() => {
              const label = selectedScenario.difficulty_label || 'Normal';
              const cfg = DIFFICULTY_CONFIG[label] || DIFFICULTY_CONFIG.Normal;
              const init = selectedScenario.initial_state || {};
              const params = [
                init.gold !== undefined && { icon: ICONS.Gold, label: 'Gold', value: init.gold.toLocaleString() },
                init.food !== undefined && { icon: ICONS.Food, label: 'Food', value: init.food.toLocaleString() },
                init.iron !== undefined && { icon: ICONS.Iron, label: 'Iron', value: init.iron.toLocaleString() },
                init.wood !== undefined && { icon: ICONS.Wood, label: 'Wood', value: init.wood.toLocaleString() },
                init.stability !== undefined && { icon: ICONS.Stability, label: 'Stability', value: `${Math.round(init.stability * 100)}%` },
                init.mana !== undefined && { icon: ICONS.Mana, label: 'Mana', value: init.mana },
                init.population !== undefined && { icon: ICONS.Population, label: 'Population', value: init.population.toLocaleString() },
                init.political_points !== undefined && { icon: ICONS.PP, label: 'PP', value: init.political_points },
              ].filter(Boolean);

              return (
                <div className="rounded-xl p-4 flex flex-col gap-3"
                  style={{ background: 'rgba(10,8,5,0.6)', border: `1px solid ${cfg.border}` }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm mb-1" style={{ fontFamily: 'Cinzel', color: cfg.color }}>{selectedScenario.title}</h3>
                      <DifficultyStars difficulty={selectedScenario.difficulty || 5} />
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: cfg.badgeBg, color: cfg.badgeText }}>{label}</span>
                  </div>

                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{selectedScenario.objective_desc}</p>

                  {params.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wide font-semibold mb-1.5" style={{ color: 'var(--color-text-accent)' }}>Starting Conditions</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {params.map((p) => (
                          <div key={p.label} className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ background: 'rgba(0,0,0,0.4)' }}>
                            <img src={p.icon} alt={p.label} className="w-6 h-6 object-contain" />
                            <div>
                              <p className="text-[9px] uppercase" style={{ color: 'var(--color-text-accent)' }}>{p.label}</p>
                              <p className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{p.value}</p>
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ background: 'rgba(0,0,0,0.4)' }}>
                          <Clock className="w-5 h-5" style={{ color: 'var(--color-text-accent)' }} />
                          <div>
                            <p className="text-[9px] uppercase" style={{ color: 'var(--color-text-accent)' }}>Turn Limit</p>
                            <p className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{selectedScenario.target_turn}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleStartScenario}
                    disabled={isLoading}
                    className="w-full font-bold text-xs py-2 rounded-lg transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(to right, var(--color-gold-primary), var(--color-gold-dark))', color: '#0A0A0F', fontFamily: 'Cinzel' }}>
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin inline" /> : `⚔ Begin: ${selectedScenario.title}`}
                  </button>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="text-center text-[#444] text-[10px]">
          © 2026 The Citadel: Crown & Counsel
        </div>
      </div>
    </div>
  );
}