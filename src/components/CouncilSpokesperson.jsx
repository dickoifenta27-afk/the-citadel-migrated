import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CouncilSpokesperson() {
  const { data: councilMembers = [] } = useQuery({
    queryKey: ['councilMembers'],
    queryFn: async () => {
      return await base44.entities.CouncilMember.list();
    }
  });

  const factionBgColors = {
    'Gilded Council': 'bg-amber-900/20 border-amber-600',
    'Iron Vanguard': 'bg-red-900/30 border-red-600',
    'Common Folk': 'bg-yellow-900/30 border-yellow-600',
    'Archive': 'bg-purple-900/30 border-purple-600'
  };

  const factionTextColors = {
    'Gilded Council': 'text-amber-400',
    'Iron Vanguard': 'text-red-400',
    'Common Folk': 'text-yellow-400',
    'Archive': 'text-purple-400'
  };

  return (
    <div className="space-y-4">
      <h3 className="text-[#FFF8DC] font-semibold text-lg">Council Spokespersons</h3>
      <div className="space-y-3">
        {councilMembers.map(member => (
          <Card
            key={member.id}
            className={`bg-[#101012] border-2 ${factionBgColors[member.faction_name] || 'border-[#CD7F32]'}`}
          >
            <CardContent className="pt-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className={`font-bold text-lg ${factionTextColors[member.faction_name] || 'text-[#FFF8DC]'}`}>
                    {member.spokesperson_name}
                  </p>
                  <p className="text-[#CD7F32] text-xs">{member.faction_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#C9A84C] font-bold">★ {member.favor_points}</p>
                  <p className="text-[#CD7F32] text-xs">Favor Points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}