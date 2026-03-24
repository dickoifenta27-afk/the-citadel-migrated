import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function LawCard({ law }) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: async (isActive) => {
      return await base44.entities.LawLibrary.update(law.id, {
        is_active: isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laws'] });
    },
  });

  const handleToggle = () => {
    toggleMutation.mutate(!law.is_active);
  };

  return (
    <Card className={`bg-[#141417] border transition-all overflow-hidden ${
      law.is_active 
        ? 'border-[#008080] shadow-lg shadow-[#008080]/30' 
        : 'border-[#cd7f32]/50 hover:border-[#cd7f32]'
    }`}>
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-[#0a0a0c]">
        {law.image_url ? (
          <img 
            src={law.image_url} 
            alt={law.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl text-[#cd7f32]/30">⚖️</div>
          </div>
        )}
        
        {/* Active Badge */}
        {law.is_active && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-[#008080] text-white border border-white/50 shadow-lg">
            ✓ Active
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3">
        <h3 className="text-lg font-bold text-[#ffd700] font-serif">{law.name}</h3>
        <p className="text-[#e0e0e0] text-sm line-clamp-2">{law.description}</p>
        
        <Button
          onClick={handleToggle}
          disabled={toggleMutation.isPending}
          className={`w-full font-semibold ${
            law.is_active
              ? 'bg-[#8b0000] hover:bg-[#a00000] text-white'
              : 'premium-button'
          }`}
        >
          {toggleMutation.isPending ? 'Processing...' : (law.is_active ? 'Deactivate' : 'Activate')}
        </Button>
      </CardContent>
    </Card>
  );
}