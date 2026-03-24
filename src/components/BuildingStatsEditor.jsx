import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';

export default function BuildingStatsEditor() {
  const queryClient = useQueryClient();
  const [selectedBuildingType, setSelectedBuildingType] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    population_capacity_bonus: '',
    stability_bonus: '',
    food_consumption_reduction: '',
    resource_bonus: { gold: '', food: '', iron: '', wood: '' },
    maintenance_cost: { gold: '', food: '' },
  });

  const { data: buildingTypes = [] } = useQuery({
    queryKey: ['buildingTypes'],
    queryFn: async () => {
      return await base44.entities.BuildingTypes.list();
    },
  });

  const { data: buildingStats = [] } = useQuery({
    queryKey: ['buildingStats', selectedBuildingType?.id],
    queryFn: async () => {
      if (!selectedBuildingType?.id) return [];
      return await base44.entities.BuildingStats.filter({
        building_type_id: selectedBuildingType.building_type_id,
      });
    },
    enabled: !!selectedBuildingType?.id,
  });

  const currentStat = buildingStats.find(
    (stat) => stat.building_type_id === selectedBuildingType?.building_type_id && stat.level === selectedLevel
  );

  const upsertMutation = useMutation({
    mutationFn: async (data) => {
      if (currentStat) {
        return await base44.entities.BuildingStats.update(currentStat.id, data);
      } else {
        return await base44.entities.BuildingStats.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildingStats'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.BuildingStats.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildingStats'] });
    },
  });

  const handleSelectBuilding = (building) => {
    setSelectedBuildingType(building);
    setSelectedLevel(1);
    
    // Load existing stats for this building
    const existingStat = buildingStats.find(
      (stat) => stat.building_type_id === building.building_type_id && stat.level === 1
    );
    
    if (existingStat) {
      setFormData(existingStat);
    } else {
      setFormData({
        population_capacity_bonus: '',
        stability_bonus: '',
        food_consumption_reduction: '',
        resource_bonus: { gold: '', food: '', iron: '', wood: '' },
        maintenance_cost: { gold: '', food: '' },
      });
    }
  };

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    
    const existingStat = buildingStats.find(
      (stat) => stat.building_type_id === selectedBuildingType?.building_type_id && stat.level === level
    );
    
    if (existingStat) {
      setFormData(existingStat);
    } else {
      setFormData({
        population_capacity_bonus: '',
        stability_bonus: '',
        food_consumption_reduction: '',
        resource_bonus: { gold: '', food: '', iron: '', wood: '' },
        maintenance_cost: { gold: '', food: '' },
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const cleanedData = {
        building_type_id: selectedBuildingType.building_type_id,
        level: selectedLevel,
        population_capacity_bonus: formData.population_capacity_bonus === '' ? 0 : formData.population_capacity_bonus,
        stability_bonus: formData.stability_bonus === '' ? 0 : formData.stability_bonus,
        food_consumption_reduction: formData.food_consumption_reduction === '' ? 0 : formData.food_consumption_reduction,
        resource_bonus: {
          gold: formData.resource_bonus.gold === '' ? 0 : formData.resource_bonus.gold,
          food: formData.resource_bonus.food === '' ? 0 : formData.resource_bonus.food,
          iron: formData.resource_bonus.iron === '' ? 0 : formData.resource_bonus.iron,
          wood: formData.resource_bonus.wood === '' ? 0 : formData.resource_bonus.wood,
        },
        maintenance_cost: {
          gold: formData.maintenance_cost.gold === '' ? 0 : formData.maintenance_cost.gold,
          food: formData.maintenance_cost.food === '' ? 0 : formData.maintenance_cost.food,
        },
      };
      
      await upsertMutation.mutateAsync(cleanedData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Building Type List */}
      <Card className="bg-[#141417] border border-[#cd7f32]">
        <CardHeader>
          <CardTitle className="text-[#ffd700] font-serif text-lg">Building Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {buildingTypes.map((building) => (
            <div
              key={building.id}
              onClick={() => handleSelectBuilding(building)}
              className={`p-3 rounded cursor-pointer transition-all text-sm ${
                selectedBuildingType?.id === building.id
                  ? 'bg-[#ff8c42] border border-white'
                  : 'bg-[#0a0a0c] border border-[#cd7f32]/30 hover:border-[#cd7f32]'
              }`}
            >
              <p className="text-white font-semibold">{building.name}</p>
              <p className="text-[#cd7f32] text-xs">{building.category}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Level Selector & Stats Form */}
      {selectedBuildingType && (
        <Card className="lg:col-span-3 bg-[#141417] border border-[#cd7f32]">
          <CardHeader>
            <CardTitle className="text-[#ffd700] font-serif">
              {selectedBuildingType.name} - Stats Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Level Selector */}
            <div>
              <p className="text-[#cd7f32] text-sm font-semibold mb-3">Select Level</p>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: selectedBuildingType.max_level }, (_, i) => i + 1).map((level) => (
                  <button
                    key={level}
                    onClick={() => handleLevelChange(level)}
                    className={`py-2 px-3 rounded font-semibold text-sm transition-all ${
                      selectedLevel === level
                        ? 'bg-[#ff8c42] text-white'
                        : 'bg-[#0a0a0c] border border-[#cd7f32]/50 text-[#ffd700] hover:border-[#cd7f32]'
                    }`}
                  >
                    Lv {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Population Capacity Bonus */}
              <div>
                <label className="block text-[#cd7f32] text-sm font-semibold mb-2">
                  Population Capacity Bonus
                </label>
                <Input
                  type="number"
                  value={formData.population_capacity_bonus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      population_capacity_bonus: e.target.value === '' ? '' : parseInt(e.target.value) || 0,
                    })
                  }
                  className="bg-[#0a0a0c] border-[#cd7f32]/50 text-[#e0e0e0]"
                  placeholder="e.g., 100"
                />
              </div>

              {/* Stability Bonus */}
              <div>
                <label className="block text-[#cd7f32] text-sm font-semibold mb-2">
                  Stability Bonus (0-1 scale)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.stability_bonus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stability_bonus: e.target.value === '' ? '' : parseFloat(e.target.value) || 0,
                    })
                  }
                  className="bg-[#0a0a0c] border-[#cd7f32]/50 text-[#e0e0e0]"
                  placeholder="e.g., 0.05"
                />
              </div>

              {/* Food Consumption Reduction */}
              <div>
                <label className="block text-[#cd7f32] text-sm font-semibold mb-2">
                  Food Consumption Reduction (0-1 scale)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.food_consumption_reduction}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      food_consumption_reduction: e.target.value === '' ? '' : parseFloat(e.target.value) || 0,
                    })
                  }
                  className="bg-[#0a0a0c] border-[#cd7f32]/50 text-[#e0e0e0]"
                  placeholder="e.g., 0.1"
                />
              </div>

              {/* Resource Bonus */}
              <div className="border-t border-[#cd7f32]/30 pt-4">
                <p className="text-[#cd7f32] text-sm font-semibold mb-3">Resource Bonus (per turn)</p>
                <div className="grid grid-cols-2 gap-3">
                  {['gold', 'food', 'iron', 'wood'].map((resource) => (
                    <div key={resource}>
                      <label className="block text-[#ffd700] text-xs font-semibold mb-1 capitalize">
                        {resource}
                      </label>
                      <Input
                        type="number"
                        value={formData.resource_bonus[resource] ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            resource_bonus: {
                              ...formData.resource_bonus,
                              [resource]: e.target.value === '' ? '' : parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="bg-[#0a0a0c] border-[#cd7f32]/50 text-[#e0e0e0] text-sm"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Maintenance Cost */}
              <div className="border-t border-[#cd7f32]/30 pt-4">
                <p className="text-[#cd7f32] text-sm font-semibold mb-3">Maintenance Cost (per turn)</p>
                <div className="grid grid-cols-2 gap-3">
                  {['gold', 'food'].map((resource) => (
                    <div key={resource}>
                      <label className="block text-[#ffd700] text-xs font-semibold mb-1 capitalize">
                        {resource}
                      </label>
                      <Input
                        type="number"
                        value={formData.maintenance_cost[resource] ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maintenance_cost: {
                              ...formData.maintenance_cost,
                              [resource]: e.target.value === '' ? '' : parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="bg-[#0a0a0c] border-[#cd7f32]/50 text-[#e0e0e0] text-sm"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4 border-t border-[#cd7f32]/30">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 premium-button"
                >
                  Save Stats
                </Button>
                {currentStat && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      deleteMutation.mutate(currentStat.id);
                    }}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}