import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function ElectionCycleEditor() {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [cycleLength, setCycleLength] = useState(10);

  const { data: electionCycle } = useQuery({
    queryKey: ['electionCycle'],
    queryFn: async () => {
      const cycles = await base44.entities.ElectionCycle.list();
      return cycles[0] || { cycle_length: 10, last_election_turn: 0 };
    },
    onSuccess: (data) => {
      setCycleLength(data.cycle_length);
    }
  });

  const handleSave = async () => {
    setIsSaving(true);

    try {
      if (electionCycle) {
        await base44.entities.ElectionCycle.update(electionCycle.id, {
          cycle_length: cycleLength,
          last_election_turn: electionCycle.last_election_turn
        });
      }

      queryClient.invalidateQueries({ queryKey: ['electionCycle'] });
      alert('Election cycle updated!');
    } catch (error) {
      console.error('Error saving election cycle:', error);
      alert('Failed to save election cycle');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-[#1a1a1c] border-2 border-orange-600">
      <CardHeader className="border-b border-orange-600">
        <CardTitle className="text-orange-400">Election Cycle Editor</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <label className="text-[#CD7F32] text-sm font-medium block mb-3">
              Election Cycle Length: <span className="text-orange-400 font-bold">{cycleLength} turns</span>
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={cycleLength}
              onChange={(e) => setCycleLength(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-[#CD7F32] text-xs mt-2">
              Seats will be redistributed based on faction loyalty every {cycleLength} turns.
            </p>
          </div>

          {electionCycle && (
            <div className="bg-[#101012] border border-orange-600/30 rounded p-3">
              <p className="text-[#CD7F32] text-xs">
                Last redistribution: Turn {electionCycle.last_election_turn}
              </p>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Election Cycle'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}