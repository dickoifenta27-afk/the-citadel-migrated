import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import ParticleOverlay from '@/components/ParticleOverlay';
import ResourceBar from '@/components/ResourceBar';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getPageBackground } from '@/lib/assets';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const backgroundImage = getPageBackground(location.pathname);
  const isCitadel = location.pathname === '/Citadel' || location.pathname === '/';

  // Default game state for dev mode (when database is empty)
  const DEFAULT_GAME_STATE = {
    gold: 500,
    food: 200,
    iron: 100,
    wood: 150,
    mana: 50,
    stability: 50,
    population: 1000,
    prosperity: 50,
    political_points: 3,
    corruption_reduction: 0,
    turn_count: 1,
  };

  const { data: gameState, refetch } = useQuery({
    queryKey: ['userState'],
    queryFn: async () => {
      try {
        const states = await base44.entities.UserState.list();
        return states[0] || DEFAULT_GAME_STATE;
      } catch (err) {
        console.warn('Failed to fetch user state, using default:', err);
        return DEFAULT_GAME_STATE;
      }
    },
    staleTime: 10000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const [projections, setProjections] = React.useState({});

  useEffect(() => {
    // Ensure page refresh defaults to Citadel if no gameState yet loaded
    if (!gameState && location.pathname !== '/Citadel') {
      navigate('/Citadel', { replace: true });
    }
  }, [gameState, location.pathname, navigate]);

  return (
    <div className="flex h-screen relative overflow-hidden vignette" style={{
      backgroundImage: `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.35)), url('${backgroundImage}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Global ambient particle overlay */}
      <ParticleOverlay />

      {/* Sidebar */}
      <div className="relative">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative" style={{ zIndex: 1 }}>
        {/* Resource Bar */}
        <ResourceBar gameState={gameState} projections={projections} />

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet context={{ gameState, refetch, onProjectionsUpdate: setProjections }} />
        </div>
      </div>
    </div>
  );
}