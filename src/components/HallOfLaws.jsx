import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import ActivationWarningModal from './ActivationWarningModal';

const categoryIcons = {
  Education: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/3ec932d07_icon_education_final.png',
  Military: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/ad30333c8_stability.png',
  Welfare: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/b0f72dbe5_icon_welfare_final.png',
  Trade: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/0150770f7_icon_trade_final.png',
  Economy: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/120da579d_gold.png',
  Environment: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/a61f3d29a_icon_env_final.png',
  Magic: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/7efcb30af_mana.png',
  Population: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/f77789096_population.png'
};

export default function HallOfLaws() {
  const [selectedCategory, setSelectedCategory] = useState('Education');
  const [selectedLaw, setSelectedLaw] = useState(null);
  const [error, setError] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const queryClient = useQueryClient();

  const { data: laws = [], isLoading } = useQuery({
    queryKey: ['laws'],
    queryFn: async () => {
      return await base44.entities.LawLibrary.list();
    },
    staleTime: 30000
  });

  const { data: gameState } = useQuery({
    queryKey: ['userState'],
    queryFn: async () => {
      const states = await base44.entities.UserState.list();
      return states[0];
    },
    staleTime: 30000
  });

  const { data: factions = [] } = useQuery({
    queryKey: ['factions'],
    queryFn: async () => await base44.entities.FactionRegistry.list(),
    staleTime: 30000
  });

  const { data: councilMembers = [] } = useQuery({
    queryKey: ['councilMembers'],
    queryFn: async () => await base44.entities.CouncilMember.list(),
    staleTime: 30000
  });

  const toggleMutation = useMutation({
    mutationFn: async (isActive) => {
      // Check PP cost when activating
      if (isActive) {
        const ppCost = selectedLaw.pp_cost ?? 15;
        if ((gameState?.political_points || 0) < ppCost) {
          throw new Error(`Insufficient Political Points. Required: ${ppCost} PP`);
        }

        // Deduct PP
        await base44.entities.UserState.update(gameState.id, {
          political_points: gameState.political_points - ppCost
        });
      }

      return await base44.entities.LawLibrary.update(selectedLaw.id, {
        is_active: isActive
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laws'] });
      queryClient.invalidateQueries({ queryKey: ['userState'] });
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  if (isLoading) {
    return <div className="text-slate-300">Loading laws...</div>;
  }

  const categories = Object.keys(categoryIcons);
  const filteredLaws = laws.filter((law) => law.category === selectedCategory);

  const parseEffects = (description) => {
    if (!description.includes('Effects:')) return null;
    const effectStr = description.split('Effects:')[1]?.trim();
    if (!effectStr) return null;

    const effectLines = effectStr.split('Effects per turn:')[1]?.split(',').map((e) => e.trim());
    return effectLines || [];
  };

  const handleToggle = () => {
    // Show warning only when activating
    if (!selectedLaw.is_active) {
      setShowWarning(true);
    } else {
      toggleMutation.mutate(false);
    }
  };

  const confirmActivation = () => {
    setShowWarning(false);
    toggleMutation.mutate(true);
  };

  return (
    <div>
      {showWarning &&
      <ActivationWarningModal
        law={selectedLaw}
        factions={factions}
        councilMembers={councilMembers}
        onConfirm={confirmActivation}
        onCancel={() => setShowWarning(false)} />

      }
      
      
      
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
        {/* Panel 1: Categories */}
        <div className="col-span-3">
          <Card className="border-[#cd7f32]/50 h-full overflow-hidden !bg-transparent" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
            <CardContent className="p-0">
              <div className="p-4 border-b border-[#cd7f32]/30">
                <h3 className="text-[#ffd700] font-serif font-semibold">Categories</h3>
              </div>
              <div className="space-y-1 p-2">
                {categories.map((category) => {
                  const iconUrl = categoryIcons[category];
                  const categoryLaws = laws.filter((l) => l.category === category);
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setSelectedLaw(null);
                      }}
                      className={`w-full text-left px-3 py-3 rounded-lg transition-all flex items-center gap-3 ${
                      selectedCategory === category ?
                      'bg-[#B8860B] text-[#1a1000] shadow-lg' :
                      'bg-black/40 text-[#cd7f32] hover:bg-black/60 hover:text-[#ffd700]'}`
                      }>

                      <img src={iconUrl} alt={category} style={{ width: 44, height: 44, objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }} />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{category}</div>
                        <div className="text-xs opacity-70">{categoryLaws.length} laws</div>
                      </div>
                    </button>);

                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel 2: Laws List */}
        <div className="col-span-4">
          <Card className="border-[#cd7f32]/50 h-full overflow-hidden flex flex-col !bg-transparent" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="p-4 border-b border-[#cd7f32]/30">
                <h3 className="text-[#ffd700] font-serif font-semibold">{selectedCategory} Laws</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {filteredLaws.length === 0 ?
                <div className="text-center py-12 text-[#cd7f32]">
                    No laws in this category
                  </div> :

                filteredLaws.map((law) =>
                <button
                  key={law.id}
                  onClick={() => setSelectedLaw(law)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedLaw?.id === law.id ?
                  'bg-[#B8860B]/20 border-[#B8860B] shadow-lg shadow-[#B8860B]/20' :
                  law.is_active ?
                  'bg-black/40 border-green-500/70 hover:border-green-400' :
                  'bg-black/40 border-[#333]/60 hover:border-[#555]'}`
                  }>
                  
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-[#1a1a1c]">
                          {law.image_url ?
                      <img src={law.image_url} alt={law.name} className="w-full h-full object-cover" /> :

                      <div className="w-full h-full flex items-center justify-center text-xl">⚖️</div>
                      }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-semibold text-[#e0e0e0] text-sm truncate">{law.name}</h4>
                            {law.is_active &&
                              <span className="flex-shrink-0 px-2 py-0.5 bg-[#B8860B] text-[#1a1000] text-xs rounded-full font-bold">Active</span>
                            }
                          </div>
                          {!law.is_active &&
                            <p className="text-[#cd7f32]/70 text-xs mt-0.5">Cost: {law.pp_cost ?? 15} PP</p>
                          }
                        </div>
                      </div>
                    </button>
                )
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel 3: Law Detail */}
        <div className="col-span-5">
          <Card className="border-[#cd7f32]/50 h-full overflow-hidden flex flex-col !bg-transparent" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="p-4 border-b border-[#cd7f32]/30">
                <h3 className="text-[#ffd700] font-serif font-semibold">Law Details</h3>
              </div>
              
              {!selectedLaw ?
              <div className="flex-1 flex items-center justify-center">
                  <p className="text-[#cd7f32]">Select a law to view details</p>
                </div> :

              <div className="flex-1 overflow-y-auto">
                  {/* Compact header with small image */}
                  <div className="p-4 flex items-start gap-4 border-b border-[#cd7f32]/20 bg-black/30">
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-[#0a0a0c]">
                      {selectedLaw.image_url ?
                    <img src={selectedLaw.image_url} alt={selectedLaw.name} className="w-full h-full object-cover" /> :
                    <div className="w-full h-full flex items-center justify-center text-3xl">⚖️</div>
                    }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-lg font-bold text-[#ffd700] font-serif leading-tight">{selectedLaw.name}</h3>
                        <div className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold border ${
                      selectedLaw.is_active ?
                      'bg-[#B8860B] text-[#1a1000] border-[#C9A84C]/50' :
                      'bg-[#2a2a2c] text-[#888] border-[#555]/50'}`
                      }>
                          {selectedLaw.is_active ? '✓ Active' : '✗ Inactive'}
                        </div>
                      </div>
                      <div className="inline-block px-2 py-0.5 bg-black/40 border border-[#cd7f32]/50 rounded-full text-xs text-[#cd7f32]">
                        {selectedLaw.category}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    













                  

                    <div className="bg-black/30 rounded-lg p-3 border border-[#cd7f32]/20">
                      <h4 className="text-[#cd7f32] font-semibold text-xs uppercase tracking-wide mb-1">Description</h4>
                      <p className="text-[#e0e0e0] text-xs leading-relaxed">
                        {selectedLaw.description.split('\n\nEffects:')[0]}
                      </p>
                    </div>

                    {parseEffects(selectedLaw.description) &&
                  <div className="bg-black/30 rounded-lg p-3 border border-[#cd7f32]/20">
                        <h4 className="text-[#cd7f32] font-semibold text-xs uppercase tracking-wide mb-1">Effects Per Turn</h4>
                        <div className="space-y-1">
                          {parseEffects(selectedLaw.description).map((effect, idx) =>
                      <div key={idx} className="flex items-center gap-2 text-xs text-[#e0e0e0]">
                               <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full flex-shrink-0"></span>
                              {effect}
                            </div>
                      )}
                        </div>
                      </div>
                  }

                    <div className="bg-black/30 rounded-lg p-3 border border-[#cd7f32]/20">
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-[#cd7f32] font-semibold text-xs uppercase tracking-wide">Intensity</h4>
                        <span className="text-[#ffd700] font-bold text-xs">{selectedLaw.intensity}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-black/40 rounded-full h-2 border border-[#cd7f32]/30">
                          <div
                          className="bg-gradient-to-r from-[#B8860B] to-[#C9A84C] h-full rounded-full transition-all"
                          style={{ width: `${selectedLaw.intensity}%` }} />
                        </div>
                      </div>
                    </div>

                    {selectedLaw.faction_stances && Object.keys(selectedLaw.faction_stances).length > 0 &&
                  <div className="bg-black/30 rounded-lg p-3 border border-[#cd7f32]/20">
                        <h4 className="text-[#cd7f32] font-semibold text-xs uppercase tracking-wide mb-2">Faction Positions</h4>
                        <div className="space-y-1">
                           {Object.entries(selectedLaw.faction_stances).map(([factionName, multiplier]) => {
                        const council = councilMembers.find((c) => c.faction_name === factionName);
                        return (
                          <div key={factionName} className="flex items-center justify-between py-1 px-2 bg-black/30 rounded">
                                <div className="flex items-center gap-2">
                                  {multiplier > 0 ?
                              <ThumbsUp className="w-3 h-3 text-green-400" /> :
                              <ThumbsDown className="w-3 h-3 text-red-400" />
                              }
                                  <span className="text-[#e0e0e0] text-xs font-semibold">{factionName}</span>
                                  {council &&
                              <span className="text-[#cd7f32] text-xs">({council.seat_count} seats)</span>
                              }
                                </div>
                                <span className={`text-xs font-bold ${multiplier > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {multiplier > 0 ? 'Supports' : 'Opposes'}
                                </span>
                              </div>);
                      })}
                        </div>
                      </div>
                  }

                    {/* Activation Button */}
                    <div className="pt-3 border-t border-[#cd7f32]/30 space-y-2">
                      {!selectedLaw.is_active &&
                    <div className="bg-black/40 border border-[#cd7f32]/30 rounded-lg px-3 py-2 flex items-center justify-between">
                          <span className="text-[#cd7f32] text-xs">Cost: <strong className="text-[#ffd700]">{selectedLaw.pp_cost ?? 15} PP</strong></span>
                          <span className="text-[#cd7f32] text-xs">Available: <strong className="text-[#ffd700]">{gameState?.political_points || 0} PP</strong></span>
                        </div>
                    }

                      {error &&
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                          <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    }

                      <Button
                      onClick={handleToggle}
                      disabled={toggleMutation.isPending || !selectedLaw.is_active && (gameState?.political_points || 0) < (selectedLaw.pp_cost ?? 15)}
                      className={`w-full font-bold text-lg py-6 ${
                      selectedLaw.is_active ?
                      'bg-[#8b0000] hover:bg-[#a00000] text-white' :
                      'bg-gradient-to-r from-[#B8860B] to-[#8B6508] hover:from-[#C9A84C] hover:to-[#B8860B] text-[#1a1000]'}`
                      }>
                        {toggleMutation.isPending ? 'Processing...' : selectedLaw.is_active ? 'Deactivate Law (Free)' : `Activate Law (${selectedLaw.pp_cost ?? 15} PP)`}
                      </Button>
                    </div>
                  </div>
                </div>
              }
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);

}