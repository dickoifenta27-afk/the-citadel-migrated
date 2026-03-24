import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sword } from 'lucide-react';

export default function RegionCard({ region, gameState, onConquered }) {
  const [isLaunching, setIsLaunching] = useState(false);
  const [expeditionResult, setExpeditionResult] = useState(null);

  const militaryReadiness = Math.min(1, gameState?.iron / 1000 || 0);
  const playerPower = (militaryReadiness + (gameState?.iron / 2000 || 0)) * 100;
  const regionDifficulty = region.difficulty * 50;
  const successChance = Math.min(0.95, Math.max(0.1, playerPower / (playerPower + regionDifficulty)));

  const canAfford = gameState && gameState.gold >= region.gold_cost && gameState.food >= region.food_cost;

  const handleLaunch = async () => {
    setIsLaunching(true);
    try {
      const response = await base44.functions.invoke('launchExpedition', { regionId: region.id });
      setExpeditionResult(response.data);
      if (response.data.success) {
        setTimeout(() => {
          onConquered?.();
          setExpeditionResult(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Error launching expedition:', error);
      alert('Failed to launch expedition');
    } finally {
      setIsLaunching(false);
    }
  };

  if (region.status === 'Conquered') {
    return (
      <Card className="border border-[#cd7f32] premium-hover-card" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="text-[#e0e0e0] font-bold text-lg font-serif">{region.name}</h3>
              <span className="text-[#ffd700] text-xs font-bold px-3 py-1 bg-[#8b6914]/50 rounded-full border border-[#ffd700]/50">
                ✓ CONQUERED
              </span>
            </div>
            
            <div className="text-[#cd7f32] text-xs space-y-1">
              <p className="text-[#e0e0e0] font-semibold mb-2">📍 Regional Bonuses/turn:</p>
              <p className="text-[#e0e0e0]">• Iron: <span className="text-[#ffd700] font-semibold">+{Math.floor(region.iron_richness * 100)}</span></p>
              <p className="text-[#e0e0e0]">• Food: <span className="text-[#ffd700] font-semibold">+{Math.floor(region.food_richness * 100)}</span></p>
              <p className="text-[#e0e0e0]">• Population: <span className="text-[#ffd700] font-semibold">+{region.population_capacity}</span></p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-[#cd7f32] premium-hover-card" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <h3 className="text-[#e0e0e0] font-bold text-lg font-serif">{region.name}</h3>
          
          <div className="text-[#cd7f32] text-xs space-y-1">
            <p className="text-[#e0e0e0] font-semibold mb-2">Conquest Rewards:</p>
            <p className="text-[#e0e0e0]">• Iron: <span className="text-[#ffd700]">+{Math.floor(region.iron_richness * 100)}/turn</span></p>
            <p className="text-[#e0e0e0]">• Food: <span className="text-[#ffd700]">+{Math.floor(region.food_richness * 100)}/turn</span></p>
            <p className="text-[#e0e0e0]">• Population: <span className="text-[#ffd700]">+{region.population_capacity}</span></p>
          </div>

          <div className="bg-black/40 border border-[#cd7f32]/40 rounded p-3 text-xs space-y-2">
            <p className="text-[#e0e0e0]">⚔️ Difficulty: <span className="text-[#ffd700] font-semibold">{region.difficulty.toFixed(1)}x</span></p>
            <p className="text-[#e0e0e0]">✓ Success: <span className={`${successChance > 0.5 ? 'text-[#C9A84C]' : 'text-[#ffd700]'} font-semibold`}>{(successChance * 100).toFixed(0)}%</span></p>
            <p className="text-[#e0e0e0]">💰 Cost: <span className="text-[#ffd700]">{region.gold_cost} Gold</span>, <span className="text-[#ffd700]">{region.food_cost} Food</span></p>
          </div>

          {expeditionResult && (
            <div className={`rounded p-2 text-xs ${
              expeditionResult.success
                ? 'bg-[#B8860B]/20 border border-[#B8860B] text-[#e0e0e0]'
                : 'bg-[#8b0000]/20 border border-[#8b0000] text-[#e0e0e0]'
            }`}>
              <p className="font-semibold mb-1">{expeditionResult.success ? '✓ Conquest Success!' : '✗ Expedition Failed'}</p>
              <p>{expeditionResult.message}</p>
            </div>
          )}

          <Button
            onClick={handleLaunch}
            disabled={isLaunching || !canAfford}
            className={`w-full font-bold transition-all ${
              canAfford
                ? 'bg-gradient-to-r from-[#B8860B] to-[#8B6508] hover:from-[#C9A84C] hover:to-[#B8860B] text-[#1a1000] shadow-lg shadow-[#B8860B]/20'
                : 'bg-[#2a2a2c] text-[#606060] cursor-not-allowed'
            }`}
          >
            {isLaunching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Launching...
              </>
            ) : (
              <>
                <Sword className="w-4 h-4 mr-2" />
                Launch Expedition
              </>
            )}
          </Button>

          {!canAfford && (
            <p className="text-[#8b0000] text-xs text-center font-semibold">
              ⚠️ Insufficient resources
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}