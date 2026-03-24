import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProsperityEditor() {
  const queryClient = useQueryClient();
  const [prosperity, setProsperity] = useState(0.5);
  const [corruptionReduction, setCorruptionReduction] = useState(0);

  const { data: userState } = useQuery({
    queryKey: ['userState'],
    queryFn: async () => {
      const states = await base44.entities.UserState.list();
      return states[0];
    }
  });

  const updateStateMutation = useMutation({
    mutationFn: async (updates) => {
      await base44.entities.UserState.update(userState.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userState'] });
    }
  });

  const handleSetProsperity = () => {
    updateStateMutation.mutate({ prosperity: parseFloat(prosperity) });
  };

  const handleSetCorruptionReduction = () => {
    updateStateMutation.mutate({ corruption_reduction: parseFloat(corruptionReduction) });
  };

  if (!userState) return <div className="text-[#e0e0e0]">Loading...</div>;

  return (
    <div className="space-y-6">
      <Card className="bg-[#141417] border-orange-600/50">
        <CardHeader>
          <CardTitle className="text-orange-400">💰 Prosperity & Tax System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-[#ffd700] text-lg font-semibold mb-3">Current Values</h3>
            <div className="grid grid-cols-2 gap-4 bg-[#0a0a0c] p-4 rounded-lg border border-[#cd7f32]/30">
              <div>
                <p className="text-[#cd7f32] text-sm">Prosperity</p>
                <p className="text-[#ffd700] text-2xl font-bold">{((userState.prosperity || 0.5) * 100).toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-[#cd7f32] text-sm">Corruption Reduction</p>
                <p className="text-[#ffd700] text-2xl font-bold">{((userState.corruption_reduction || 0) * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[#ffd700] text-lg font-semibold mb-3">Tax Formula</h3>
            <div className="bg-[#0a0a0c] p-4 rounded-lg border border-[#cd7f32]/30 space-y-2 text-sm">
              <p className="text-[#e0e0e0]">
                <strong className="text-[#ffd700]">Base Tax Rate:</strong> 0.5 per population
              </p>
              <p className="text-[#e0e0e0]">
                <strong className="text-[#ffd700]">Prosperity Bonus:</strong> Prosperity × 0.5
              </p>
              <p className="text-[#e0e0e0]">
                <strong className="text-[#ffd700]">Effective Rate:</strong> Base (0.5) + Prosperity Bonus
              </p>
              <p className="text-green-400">
                <strong className="text-[#ffd700]">Raw Gold:</strong> Population × Effective Rate
              </p>
              <p className="text-red-400">
                <strong className="text-[#ffd700]">Corruption:</strong> 5% per 10k population (max 40%)
              </p>
              <p className="text-purple-400">
                <strong className="text-[#ffd700]">Final Income:</strong> Raw Gold × (1 - Corruption × (1 - Reduction))
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-[#ffd700] text-lg font-semibold mb-3">Set Prosperity</h3>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={prosperity}
                onChange={(e) => setProsperity(e.target.value)}
                className="bg-[#0a0a0c] border-[#cd7f32]/50 text-[#e0e0e0]"
              />
              <Button onClick={handleSetProsperity} className="bg-orange-600 hover:bg-orange-700">
                Set Prosperity
              </Button>
            </div>
            <p className="text-[#cd7f32] text-xs mt-1">Value: 0.0 to 1.0 (higher = better tax efficiency)</p>
          </div>

          <div>
            <h3 className="text-[#ffd700] text-lg font-semibold mb-3">Set Corruption Reduction</h3>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={corruptionReduction}
                onChange={(e) => setCorruptionReduction(e.target.value)}
                className="bg-[#0a0a0c] border-[#cd7f32]/50 text-[#e0e0e0]"
              />
              <Button onClick={handleSetCorruptionReduction} className="bg-orange-600 hover:bg-orange-700">
                Set Reduction
              </Button>
            </div>
            <p className="text-[#cd7f32] text-xs mt-1">Value: 0.0 to 1.0 (% reduction in corruption penalty)</p>
          </div>

          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
            <p className="text-purple-300 text-sm">
              💡 <strong>How to Use:</strong> Create laws and technologies that grant "+0.05 Prosperity" or "+0.1 Corruption Reduction" 
              to improve tax efficiency and reduce corruption penalties over time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}