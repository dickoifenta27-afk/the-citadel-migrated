import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Info } from 'lucide-react';

export default function PPBreakdown({ gameState }) {
  const { data: councilMembers = [] } = useQuery({
    queryKey: ['councilMembers'],
    queryFn: async () => await base44.entities.CouncilMember.list()
  });

  const { data: factions = [] } = useQuery({
    queryKey: ['factions'],
    queryFn: async () => await base44.entities.FactionRegistry.list()
  });

  const basePP = 10;
  let totalFromFactions = 0;
  const breakdown = [];

  for (const councilMember of councilMembers) {
    const faction = factions.find(f => f.faction_name === councilMember.faction_name);
    if (faction && councilMember.seat_count > 0) {
      const contribution = (faction.loyalty - 0.5) * councilMember.seat_count;
      totalFromFactions += contribution;
      breakdown.push({
        faction: faction.faction_name,
        loyalty: faction.loyalty,
        seats: councilMember.seat_count,
        contribution: contribution
      });
    }
  }

  const totalPPRegen = Math.floor(basePP + totalFromFactions);

  return (
    <Card className="bg-[#141417] border-[#cd7f32]/50">
      <CardHeader>
        <CardTitle className="text-[#ffd700] font-serif flex items-center gap-2">
          <Info className="w-5 h-5" />
          Political Points Regeneration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-[#0a0a0c] rounded-lg p-4 border border-[#cd7f32]/30">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-[#cd7f32]/20">
            <span className="text-[#cd7f32] font-semibold">Base PP</span>
            <span className="text-green-400 font-bold">+{basePP}</span>
          </div>

          <div className="space-y-2">
            <h4 className="text-[#cd7f32] text-sm font-semibold mb-2">Faction Contributions:</h4>
            {breakdown.length === 0 ? (
              <p className="text-[#e0e0e0]/60 text-sm italic">No parliament seats allocated yet</p>
            ) : (
              breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 px-3 bg-[#1a1a1c] rounded border border-[#cd7f32]/20">
                  <div className="flex-1">
                    <p className="text-[#e0e0e0] font-semibold text-sm">{item.faction}</p>
                    <p className="text-[#cd7f32] text-xs">
                      Loyalty: {(item.loyalty * 100).toFixed(0)}% • Seats: {item.seats}
                    </p>
                  </div>
                  <span className={`font-bold ${item.contribution > 0 ? 'text-green-400' : item.contribution < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {item.contribution > 0 ? '+' : ''}{item.contribution.toFixed(1)}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#cd7f32]/30">
            <span className="text-[#ffd700] font-bold text-lg">Total Regeneration</span>
            <span className={`font-bold text-xl ${totalPPRegen > 0 ? 'text-green-400' : totalPPRegen < 0 ? 'text-red-400' : 'text-gray-400'}`}>
              {totalPPRegen > 0 ? '+' : ''}{totalPPRegen} PP/turn
            </span>
          </div>
        </div>

        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
          <p className="text-purple-300 text-xs leading-relaxed">
            <strong>Tips:</strong> Loyalitas faksi di bawah 50% akan mengurangi regenerasi PP Anda. 
            Jaga hubungan baik dengan faksi yang memiliki banyak kursi di parlemen untuk memaksimalkan political capital.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}