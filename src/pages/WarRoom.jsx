import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import RegionCard from '@/components/RegionCard';

export default function WarRoom() {
  const { gameState, refetch } = useOutletContext();
  const queryClient = useQueryClient();

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      return await base44.entities.Regions.list();
    },
    staleTime: 30000
  });

  const conqueredCount = regions.filter((r) => r.status === 'Conquered').length;
  const totalBonusPopulation = regions.
  filter((r) => r.status === 'Conquered').
  reduce((sum, r) => sum + r.population_capacity, 0);

  const handleConquered = () => {
    queryClient.invalidateQueries({ queryKey: ['regions'] });
    refetch?.();
  };

  return (
    <div className="relative min-h-screen" style={{
      backgroundImage: "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.60)), url('https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/dc4fc725c_generated_image.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="relative p-6" style={{ zIndex: 1 }}>
      






        

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border border-[#cd7f32] rounded-lg p-5 premium-hover-card" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
          <p className="text-[#cd7f32] text-xs font-semibold uppercase tracking-wider">Conquered Regions</p>
          <p className="text-[#ffd700] text-3xl font-bold mt-3">{conqueredCount}/{regions.length}</p>
        </div>
        <div className="border border-[#cd7f32] rounded-lg p-5 premium-hover-card" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
          <p className="text-[#cd7f32] text-xs font-semibold uppercase tracking-wider">Bonus Pop Capacity</p>
          <p className="text-[#ffd700] text-3xl font-bold mt-3">+{totalBonusPopulation}</p>
        </div>
        <div className="border border-[#cd7f32] rounded-lg p-5 premium-hover-card" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
          <p className="text-[#cd7f32] text-xs font-semibold uppercase tracking-wider">Military Readiness</p>
          <p className="text-[#ffd700] text-3xl font-bold mt-3">{Math.min(100, Math.floor((gameState?.iron || 0) / 10))}%</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#e0e0e0] font-serif">Available Regions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regions.map((region) =>
            <RegionCard
              key={region.id}
              region={region}
              gameState={gameState}
              onConquered={handleConquered} />

            )}
        </div>
      </div>
      </div>
    </div>);

}