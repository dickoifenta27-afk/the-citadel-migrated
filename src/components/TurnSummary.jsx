import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function TurnSummary({ gameState, onProjectionsCalculated }) {
  const [projections, setProjections] = useState(null);

  const { data: councilMembers = [] } = useQuery({
    queryKey: ['councilMembers'],
    queryFn: async () => await base44.entities.CouncilMember.list(),
    staleTime: 30000
  });

  const { data: factions = [] } = useQuery({
    queryKey: ['factions'],
    queryFn: async () => await base44.entities.FactionRegistry.list(),
    staleTime: 30000
  });

  const { data: activeLaws = [] } = useQuery({
    queryKey: ['activeLaws'],
    queryFn: async () => {
      const laws = await base44.entities.LawLibrary.list();
      return laws.filter(law => law.is_active);
    },
    staleTime: 30000
  });

  const { data: buildings = [] } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => await base44.entities.Buildings.list(),
    staleTime: 30000
  });

  const { data: buildingStats = [] } = useQuery({
    queryKey: ['buildingStats'],
    queryFn: async () => await base44.entities.BuildingStats.list(),
    staleTime: 30000
  });

  useEffect(() => {
    if (!gameState) return;

    // PP Regeneration
    const basePP = 10;
    let ppFromFactions = 0;
    const ppBreakdown = [];

    for (const councilMember of councilMembers) {
      const faction = factions.find(f => f.faction_name === councilMember.faction_name);
      if (faction && councilMember.seat_count > 0) {
        const contribution = (faction.loyalty - 0.5) * councilMember.seat_count;
        ppFromFactions += contribution;
        ppBreakdown.push({
          faction: faction.faction_name,
          loyalty: faction.loyalty,
          seats: councilMember.seat_count,
          contribution: contribution
        });
      }
    }

    const totalPPRegen = Math.floor(basePP + ppFromFactions);

    // Calculate law effects
    let stabilityDelta = 0;
    let manaDelta = 0;
    let goldDelta = 0;
    let foodDelta = 0;
    let ironDelta = 0;
    let woodDelta = 0;
    let populationDelta = 0;
    let prosperityDelta = 0;

    for (const law of activeLaws) {
      const intensity = (law.intensity || 50) / 100;
      if (law.description.includes('Stability')) {
        const match = law.description.match(/([+-]0\.\d+)\s*Stability/);
        if (match) stabilityDelta += parseFloat(match[1]) * intensity;
      }
      if (law.description.includes('Mana')) {
        const match = law.description.match(/([+-]0\.\d+)\s*Mana/);
        if (match) manaDelta += parseFloat(match[1]) * intensity;
      }
      if (law.description.includes('Gold')) {
        const match = law.description.match(/([+-]\d+)\s*Gold/);
        if (match) goldDelta += parseInt(match[1]) * intensity;
      }
      if (law.description.includes('Food')) {
        const match = law.description.match(/([+-]\d+)\s*Food/);
        if (match) foodDelta += parseInt(match[1]) * intensity;
      }
      if (law.description.includes('Iron')) {
        const match = law.description.match(/([+-]\d+)\s*Iron/);
        if (match) ironDelta += parseInt(match[1]) * intensity;
      }
      if (law.description.includes('Wood')) {
        const match = law.description.match(/([+-]\d+)\s*Wood/);
        if (match) woodDelta += parseInt(match[1]) * intensity;
      }
      if (law.description.includes('Population')) {
        const match = law.description.match(/([+-]\d+)\s*Population/);
        if (match) populationDelta += parseInt(match[1]) * intensity;
      }
      if (law.description.includes('Prosperity')) {
        const match = law.description.match(/([+-]0\.\d+)\s*Prosperity/);
        if (match) prosperityDelta += parseFloat(match[1]) * intensity;
      }
    }
    
    // Prosperity also affected by stability
    if (gameState?.stability < 0.5) {
      prosperityDelta -= 0.01;
    } else if (gameState?.stability > 0.7) {
      prosperityDelta += 0.01;
    }

    // Calculate maintenance costs
    let maintenanceGold = 0;
    let maintenanceFood = 0;

    for (const building of buildings) {
      if (building.is_completed) {
        const stats = buildingStats.find(
          s => s.building_type_id === building.building_type_id && s.level === building.level
        );
        if (stats && stats.maintenance_cost) {
          maintenanceGold += stats.maintenance_cost.gold || 0;
          maintenanceFood += stats.maintenance_cost.food || 0;
        }
      }
    }

    const calculatedProjections = {
      ppRegen: totalPPRegen,
      ppBreakdown,
      stabilityDelta,
      manaDelta,
      prosperityDelta,
      goldDelta: Math.floor(goldDelta) - maintenanceGold,
      foodDelta: Math.floor(foodDelta) - maintenanceFood,
      ironDelta: Math.floor(ironDelta),
      woodDelta: Math.floor(woodDelta),
      populationDelta: Math.floor(populationDelta),
      maintenanceGold,
      maintenanceFood
    };

    setProjections(calculatedProjections);
    
    if (onProjectionsCalculated) {
      onProjectionsCalculated(calculatedProjections);
    }
  }, [gameState, councilMembers, factions, activeLaws, buildings, buildingStats, onProjectionsCalculated]);

  if (!projections) {
    return null;
  }

  return (
    <div className="rounded-xl p-4 space-y-4" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}>
      <h2 className="font-semibold text-sm" style={{ fontFamily: 'Cinzel', color: 'var(--color-gold-bright)' }}>End Turn Effects</h2>

      {/* PP Breakdown */}
      <div>
        <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-accent)' }}>Political Points Regeneration</h4>
        <div className="rounded-lg p-3 space-y-2" style={{ background: 'var(--color-bg-primary)', border: '1px solid rgba(142,68,173,0.3)' }}>
          <div className="flex justify-between items-center pb-2" style={{ borderBottom: '1px solid var(--color-border-default)' }}>
            <span className="text-xs" style={{ color: 'var(--color-text-accent)' }}>Base PP</span>
            <span className="font-bold text-sm" style={{ color: 'var(--color-success)' }}>+10</span>
          </div>
          {projections.ppBreakdown.length === 0 ? (
            <p className="text-xs italic py-1" style={{ color: 'var(--color-text-muted)' }}>No parliament seats allocated</p>
          ) : (
            projections.ppBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-1">
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{item.faction}</p>
                  <p className="text-[10px] opacity-70" style={{ color: 'var(--color-text-accent)' }}>
                    {(item.loyalty * 100).toFixed(0)}% • {item.seats} seats
                  </p>
                </div>
                <span className="text-xs font-bold" style={{ color: item.contribution > 0 ? 'var(--color-success)' : item.contribution < 0 ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
                  {item.contribution > 0 ? '+' : ''}{item.contribution.toFixed(1)}
                </span>
              </div>
            ))
          )}
          <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid var(--color-border-default)' }}>
            <span className="font-semibold text-sm" style={{ color: 'var(--color-gold-bright)' }}>Total</span>
            <span className="font-bold" style={{ color: projections.ppRegen > 0 ? 'var(--color-success)' : projections.ppRegen < 0 ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
              {projections.ppRegen > 0 ? '+' : ''}{projections.ppRegen} PP
            </span>
          </div>
        </div>
      </div>

      {/* Other Effects */}
      {(projections.stabilityDelta !== 0 || projections.manaDelta !== 0 || projections.maintenanceGold > 0 || projections.maintenanceFood > 0) && (
        <div>
          <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-accent)' }}>Other Changes</h4>
          <div className="space-y-2">
            {projections.stabilityDelta !== 0 && (
              <div className="flex justify-between items-center py-1.5 px-3 rounded" style={{ background: 'rgba(20,16,10,0.8)', border: '1px solid var(--color-border-default)' }}>
                <span className="text-xs" style={{ color: 'var(--color-text-primary)' }}>Stability (from laws)</span>
                <span className="text-xs font-bold" style={{ color: projections.stabilityDelta > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {projections.stabilityDelta > 0 ? '+' : ''}{(projections.stabilityDelta * 100).toFixed(1)}%
                </span>
              </div>
            )}
            {projections.manaDelta !== 0 && (
              <div className="flex justify-between items-center py-1.5 px-3 rounded" style={{ background: 'rgba(20,16,10,0.8)', border: '1px solid var(--color-border-default)' }}>
                <span className="text-xs" style={{ color: 'var(--color-text-primary)' }}>Mana (from laws)</span>
                <span className="text-xs font-bold" style={{ color: projections.manaDelta > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {projections.manaDelta > 0 ? '+' : ''}{(projections.manaDelta * 100).toFixed(1)}%
                </span>
              </div>
            )}
            {projections.maintenanceGold > 0 && (
              <div className="flex justify-between items-center py-1.5 px-3 rounded" style={{ background: 'rgba(20,16,10,0.8)', border: '1px solid var(--color-border-default)' }}>
                <span className="text-xs" style={{ color: 'var(--color-text-primary)' }}>💰 Building Maintenance</span>
                <span className="text-xs font-bold" style={{ color: 'var(--color-danger)' }}>-{projections.maintenanceGold}</span>
              </div>
            )}
            {projections.maintenanceFood > 0 && (
              <div className="flex justify-between items-center py-1.5 px-3 rounded" style={{ background: 'rgba(20,16,10,0.8)', border: '1px solid var(--color-border-default)' }}>
                <span className="text-xs" style={{ color: 'var(--color-text-primary)' }}>🍎 Building Maintenance</span>
                <span className="text-xs font-bold" style={{ color: 'var(--color-danger)' }}>-{projections.maintenanceFood}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-lg p-2.5" style={{ background: 'rgba(142,68,173,0.12)', border: '1px solid rgba(142,68,173,0.3)' }}>
        <p className="text-[10px] leading-relaxed" style={{ color: '#B06AD0' }}>
          💡 Factions with loyalty below 50% will reduce PP regeneration. Resource changes are shown in the top bar.
        </p>
      </div>
    </div>
  );
}