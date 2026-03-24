import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, TrendingUp, Loader2 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export default function Infrastructure() {
  const { gameState, refetch } = useOutletContext();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('population');

  const { data: buildingTypes = [] } = useQuery({
    queryKey: ['buildingTypes'],
    queryFn: async () => await base44.entities.BuildingTypes.list()
  });

  const { data: buildings = [] } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => await base44.entities.Buildings.list()
  });

  const { data: buildingStats = [] } = useQuery({
    queryKey: ['buildingStats'],
    queryFn: async () => await base44.entities.BuildingStats.list()
  });

  const buildMutation = useMutation({
    mutationFn: async (typeId) => {
      const type = buildingTypes.find((t) => t.id === typeId);
      await base44.entities.Buildings.create({
        building_type_id: type.building_type_id,
        level: 1,
        current_experience: 0,
        is_completed: true
      });

      await base44.entities.UserState.update(gameState.id, {
        ...gameState,
        gold: gameState.gold - type.base_cost_gold,
        food: gameState.food - type.base_cost_food
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      refetch();
    }
  });

  const upgradeMutation = useMutation({
    mutationFn: async ({ buildingId, typeId, currentLevel }) => {
      const type = buildingTypes.find((t) => t.id === typeId);
      const costMultiplier = currentLevel;
      const upgradeCost = type.base_cost_gold * costMultiplier;

      await base44.entities.Buildings.update(buildingId, {
        level: currentLevel + 1,
        current_experience: 0
      });

      await base44.entities.UserState.update(gameState.id, {
        ...gameState,
        gold: gameState.gold - upgradeCost
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      refetch();
    }
  });

  const categories = ['population', 'resources', 'military', 'utility'];

  const getBuilding = (typeId) => {
    return buildings.find((b) => b.building_type_id === typeId);
  };

  const getStats = (typeId, level) => {
    return buildingStats.find((s) => s.building_type_id === typeId && s.level === level);
  };

  const canBuild = (type) => {
    const existing = getBuilding(type.building_type_id);
    if (existing) return false;
    return gameState.gold >= type.base_cost_gold && gameState.food >= type.base_cost_food;
  };

  const canUpgrade = (building, type) => {
    if (building.level >= type.max_level) return false;
    const upgradeCost = type.base_cost_gold * building.level;
    return gameState.gold >= upgradeCost;
  };

  return (
    <div className="relative min-h-screen" style={{
      backgroundImage: "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.60)), url('https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/24194bdf0_generated_image.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="relative p-6" style={{ zIndex: 1 }}>
      






        

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[#cd7f32]/30 pb-2">
        {categories.map((category) => {
            const categoryBuildings = buildingTypes.filter((t) => t.category === category);
            const builtCount = categoryBuildings.filter((type) => getBuilding(type.building_type_id)).length;

            return (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`px-4 py-2 rounded-t-lg font-semibold capitalize transition-all ${
                activeTab === category ?
                'bg-[#B8860B] text-[#1a1000] shadow-lg' :
                'bg-[#141417] text-[#cd7f32] hover:bg-[#1a1a1c] border border-[#cd7f32]/30'}`
                }>
                
              {category} {builtCount > 0 && `(${builtCount}/${categoryBuildings.length})`}
            </button>);

          })}
      </div>

      {categories.filter((c) => c === activeTab).map((category) => {
          const categoryBuildings = buildingTypes.filter((t) => t.category === category);
          if (categoryBuildings.length === 0) return null;

          return (
            <div key={category}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryBuildings.map((type) => {
                  const building = getBuilding(type.building_type_id);
                  const stats = building ? getStats(type.building_type_id, building.level) : getStats(type.building_type_id, 1);
                  const isBuilt = !!building;
                  const canBuildThis = canBuild(type);
                  const canUpgradeThis = building && canUpgrade(building, type);

                  return (
                    <Card key={type.id} style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }} className={`border-2 ${
                    isBuilt ?
                    'border-[#B8860B] shadow-lg shadow-[#B8860B]/20' :
                    'border-[#cd7f32]/50 hover:border-[#cd7f32]'} transition-all`
                    }>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-[#ffd700] text-lg mb-1">{type.name}</CardTitle>
                          {isBuilt &&
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[#B8860B] text-[#1a1000] font-bold">
                                Level {building.level}
                              </span>
                              {building.level >= type.max_level &&
                              <span className="text-xs text-green-400">MAX</span>
                              }
                            </div>
                            }
                        </div>
                        
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-[#e0e0e0] text-sm">{type.description}</p>

                      {/* Build Cost */}
                      {!isBuilt &&
                        <div className="bg-black/40 rounded-lg p-3 border border-[#cd7f32]/30 space-y-1">
                          <p className="text-[#cd7f32] text-xs font-semibold mb-1">Build Cost:</p>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#e0e0e0]">Gold:</span>
                            <span className="text-[#ffd700] font-semibold">{type.base_cost_gold}</span>
                          </div>
                          {type.base_cost_food > 0 &&
                          <div className="flex justify-between text-xs">
                              <span className="text-[#e0e0e0]">Food:</span>
                              <span className="text-[#ffd700] font-semibold">{type.base_cost_food}</span>
                            </div>
                          }
                        </div>
                        }

                      {/* Upgrade Cost */}
                      {isBuilt && building.level < type.max_level &&
                        <div className="bg-black/40 rounded-lg p-3 border border-[#cd7f32]/30">
                          <p className="text-[#cd7f32] text-xs font-semibold mb-1">Upgrade to Level {building.level + 1}:</p>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#e0e0e0]">Cost:</span>
                            <span className="text-[#ffd700] font-semibold">{type.base_cost_gold * building.level} Gold</span>
                          </div>
                        </div>
                        }

                      {/* Current Stats */}
                      {stats &&
                        <div className="bg-[#B8860B]/10 rounded-lg p-3 border border-[#B8860B]/30">
                          <p className="text-[#C9A84C] text-xs font-semibold mb-2">
                            {isBuilt ? 'Current Benefits:' : 'Level 1 Benefits:'}
                          </p>
                          <div className="space-y-1">
                            {stats.population_capacity_bonus > 0 &&
                            <div className="text-xs text-[#e0e0e0]">
                                Population: <span className="text-[#ffd700]">+{stats.population_capacity_bonus}</span>
                              </div>
                            }
                            {stats.stability_bonus > 0 &&
                            <div className="text-xs text-[#e0e0e0]">
                                Stability: <span className="text-[#ffd700]">+{(stats.stability_bonus * 100).toFixed(1)}%</span>
                              </div>
                            }
                            {stats.resource_bonus && Object.entries(stats.resource_bonus).map(([res, val]) =>
                            val > 0 &&
                            <div key={res} className="text-xs text-[#e0e0e0] capitalize">
                                  {res}/turn: <span className="text-[#ffd700]">+{val}</span>
                                </div>

                            )}
                          </div>
                        </div>
                        }

                      {/* Action Buttons */}
                      {!isBuilt &&
                        <Button
                          onClick={() => buildMutation.mutate(type.id)}
                          disabled={!canBuildThis || buildMutation.isPending}
                          className={`w-full font-bold ${
                          canBuildThis ?
                          'bg-gradient-to-r from-[#B8860B] to-[#8B6508] hover:from-[#C9A84C] hover:to-[#B8860B] text-[#1a1000]' :
                          'bg-[#2a2a2c] text-[#606060] cursor-not-allowed'}`
                           }>
                          
                          {buildMutation.isPending ?
                          <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Building...
                            </> :

                          'Build'
                          }
                        </Button>
                        }

                      {isBuilt && building.level < type.max_level &&
                        <Button
                          onClick={() => upgradeMutation.mutate({
                            buildingId: building.id,
                            typeId: type.id,
                            currentLevel: building.level
                          })}
                          disabled={!canUpgradeThis || upgradeMutation.isPending}
                          className={`w-full font-bold ${
                          canUpgradeThis ?
                          'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white' :
                          'bg-[#2a2a2c] text-[#606060] cursor-not-allowed'}`
                          }>
                          
                          {upgradeMutation.isPending ?
                          <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Upgrading...
                            </> :

                          <>
                              <TrendingUp className="w-4 h-4 mr-2" />
                              Upgrade
                            </>
                          }
                        </Button>
                        }

                      {isBuilt && building.level >= type.max_level &&
                        <div className="text-center py-2 text-green-500 text-sm font-semibold">
                          ✓ Maximum Level Reached
                        </div>
                        }
                    </CardContent>
                  </Card>);

                })}
            </div>
          </div>);

        })}
      </div>
    </div>);

}