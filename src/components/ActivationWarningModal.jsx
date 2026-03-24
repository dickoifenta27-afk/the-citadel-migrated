import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function ActivationWarningModal({ law, factions, councilMembers, onConfirm, onCancel }) {
  if (!law || !law.faction_stances) return null;

  // Calculate impact
  const impactData = [];
  let totalPPImpact = 0;

  for (const [factionName, multiplier] of Object.entries(law.faction_stances)) {
    const faction = factions.find(f => f.faction_name === factionName);
    const council = councilMembers.find(c => c.faction_name === factionName);
    
    if (faction && council) {
      const ppContribution = (faction.loyalty - 0.5) * council.seat_count;
      const impactOnPP = ppContribution * multiplier * -0.5; // Negative because we're activating against their stance
      
      impactData.push({
        faction: factionName,
        seats: council.seat_count,
        loyalty: faction.loyalty,
        multiplier: multiplier,
        ppImpact: impactOnPP
      });
      
      totalPPImpact += impactOnPP;
    }
  }

  // Only show warning if significant negative impact
  const hasSignificantNegativeImpact = totalPPImpact < -2;

  if (!hasSignificantNegativeImpact) {
    onConfirm();
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
      <Card className="bg-[#141417] border-red-500/50 max-w-2xl w-full shadow-2xl shadow-red-500/20">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-400 font-serif">Political Warning</h3>
              <p className="text-red-300/70 text-sm">Activating this law may have consequences</p>
            </div>
          </div>

          <div className="bg-[#0a0a0c] rounded-lg p-4 border border-red-500/30">
            <p className="text-[#e0e0e0] text-sm mb-3">
              Activating <strong className="text-[#ffd700]">{law.name}</strong> will affect your Political Points regeneration:
            </p>

            <div className="space-y-2 mb-3">
              {impactData
                .filter(d => d.ppImpact !== 0)
                .sort((a, b) => a.ppImpact - b.ppImpact)
                .map((data, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 px-3 bg-[#141417] rounded border border-[#cd7f32]/20">
                    <div className="flex items-center gap-2">
                      {data.multiplier < 0 ? (
                        <ThumbsDown className="w-4 h-4 text-red-400" />
                      ) : (
                        <ThumbsUp className="w-4 h-4 text-green-400" />
                      )}
                      <span className="text-[#e0e0e0] text-sm font-semibold">{data.faction}</span>
                      <span className="text-[#cd7f32] text-xs">({data.seats} seats)</span>
                    </div>
                    <span className={`text-sm font-bold ${data.ppImpact < 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {data.ppImpact > 0 ? '+' : ''}{data.ppImpact.toFixed(1)} PP/turn
                    </span>
                  </div>
                ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-red-500/30">
              <span className="text-red-300 font-semibold">Total Impact on PP Regeneration:</span>
              <span className="text-red-400 text-lg font-bold">{totalPPImpact.toFixed(1)} PP/turn</span>
            </div>
          </div>

          <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-3">
            <p className="text-amber-300 text-xs leading-relaxed">
              💡 Factions with low loyalty and high seats will reduce your PP regeneration. Consider improving faction relations before activating controversial laws.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-[#cd7f32]/50 text-[#cd7f32] hover:bg-[#cd7f32]/10"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              Activate Anyway
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}