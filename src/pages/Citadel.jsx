import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import KingdomStatus from '@/components/KingdomStatus';
import ScenarioInfo from '@/components/ScenarioInfo';
import EventInbox from '@/components/EventInbox';
import VisualNovelScene from '@/components/VisualNovelScene';
import EventModal from '@/components/EventModal';
import GameOverModal from '@/components/GameOverModal';
import VictoryModal from '@/components/VictoryModal';
import CouncilRequestModal from '@/components/CouncilRequestModal';

import RoyalCodex from '@/components/RoyalCodex';

export default function Citadel() {
  const { gameState, refetch, onProjectionsUpdate } = useOutletContext();
  
  // Debug logging
  console.log('Citadel - gameState:', gameState);
  console.log('Citadel - gameState type:', typeof gameState);
  
  const [localProjections, setLocalProjections] = useState({});
  const [activeEvent, setActiveEvent] = useState(null);
  const [activeCouncilRequest, setActiveCouncilRequest] = useState(null);
  const [gameOverReason, setGameOverReason] = useState(null);
  const [isVictory, setIsVictory] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const handleProjectionsUpdate = useCallback((projections) => {
    setLocalProjections(projections);
  }, []);

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.EventMaster.list(),
    staleTime: 30000,
  });

  const { data: factions = [] } = useQuery({
    queryKey: ['factions'],
    queryFn: () => base44.entities.FactionRegistry.list(),
    staleTime: 30000,
  });

  const { data: activeScenario } = useQuery({
    queryKey: ['activeScenario'],
    queryFn: async () => {
      const scenarios = await base44.entities.ScenarioMaster.list();
      return scenarios.find(s => s.is_active) || null;
    },
    staleTime: 60000,
  });

  const { data: pendingEvents = [] } = useQuery({
    queryKey: ['activeEvents'],
    queryFn: async () => await base44.entities.ActiveEvent.filter({ is_read: false }),
    staleTime: 5000
  });

  // Check for game over / victory
  useEffect(() => {
    if (!gameState || !activeScenario) return;

    if (gameState.stability <= 0) {
      setGameOverReason('stability');
    } else if (gameState.population <= 0) {
      setGameOverReason('population');
    } else if (
      gameState.turn_count >= activeScenario.target_turn &&
      gameState.stability >= activeScenario.target_stability
    ) {
      setIsVictory(true);
    }
  }, [gameState, activeScenario]);

  // Event triggering is handled by backend endTurn function
  // Frontend only displays events that backend indicates have been triggered

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: 'rgba(10,8,5,0.9)' }}>
        <div className="text-[#C9A84C] text-xl">Loading game state...</div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.60))',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RoyalCodex />
          <EventInbox onSelectEvent={setSelectedEventId} />
        </div>

        <div className="space-y-6">
          <ScenarioInfo 
            gameState={gameState} 
            onTurnEnd={() => refetch()} 
            onCouncilRequest={setActiveCouncilRequest}
            onProjectionsUpdate={handleProjectionsUpdate}
            pendingEventCount={pendingEvents.length}
          />
        </div>
      </div>

      {activeEvent && (
        <EventModal
          event={activeEvent}
          gameState={gameState}
          factions={factions}
          onClose={() => setActiveEvent(null)}
          onResolve={() => refetch()}
        />
      )}

      {activeCouncilRequest && (
        <CouncilRequestModal
          request={activeCouncilRequest}
          onClose={() => setActiveCouncilRequest(null)}
          onResolve={() => refetch()}
        />
      )}

      {gameOverReason && (
        <GameOverModal gameState={gameState} reason={gameOverReason} />
      )}

      {isVictory && (
        <VictoryModal gameState={gameState} scenario={activeScenario} />
      )}

      {selectedEventId && gameState && (
        <VisualNovelScene
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
          gameState={gameState}
        />
      )}
    </div>
  );
}