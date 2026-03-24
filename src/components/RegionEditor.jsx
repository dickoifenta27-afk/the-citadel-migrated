import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, X, Trash2 } from 'lucide-react';

export default function RegionEditor() {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    region_id: '',
    name: '',
    status: 'Neutral',
    iron_richness: 0.5,
    food_richness: 0.5,
    population_capacity: 0,
    difficulty: 1,
    gold_cost: 500,
    food_cost: 500,
    clash_risk: 0.3
  });

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => await base44.entities.Regions.list()
  });

  const handleSelectRegion = (region) => {
    setSelectedRegion(region);
    setShowCreateForm(false);
    setForm({
      region_id: region.region_id,
      name: region.name,
      status: region.status,
      iron_richness: region.iron_richness,
      food_richness: region.food_richness,
      population_capacity: region.population_capacity,
      difficulty: region.difficulty,
      gold_cost: region.gold_cost,
      food_cost: region.food_cost,
      clash_risk: region.clash_risk
    });
  };

  const handleNewRegion = () => {
    setSelectedRegion(null);
    setShowCreateForm(true);
    setForm({
      region_id: '',
      name: '',
      status: 'Neutral',
      iron_richness: 0.5,
      food_richness: 0.5,
      population_capacity: 0,
      difficulty: 1,
      gold_cost: 500,
      food_cost: 500,
      clash_risk: 0.3
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedRegion) {
        await base44.entities.Regions.update(selectedRegion.id, form);
      } else {
        await base44.entities.Regions.create(form);
      }
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      setShowCreateForm(false);
      setSelectedRegion(null);
      alert(selectedRegion ? 'Region updated!' : 'Region created!');
    } catch (error) {
      alert('Failed to save region');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this region?')) return;
    try {
      await base44.entities.Regions.delete(id);
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      setSelectedRegion(null);
    } catch (error) {
      alert('Failed to delete region');
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Left - Regions Grid */}
      <Card className="bg-[#1a1a1c] border-2 border-orange-600 col-span-1 flex flex-col">
        <CardHeader className="border-b border-orange-600">
          <CardTitle className="text-orange-400 text-lg">Regions</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 flex-1 overflow-y-auto">
          <Button
            onClick={handleNewRegion}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white mb-4 gap-2"
          >
            <Plus className="w-4 h-4" /> New Region
          </Button>
          <div className="space-y-2">
            {regions.length === 0 ? (
              <p className="text-[#CD7F32] text-sm text-center py-8">No regions</p>
            ) : (
              regions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => handleSelectRegion(region)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedRegion?.id === region.id
                      ? 'bg-orange-600/30 border-orange-600 text-[#FFF8DC]'
                      : 'bg-[#101012] border-orange-600/20 text-[#CD7F32] hover:border-orange-600/50'
                  }`}
                >
                  <p className="font-semibold text-sm">{region.name}</p>
                  <p className="text-xs opacity-70 mt-1">{region.region_id} • {region.status}</p>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Right - Editor */}
      <Card className="bg-[#1a1a1c] border-2 border-orange-600 col-span-2 flex flex-col">
        <CardHeader className="border-b border-orange-600">
          <CardTitle className="text-orange-400 text-lg">
            {showCreateForm ? 'New Region' : selectedRegion ? 'Edit Region' : 'Select a Region'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 flex-1 overflow-y-auto">
          {!selectedRegion && !showCreateForm ? (
            <div className="text-center py-12 text-[#CD7F32]">Select or create a region</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-3">
                <h3 className="text-[#FFF8DC] font-semibold text-sm">Region Info</h3>
                <input
                  type="text"
                  placeholder="Region ID"
                  value={form.region_id}
                  onChange={(e) => setForm({ ...form, region_id: e.target.value })}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC] text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Region Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC] text-sm"
                  required
                />
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC] text-sm"
                >
                  <option value="Neutral">Neutral</option>
                  <option value="Conquered">Conquered</option>
                </select>
              </div>

              {/* Resources Grid */}
              <div className="space-y-2">
                <h3 className="text-[#FFF8DC] font-semibold text-sm">Resources</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#CD7F32] text-xs block mb-1">Iron: {(form.iron_richness * 100).toFixed(0)}%</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={form.iron_richness}
                      onChange={(e) => setForm({ ...form, iron_richness: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[#CD7F32] text-xs block mb-1">Food: {(form.food_richness * 100).toFixed(0)}%</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={form.food_richness}
                      onChange={(e) => setForm({ ...form, food_richness: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Conquest Settings Grid */}
              <div className="space-y-2">
                <h3 className="text-[#FFF8DC] font-semibold text-sm">Conquest</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#CD7F32] text-xs font-medium block mb-1">Gold Cost</label>
                    <input
                      type="number"
                      value={form.gold_cost}
                      onChange={(e) => setForm({ ...form, gold_cost: parseInt(e.target.value) })}
                      className="w-full bg-[#101012] border border-orange-600/50 rounded px-2 py-1 text-[#FFF8DC] text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[#CD7F32] text-xs font-medium block mb-1">Food Cost</label>
                    <input
                      type="number"
                      value={form.food_cost}
                      onChange={(e) => setForm({ ...form, food_cost: parseInt(e.target.value) })}
                      className="w-full bg-[#101012] border border-orange-600/50 rounded px-2 py-1 text-[#FFF8DC] text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[#CD7F32] text-xs font-medium block mb-1">Difficulty: {form.difficulty.toFixed(1)}x</label>
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={form.difficulty}
                      onChange={(e) => setForm({ ...form, difficulty: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[#CD7F32] text-xs font-medium block mb-1">Clash Risk: {(form.clash_risk * 100).toFixed(0)}%</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={form.clash_risk}
                      onChange={(e) => setForm({ ...form, clash_risk: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Population Capacity */}
              <div>
                <label className="text-[#CD7F32] text-xs font-medium block mb-2">Population Capacity: +{form.population_capacity}</label>
                <input
                  type="number"
                  value={form.population_capacity}
                  onChange={(e) => setForm({ ...form, population_capacity: parseInt(e.target.value) })}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC] text-sm"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-orange-600/30">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      {selectedRegion ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    selectedRegion ? 'Update' : 'Create'
                  )}
                </Button>
                {selectedRegion && (
                  <Button
                    type="button"
                    onClick={() => handleDelete(selectedRegion.id)}
                    variant="outline"
                    className="bg-red-900/20 border-red-600/50 text-red-400 text-sm"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => {
                    setSelectedRegion(null);
                    setShowCreateForm(false);
                  }}
                  variant="outline"
                  className="bg-[#101012] border-orange-600/50 text-[#CD7F32] text-sm"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}