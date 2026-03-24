import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ActiveMission({ gameState }) {
  const { data: scenario } = useQuery({
    queryKey: ['activeScenario'],
    queryFn: async () => {
      const scenarios = await base44.entities.ScenarioMaster.list();
      return scenarios.find(s => s.is_active) || null;
    }
  });

  if (!scenario) {
    return (
      <Card className="bg-[#101012] border border-[#CD7F32] backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-[#FFF8DC]">Active Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#CD7F32] text-sm">No active scenario selected</p>
        </CardContent>
      </Card>
    );
  }

  const turnProgress = ((gameState?.turn_count || 0) / scenario.target_turn) * 100;
  const stabilityProgress = (gameState?.stability || 0) * 100;

  return (
    <Card className="bg-[#101012] border border-[#CD7F32] backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-teal-400">📋 Active Mission: {scenario.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-[#FFF8DC] text-sm">{scenario.objective_desc}</p>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-[#CD7F32] text-xs font-medium">TURN PROGRESS</span>
            <span className="text-[#008080] font-semibold text-xs">{gameState?.turn_count} / {scenario.target_turn}</span>
          </div>
          <div className="w-full bg-[#1a1a1c] rounded-full h-2 border border-[#CD7F32]">
            <div 
              className="bg-gradient-to-r from-[#008080] to-[#00a6a6] h-2 rounded-full transition-all" 
              style={{ width: `${Math.min(turnProgress, 100)}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-[#CD7F32] text-xs font-medium">STABILITY REQUIRED</span>
            <span className={`font-semibold text-xs ${stabilityProgress >= scenario.target_stability * 100 ? 'text-green-400' : 'text-red-400'}`}>
              {stabilityProgress.toFixed(1)}% / {scenario.target_stability.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-[#1a1a1c] rounded-full h-2 border border-[#CD7F32]">
            <div 
              className={`h-2 rounded-full transition-all ${
                stabilityProgress >= scenario.target_stability * 100
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : 'bg-gradient-to-r from-red-500 to-red-600'
              }`}
              style={{ width: `${Math.min(stabilityProgress, 100)}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}