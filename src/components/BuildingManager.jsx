import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

export default function BuildingManager() {
  const queryClient = useQueryClient();
  const [selectedBuildingType, setSelectedBuildingType] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    building_type_id: '',
    name: '',
    description: '',
    category: 'population',
    base_cost_gold: 0,
    base_cost_food: 0,
    max_level: 10,
  });

  const { data: buildingTypes = [] } = useQuery({
    queryKey: ['buildingTypes'],
    queryFn: async () => {
      return await base44.entities.BuildingTypes.list();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.BuildingTypes.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildingTypes'] });
      setShowForm(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.BuildingTypes.update(selectedBuildingType.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildingTypes'] });
      setShowForm(false);
      setSelectedBuildingType(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.BuildingTypes.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildingTypes'] });
      setSelectedBuildingType(null);
    },
  });

  const resetForm = () => {
    setFormData({
      building_type_id: '',
      name: '',
      description: '',
      category: 'population',
      base_cost_gold: 0,
      base_cost_food: 0,
      max_level: 10,
    });
  };

  const handleSelectBuilding = (building) => {
    setSelectedBuildingType(building);
    setFormData(building);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedBuildingType) {
        await updateMutation.mutateAsync(formData);
      } else {
        await createMutation.mutateAsync(formData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Building List */}
      <Card className="bg-[#141417] border border-[#cd7f32]">
        <CardHeader>
          <CardTitle className="text-[#ffd700] font-serif">Building Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {buildingTypes.map((building) => (
            <div
              key={building.id}
              onClick={() => handleSelectBuilding(building)}
              className={`p-3 rounded cursor-pointer transition-all ${
                selectedBuildingType?.id === building.id
                  ? 'bg-[#008080] border border-[#ffd700]'
                  : 'bg-[#0a0a0c] border border-[#cd7f32]/30 hover:border-[#cd7f32]'
              }`}
            >
              <p className="text-[#ffd700] font-semibold">{building.name}</p>
              <p className="text-[#cd7f32] text-xs">{building.category}</p>
            </div>
          ))}
          <Button
            onClick={() => {
              setSelectedBuildingType(null);
              resetForm();
              setShowForm(true);
            }}
            className="w-full premium-button"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Building Type
          </Button>
        </CardContent>
      </Card>

      {/* Form */}
      {showForm && (
        <Card className="lg:col-span-2 bg-[#141417] border border-[#cd7f32]">
          <CardHeader>
            <CardTitle className="text-[#ffd700] font-serif">
              {selectedBuildingType ? 'Edit Building Type' : 'New Building Type'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[#cd7f32] text-sm font-semibold mb-2">
                  Building ID
                </label>
                <Input
                  value={formData.building_type_id}
                  onChange={(e) =>
                    setFormData({ ...formData, building_type_id: e.target.value })
                  }
                  disabled={!!selectedBuildingType}
                  className="bg-[#0a0a0c] border-[#cd7f32]/50 text-[#e0e0e0]"
                  placeholder="e.g., houses, granary"
                />
              </div>

              <div>
                <label className="block text-[#cd7f32] text-sm font-semibold mb-2">
                  Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="bg-[#0a0a0c] border-[#cd7f32]/50 text-[#e0e0e0]"
                  placeholder="e.g., Houses"
                />
              </div>

              <div>
                <label className="block text-[#cd7f32] text-sm font-semibold mb-2">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-[#0a0a0c] border-[#cd7f32]/50 text-[#e0e0e0]"
                  placeholder="Building description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-[#cd7f32] text-sm font-semibold mb-2">
                  Category
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="bg-[#0a0a0c] border-[#cd7f32]/50 text-[#e0e0e0]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141417] border-[#cd7f32]">
                    <SelectItem value="population">Population</SelectItem>
                    <SelectItem value="resources">Resources</SelectItem>
                    <SelectItem value="military">Military</SelectItem>
                    <SelectItem value="utility">Utility</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#cd7f32] text-sm font-semibold mb-2">
                    Base Cost Gold
                  </label>
                  <Input
                    type="number"
                    value={formData.base_cost_gold}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        base_cost_gold: parseInt(e.target.value) || 0,
                      })
                    }
                    className="bg-[#0a0a0c] border-[#cd7f32]/50 text-[#e0e0e0]"
                  />
                </div>
                <div>
                  <label className="block text-[#cd7f32] text-sm font-semibold mb-2">
                    Base Cost Food
                  </label>
                  <Input
                    type="number"
                    value={formData.base_cost_food}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        base_cost_food: parseInt(e.target.value) || 0,
                      })
                    }
                    className="bg-[#0a0a0c] border-[#cd7f32]/50 text-[#e0e0e0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#cd7f32] text-sm font-semibold mb-2">
                  Max Level
                </label>
                <Input
                  type="number"
                  value={formData.max_level}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_level: parseInt(e.target.value) || 10,
                    })
                  }
                  min="1"
                  max="20"
                  className="bg-[#0a0a0c] border-[#cd7f32]/50 text-[#e0e0e0]"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 premium-button"
                >
                  {selectedBuildingType ? 'Update' : 'Create'}
                </Button>
                {selectedBuildingType && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      deleteMutation.mutate(selectedBuildingType.id);
                    }}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedBuildingType(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}