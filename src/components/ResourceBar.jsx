import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ICONS = {
  Gold: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/120da579d_gold.png',
  Food: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/206bfbc58_food.png',
  Iron: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/ebe2e7076_iron.png',
  Wood: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/21930e5bf_wood.png',
  PP: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/1eefb7830_political_points.png',
  Stability: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/ad30333c8_stability.png',
  Mana: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/7efcb30af_mana.png',
  Population: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/f77789096_population.png',
  Prosperity: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/37b6b6711_prosperity.png',
};

export default function ResourceBar({ gameState, projections }) {
  // Fetch all required data for calculation
  const { data: activeLaws = [] } = useQuery({
    queryKey: ['lawLibrary'],
    queryFn: () => base44.entities.LawLibrary.filter({ is_active: true }),
    staleTime: 30000
  });

  const { data: buildings = [] } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => base44.entities.Buildings.list(),
    staleTime: 30000
  });

  const { data: buildingStats = [] } = useQuery({
    queryKey: ['buildingStats'],
    queryFn: () => base44.entities.BuildingStats.list(),
    staleTime: 30000
  });

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: () => base44.entities.Regions.filter({ status: 'Conquered' }),
    staleTime: 30000
  });

  const { data: factions = [] } = useQuery({
    queryKey: ['factions'],
    queryFn: () => base44.entities.FactionRegistry.list(),
    staleTime: 30000
  });

  const { data: factionInfluence = [] } = useQuery({
    queryKey: ['factionInfluence'],
    queryFn: () => base44.entities.FactionInfluenceConfig.list(),
    staleTime: 30000
  });

  const { data: gameConfig = {} } = useQuery({
    queryKey: ['gameConfig'],
    queryFn: async () => {
      const configs = await base44.entities.GameConfig.list();
      return configs.find(c => c.config_id === 'main') || {};
    },
    staleTime: 60000
  });

  const { data: councilMembers = [] } = useQuery({
    queryKey: ['council'],
    queryFn: () => base44.entities.CouncilMember.list(),
    staleTime: 30000
  });

  // Calculate all projections based on actual game logic
  const calculatedProjections = useMemo(() => {
    if (!gameState || !activeLaws || activeLaws.length === 0) {
      return projections || {};
    }

    // Parse law effects from description field (endTurn uses description)
    const parseLawEffects = (descStr) => {
      try {
        if (!descStr) return {};
        // Try to parse JSON from description
        const match = descStr.match(/\{[\s\S]*\}/);
        return match ? JSON.parse(match[0]) : {};
      } catch {
        return {};
      }
    };

    const population = gameState.population || 0;
    const prosperity = gameState.prosperity || 0.5;

    // Gold calculation
    const baseTaxRate = 0.5;
    const prosperityBonus = prosperity * 0.5;
    const effectiveTaxRate = baseTaxRate + prosperityBonus;
    const rawGoldIncome = Math.floor(population * effectiveTaxRate);
    let corruptionRate = Math.floor(population / 10000) * 0.05;
    const corruptionReduction = gameState.corruption_reduction || 0;
    corruptionRate = Math.max(0, corruptionRate - corruptionRate * corruptionReduction);
    const goldIncomeFromPop = Math.floor(rawGoldIncome * (1 - Math.min(corruptionRate, 0.4)));

    // Food consumption
    const foodConsumption = Math.floor(population * (gameConfig.food_consumption_rate || 0.5));

    // Law bonuses
    let lawGoldBonus = 0, lawFoodBonus = 0, lawIronBonus = 0, lawWoodBonus = 0;
    let lawStabilityBonus = 0, lawManaBonus = 0, lawPopulationBonus = 0, lawProsperityBonus = 0;

    for (const law of activeLaws) {
      const intensity = (law.intensity || 50) / 100;
      const fx = parseLawEffects(law.description);
      lawGoldBonus += (fx.gold || 0) * intensity;
      lawFoodBonus += (fx.food || 0) * intensity;
      lawIronBonus += (fx.iron || 0) * intensity;
      lawWoodBonus += (fx.wood || 0) * intensity;
      lawStabilityBonus += (fx.stability || 0) * intensity;
      lawManaBonus += (fx.mana || 0) * intensity;
      lawPopulationBonus += (fx.population || 0) * intensity;
      lawProsperityBonus += (fx.prosperity || 0) * intensity;
    }

    // Building maintenance costs & bonuses
    let totalMaintenanceGold = 0, totalMaintenanceFood = 0;
    let buildingGoldBonus = 0, buildingFoodBonus = 0, buildingIronBonus = 0, buildingWoodBonus = 0;
    let buildingManaBonus = 0, buildingStabilityBonus = 0;

    const completedBuildings = buildings.filter(b => b.is_completed);
    for (const building of completedBuildings) {
      const stats = buildingStats.find(
        s => s.building_type_id === building.building_type_id && s.level === building.level
      );
      if (stats) {
        // Maintenance costs
        totalMaintenanceGold += stats.maintenance_cost?.gold || 0;
        totalMaintenanceFood += stats.maintenance_cost?.food || 0;
        // Resource bonuses
        if (stats.resource_bonus) {
          buildingGoldBonus += stats.resource_bonus.gold || 0;
          buildingFoodBonus += stats.resource_bonus.food || 0;
          buildingIronBonus += stats.resource_bonus.iron || 0;
          buildingWoodBonus += stats.resource_bonus.wood || 0;
          buildingManaBonus += stats.resource_bonus.mana || 0;
          buildingStabilityBonus += stats.stability_bonus || 0;
        }
      }
    }

    // Region bonuses (conquered regions)
    const ironYieldMultiplier = gameConfig.region_iron_yield_multiplier || 100;
    const foodYieldMultiplier = gameConfig.region_food_yield_multiplier || 100;
    let regionFoodBonus = 0, regionIronBonus = 0;
    for (const region of regions) {
      regionFoodBonus += Math.floor((region.food_richness || 0) * foodYieldMultiplier);
      regionIronBonus += Math.floor((region.iron_richness || 0) * ironYieldMultiplier);
    }

    // Faction influence bonuses
    let influenceGoldBonus = 0, influenceFoodBonus = 0, influenceIronBonus = 0, influenceWoodBonus = 0;
    for (const faction of factions) {
      const config = factionInfluence.find(fi => fi.faction_name === faction.faction_name);
      if (config) {
        const influence = faction.influence || 0;
        influenceGoldBonus += (config.resource_bonuses?.gold || 0) * influence;
        influenceFoodBonus += (config.resource_bonuses?.food || 0) * influence;
        influenceIronBonus += (config.resource_bonuses?.iron || 0) * influence;
        influenceWoodBonus += (config.resource_bonuses?.wood || 0) * influence;
      }
    }

    // Political Points
    const basePP = 10;
    let ppFromFactions = 0;
    const ppBreakdown = [];
    for (const council of councilMembers) {
      const faction = factions.find(f => f.faction_name === council.faction_name);
      if (faction && council.seat_count > 0) {
        const contribution = (faction.loyalty - 0.5) * council.seat_count;
        ppFromFactions += contribution;
        ppBreakdown.push({
          faction: faction.faction_name,
          seats: council.seat_count,
          contribution: contribution
        });
      }
    }

    return {
      goldDelta: Math.floor(goldIncomeFromPop + lawGoldBonus + buildingGoldBonus + influenceGoldBonus - totalMaintenanceGold),
      foodDelta: Math.floor(-foodConsumption + lawFoodBonus + buildingFoodBonus + regionFoodBonus + influenceFoodBonus - totalMaintenanceFood),
      ironDelta: Math.floor(regionIronBonus + lawIronBonus + buildingIronBonus + influenceIronBonus),
      woodDelta: Math.floor(lawWoodBonus + buildingWoodBonus + influenceWoodBonus),
      manaDelta: lawManaBonus + buildingManaBonus,
      stabilityDelta: lawStabilityBonus + buildingStabilityBonus,
      populationDelta: Math.floor(lawPopulationBonus),
      prosperityDelta: lawProsperityBonus,
      ppRegen: Math.floor(basePP + ppFromFactions),
      ppBreakdown: ppBreakdown
    };
  }, [gameState, activeLaws, buildings, buildingStats, regions, factions, factionInfluence, gameConfig, councilMembers]);

  const mergedProjections = { ...calculatedProjections, ...projections };

  const baseTaxRate = 0.5;
  const prosperity = gameState?.prosperity || 0.5;
  const prosperityBonus = prosperity * 0.5;
  const effectiveTaxRate = baseTaxRate + prosperityBonus;
  const rawGoldIncome = Math.floor((gameState?.population || 0) * effectiveTaxRate);
  
  let corruptionRate = Math.floor((gameState?.population || 0) / 10000) * 0.05;
  const corruptionReduction = gameState?.corruption_reduction || 0;
  corruptionRate = Math.max(0, corruptionRate - corruptionRate * corruptionReduction);
  const goldIncomeFromPop = Math.floor(rawGoldIncome * (1 - Math.min(corruptionRate, 0.4)));

  const totalGoldProjection = mergedProjections?.goldDelta ?? 0;
  const totalFoodProjection = mergedProjections?.foodDelta ?? 0;

  const resources = [
    { 
      name: 'Gold', 
      value: gameState?.gold || 0, 
      color: 'text-yellow-400', 
      icon: ICONS.Gold,
      projection: totalGoldProjection
    },
    { 
      name: 'Food', 
      value: gameState?.food || 0, 
      color: 'text-green-400', 
      icon: ICONS.Food,
      projection: totalFoodProjection
    },
    { 
      name: 'Iron', 
      value: gameState?.iron || 0, 
      color: 'text-gray-300', 
      icon: ICONS.Iron,
      projection: mergedProjections?.ironDelta ?? 0
    },
    { 
      name: 'Wood', 
      value: gameState?.wood || 0, 
      color: 'text-amber-600', 
      icon: ICONS.Wood,
      projection: mergedProjections?.woodDelta ?? 0
    }
  ];

  return (
    <div className="border-b border-[#CD7F32]/80" style={{
      backgroundImage: 'linear-gradient(180deg, rgba(35,35,42,0.4) 0%, rgba(10,10,13,0.5) 100%)',
      backgroundColor: 'rgba(2,2,3,0.3)',
      boxShadow: '0 1px 20px rgba(205,127,50,0.15), inset 0 -1px 0 rgba(205,127,50,0.3), inset 0 1px 0 rgba(205,127,50,0.1)',
      padding: '10px 16px',
      position: 'relative',
      zIndex: 10
    }}>
      <div className="grid grid-cols-9 gap-4">
        {/* 4 Resources with Tooltips */}
        {resources.map((res) => (
          <TooltipProvider key={res.name} delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-help" style={{ minWidth: 0, overflow: 'hidden' }}>
                  <img src={res.icon} alt={res.name} style={{ width: 56, height: 56, objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.9))' }} />
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <p className={`text-[15px] font-bold ${res.color} truncate`}>{res.value.toLocaleString()}</p>
                    <p className={`text-[11px] ${res.projection > 0 ? 'text-green-400' : res.projection < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {res.projection > 0 ? '+' : ''}{res.projection}/turn
                    </p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-[#141417] border-[#cd7f32]/50 p-4 max-w-sm">
                <div className="space-y-2">
                  <p className="text-[#ffd700] font-semibold text-sm">{res.name} Per Turn</p>
                  <div className="space-y-1.5 text-xs">
                    {res.name === 'Gold' && (
                      <>
                        <div className="flex justify-between py-1 border-b border-[#cd7f32]/20">
                          <span className="text-[#cd7f32]">Tax Income (Pop × {effectiveTaxRate.toFixed(2)})</span>
                          <span className="text-green-400 font-bold">+{goldIncomeFromPop}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-[#cd7f32]/20 text-[10px]">
                          <span className="text-[#cd7f32]/70">• Base Rate: 0.5</span>
                          <span className="text-[#e0e0e0]/60">Prosperity: +{prosperityBonus.toFixed(2)}</span>
                        </div>
                        {corruptionRate > 0 && (
                          <div className="flex justify-between py-1 border-b border-[#cd7f32]/20 text-[10px]">
                            <span className="text-red-400/80">• Corruption Penalty</span>
                            <span className="text-red-400/80">-{(corruptionRate * 100).toFixed(1)}%</span>
                          </div>
                        )}
                        {(projections?.goldDelta || 0) !== 0 && (
                          <div className="flex justify-between py-1 border-b border-[#cd7f32]/20">
                            <span className="text-[#cd7f32]">From Laws & Buildings</span>
                            <span className={`font-bold ${projections.goldDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {projections.goldDelta > 0 ? '+' : ''}{projections.goldDelta}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    {res.name === 'Food' && (
                      <>
                        <div className="flex justify-between py-1 border-b border-[#cd7f32]/20">
                          <span className="text-[#cd7f32]">Consumption</span>
                          <span className="text-red-400 font-bold">-{Math.floor(gameState?.population * 0.5)}</span>
                        </div>
                        {(projections?.foodDelta || 0) !== 0 && (
                          <div className="flex justify-between py-1 border-b border-[#cd7f32]/20">
                            <span className="text-[#cd7f32]">From Laws & Buildings</span>
                            <span className={`font-bold ${projections.foodDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {projections.foodDelta > 0 ? '+' : ''}{projections.foodDelta}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    {res.name === 'Iron' && (mergedProjections?.ironDelta || 0) !== 0 && (
                      <div className="flex justify-between py-1 border-b border-[#cd7f32]/20">
                        <span className="text-[#cd7f32]">From Regions & Laws</span>
                        <span className={`font-bold ${mergedProjections.ironDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {mergedProjections.ironDelta > 0 ? '+' : ''}{mergedProjections.ironDelta}
                        </span>
                      </div>
                    )}
                    {res.name === 'Wood' && (mergedProjections?.woodDelta || 0) !== 0 && (
                      <div className="flex justify-between py-1 border-b border-[#cd7f32]/20">
                        <span className="text-[#cd7f32]">From Laws</span>
                        <span className={`font-bold ${mergedProjections.woodDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {mergedProjections.woodDelta > 0 ? '+' : ''}{mergedProjections.woodDelta}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-[#cd7f32]/30">
                      <span className="text-[#ffd700] font-semibold">Total</span>
                      <span className={`font-bold ${res.projection > 0 ? 'text-green-400' : res.projection < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {res.projection > 0 ? '+' : ''}{res.projection}
                      </span>
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}

        {/* Political Points with Tooltip */}
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <img src={ICONS.PP} alt="PP" style={{ width: 56, height: 56, objectFit: 'contain', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.9))' }} />
                <div>
                  <p className="text-purple-400 text-[15px] font-bold">{gameState?.political_points || 0}</p>
                  <p className={`text-[11px] ${(projections?.ppRegen ?? 0) > 0 ? 'text-green-400' : (projections?.ppRegen ?? 0) < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {(projections?.ppRegen ?? 0) > 0 ? '+' : ''}{projections?.ppRegen ?? 0}/turn
                  </p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-[#141417] border-purple-500/50 p-4 max-w-sm">
              <div className="space-y-2">
                <p className="text-purple-300 font-semibold text-sm">PP Regeneration Breakdown</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-purple-500/20">
                    <span className="text-[#cd7f32]">Base PP</span>
                    <span className="text-green-400 font-bold">+10</span>
                  </div>
                  {mergedProjections?.ppBreakdown && mergedProjections.ppBreakdown.length > 0 ? (
                    mergedProjections.ppBreakdown.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-1">
                        <div>
                          <span className="text-[#e0e0e0]">{item.faction}</span>
                          <span className="text-[#cd7f32]/70 ml-1">({item.seats} seats)</span>
                        </div>
                        <span className={`font-bold ${item.contribution > 0 ? 'text-green-400' : item.contribution < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                          {item.contribution > 0 ? '+' : ''}{item.contribution.toFixed(1)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[#e0e0e0]/60 italic py-1">No faction seats allocated</p>
                  )}
                  <div className="flex justify-between pt-2 border-t border-purple-500/30">
                    <span className="text-purple-300 font-semibold">Total</span>
                    <span className={`font-bold ${(mergedProjections?.ppRegen ?? 0) > 0 ? 'text-green-400' : (mergedProjections?.ppRegen ?? 0) < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {(mergedProjections?.ppRegen ?? 0) > 0 ? '+' : ''}{mergedProjections?.ppRegen ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Stability with Tooltip */}
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <img src={ICONS.Stability} alt="Stability" style={{ width: 56, height: 56, objectFit: 'contain', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.9))' }} />
                <div>
                  <p className="text-[#ffd700] text-[15px] font-bold">{(gameState?.stability ?? 0)}/100</p>
                  <p className={`text-[11px] ${(projections?.stabilityDelta ?? 0) > 0 ? 'text-green-400' : (projections?.stabilityDelta ?? 0) < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {(projections?.stabilityDelta ?? 0) > 0 ? '+' : ''}{(projections?.stabilityDelta ?? 0)}/turn
                  </p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-[#141417] border-[#cd7f32]/50 p-4 max-w-sm">
              <div className="space-y-2">
                <p className="text-[#ffd700] font-semibold text-sm">Stability Per Turn</p>
                <div className="space-y-1.5 text-xs">
                  {(mergedProjections?.stabilityDelta || 0) !== 0 ? (
                    <div className="flex justify-between py-1 border-b border-[#cd7f32]/20">
                      <span className="text-[#cd7f32]">From Active Laws & Buildings</span>
                      <span className={`font-bold ${mergedProjections.stabilityDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {mergedProjections.stabilityDelta > 0 ? '+' : ''}{mergedProjections.stabilityDelta}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[#e0e0e0]/60 italic py-1">No active law effects</p>
                  )}
                  <div className="flex justify-between pt-2 border-t border-[#cd7f32]/30">
                    <span className="text-[#ffd700] font-semibold">Total</span>
                    <span className={`font-bold ${(mergedProjections?.stabilityDelta ?? 0) > 0 ? 'text-green-400' : (mergedProjections?.stabilityDelta ?? 0) < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {(mergedProjections?.stabilityDelta ?? 0) > 0 ? '+' : ''}{(mergedProjections?.stabilityDelta ?? 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Mana with Tooltip */}
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <img src={ICONS.Mana} alt="Mana" style={{ width: 56, height: 56, objectFit: 'contain', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.9))' }} />
                <div>
                  <p className="text-[#ffd700] text-[15px] font-bold">{(gameState?.mana ?? 0).toLocaleString()}</p>
                  <p className={`text-[11px] ${(projections?.manaDelta ?? 0) > 0 ? 'text-green-400' : (projections?.manaDelta ?? 0) < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {(projections?.manaDelta ?? 0) > 0 ? '+' : ''}{Math.floor(projections?.manaDelta ?? 0)}/turn
                  </p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-[#141417] border-[#cd7f32]/50 p-4 max-w-sm">
              <div className="space-y-2">
                <p className="text-[#ffd700] font-semibold text-sm">Mana Per Turn</p>
                <div className="space-y-1.5 text-xs">
                  {(mergedProjections?.manaDelta || 0) !== 0 ? (
                    <div className="flex justify-between py-1 border-b border-[#cd7f32]/20">
                      <span className="text-[#cd7f32]">From Active Laws</span>
                      <span className={`font-bold ${mergedProjections.manaDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {mergedProjections.manaDelta > 0 ? '+' : ''}{Math.floor(mergedProjections.manaDelta)}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[#e0e0e0]/60 italic py-1">No active law effects</p>
                  )}
                  <div className="flex justify-between pt-2 border-t border-[#cd7f32]/30">
                    <span className="text-[#ffd700] font-semibold">Total</span>
                    <span className={`font-bold ${(mergedProjections?.manaDelta ?? 0) > 0 ? 'text-green-400' : (mergedProjections?.manaDelta ?? 0) < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {(mergedProjections?.manaDelta ?? 0) > 0 ? '+' : ''}{Math.floor(mergedProjections?.manaDelta ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Population with Tooltip */}
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <img src={ICONS.Population} alt="Population" style={{ width: 56, height: 56, objectFit: 'contain', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.9))' }} />
                <div>
                  <p className="text-[#ffd700] text-[15px] font-bold">{gameState?.population.toLocaleString()}</p>
                  <p className={`text-[11px] ${(projections?.populationDelta ?? 0) > 0 ? 'text-green-400' : (projections?.populationDelta ?? 0) < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {(projections?.populationDelta ?? 0) > 0 ? '+' : ''}{projections?.populationDelta ?? 0}/turn
                  </p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-[#141417] border-[#cd7f32]/50 p-4 max-w-sm">
              <div className="space-y-2">
                <p className="text-[#ffd700] font-semibold text-sm">Population Per Turn</p>
                <div className="space-y-1.5 text-xs">
                  {(mergedProjections?.populationDelta || 0) !== 0 ? (
                    <div className="flex justify-between py-1 border-b border-[#cd7f32]/20">
                      <span className="text-[#cd7f32]">From Active Laws</span>
                      <span className={`font-bold ${mergedProjections.populationDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {mergedProjections.populationDelta > 0 ? '+' : ''}{mergedProjections.populationDelta}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[#e0e0e0]/60 italic py-1">No active law effects</p>
                  )}
                  <div className="flex justify-between pt-2 border-t border-[#cd7f32]/30">
                    <span className="text-[#ffd700] font-semibold">Total</span>
                    <span className={`font-bold ${(mergedProjections?.populationDelta ?? 0) > 0 ? 'text-green-400' : (mergedProjections?.populationDelta ?? 0) < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {(mergedProjections?.populationDelta ?? 0) > 0 ? '+' : ''}{mergedProjections?.populationDelta ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Prosperity with Tooltip */}
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <img src={ICONS.Prosperity} alt="Prosperity" style={{ width: 56, height: 56, objectFit: 'contain', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.9))' }} />
                <div>
                  <p className="text-[#ffd700] text-[15px] font-bold">{(gameState?.prosperity ?? 50).toFixed(0)}/100</p>
                  <p className={`text-[11px] ${(projections?.prosperityDelta ?? 0) > 0 ? 'text-green-400' : (projections?.prosperityDelta ?? 0) < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {(projections?.prosperityDelta ?? 0) > 0 ? '+' : ''}{(projections?.prosperityDelta ?? 0).toFixed(1)}%/turn
                  </p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-[#141417] border-[#cd7f32]/50 p-4 max-w-sm">
              <div className="space-y-2">
                <p className="text-[#ffd700] font-semibold text-sm">Prosperity Per Turn</p>
                <div className="space-y-1.5 text-xs">
                  <p className="text-[#e0e0e0]/80 italic py-1 mb-2">Affects tax efficiency (gold income per population)</p>
                  {(mergedProjections?.prosperityDelta || 0) !== 0 ? (
                    <div className="flex justify-between py-1 border-b border-[#cd7f32]/20">
                      <span className="text-[#cd7f32]">From Active Laws</span>
                      <span className={`font-bold ${mergedProjections.prosperityDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {mergedProjections.prosperityDelta > 0 ? '+' : ''}{mergedProjections.prosperityDelta.toFixed(1)}%
                      </span>
                    </div>
                  ) : (
                    <p className="text-[#e0e0e0]/60 italic py-1">No active law effects</p>
                  )}
                  {gameState?.stability && (
                    <div className="flex justify-between py-1 border-b border-[#cd7f32]/20">
                      <span className="text-[#cd7f32]">Stability Effect</span>
                      <span className={`font-bold ${gameState.stability > 0.7 ? 'text-green-400' : gameState.stability < 0.5 ? 'text-red-400' : 'text-gray-400'}`}>
                        {gameState.stability > 0.7 ? '+1.0%' : gameState.stability < 0.5 ? '-1.0%' : '0%'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-[#cd7f32]/30">
                    <span className="text-[#ffd700] font-semibold">Total</span>
                    <span className={`font-bold ${(mergedProjections?.prosperityDelta ?? 0) > 0 ? 'text-green-400' : (mergedProjections?.prosperityDelta ?? 0) < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {(mergedProjections?.prosperityDelta ?? 0) > 0 ? '+' : ''}{(mergedProjections?.prosperityDelta ?? 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}