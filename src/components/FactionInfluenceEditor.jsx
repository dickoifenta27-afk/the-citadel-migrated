import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';

export default function FactionInfluenceEditor() {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFaction, setSelectedFaction] = useState(null);

  const { data: factions = [] } = useQuery({
    queryKey: ['factions'],
    queryFn: async () => await base44.entities.FactionRegistry.list()
  });

  const { data: influenceConfigs = [] } = useQuery({
    queryKey: ['influenceConfigs'],
    queryFn: async () => await base44.entities.FactionInfluenceConfig.list()
  });

  const [form, setForm] = useState({
    faction_name: '',
    gold: 0,
    food: 0,
    iron: 0,
    wood: 0,
    stability: 0,
    seat_weight: 1
  });

  const handleSelectFaction = (factionName) => {
    const config = influenceConfigs.find(c => c.faction_name === factionName);
    setSelectedFaction(factionName);
    
    if (config) {
      setForm({
        faction_name: factionName,
        gold: config.resource_bonuses?.gold || 0,
        food: config.resource_bonuses?.food || 0,
        iron: config.resource_bonuses?.iron || 0,
        wood: config.resource_bonuses?.wood || 0,
        stability: config.resource_bonuses?.stability || 0,
        seat_weight: config.seat_weight || 1
      });
    } else {
      setForm({
        faction_name: factionName,
        gold: 0,
        food: 0,
        iron: 0,
        wood: 0,
        stability: 0,
        seat_weight: 1
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = {
        faction_name: form.faction_name,
        resource_bonuses: {
          gold: form.gold,
          food: form.food,
          iron: form.iron,
          wood: form.wood,
          stability: form.stability
        },
        seat_weight: form.seat_weight
      };

      const existing = influenceConfigs.find(c => c.faction_name === form.faction_name);
      
      if (existing) {
        await base44.entities.FactionInfluenceConfig.update(existing.id, data);
      } else {
        await base44.entities.FactionInfluenceConfig.create(data);
      }

      queryClient.invalidateQueries({ queryKey: ['influenceConfigs'] });
      alert('Configuration saved!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this configuration?')) return;
    const existing = influenceConfigs.find(c => c.faction_name === form.faction_name);
    if (!existing) return;

    try {
      await base44.entities.FactionInfluenceConfig.delete(existing.id);
      queryClient.invalidateQueries({ queryKey: ['influenceConfigs'] });
      setSelectedFaction(null);
      alert('Configuration deleted!');
    } catch (error) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Left - Faction List */}
      <Card className="bg-[#1a1a1c] border-2 border-orange-600 col-span-1 flex flex-col">
        <CardHeader className="border-b border-orange-600">
          <CardTitle className="text-orange-400 text-lg">Factions</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 flex-1 overflow-y-auto">
          <div className="space-y-2">
            {factions.length === 0 ? (
              <p className="text-[#CD7F32] text-sm text-center py-8">No factions found</p>
            ) : (
              factions.map((faction) => {
                const hasConfig = influenceConfigs.some(c => c.faction_name === faction.faction_name);
                return (
                  <button
                    key={faction.id}
                    onClick={() => handleSelectFaction(faction.faction_name)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedFaction === faction.faction_name
                        ? 'bg-orange-600/30 border-orange-600 text-[#FFF8DC]'
                        : 'bg-[#101012] border-orange-600/20 text-[#CD7F32] hover:border-orange-600/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{faction.faction_name}</p>
                      {hasConfig && (
                        <span className="text-xs bg-teal-600/30 text-teal-400 px-2 py-0.5 rounded">
                          Configured
                        </span>
                      )}
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      Influence: {faction.influence}%
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Right - Editor */}
      <Card className="bg-[#1a1a1c] border-2 border-orange-600 col-span-2 flex flex-col">
        <CardHeader className="border-b border-orange-600">
          <CardTitle className="text-orange-400 text-lg">
            {selectedFaction ? `Configure: ${selectedFaction}` : 'Select a Faction'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 flex-1 overflow-y-auto">
          {!selectedFaction ? (
            <div className="text-center py-12 text-[#CD7F32]">
              <p>Select a faction to configure influence effects</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Resource Bonuses */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-[#FFF8DC] font-semibold mb-2">Resource Bonuses Per Turn</h3>
                  <p className="text-xs text-[#CD7F32] mb-4">
                    These values are multiplied by the faction's influence level (0-1). 
                    <br />Example: If Gold = 100 and influence = 0.8, bonus = 80 gold/turn
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#CD7F32] text-sm mb-1">Gold Bonus</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.gold}
                      onChange={(e) => setForm({ ...form, gold: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#CD7F32] text-sm mb-1">Food Bonus</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.food}
                      onChange={(e) => setForm({ ...form, food: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#CD7F32] text-sm mb-1">Iron Bonus</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.iron}
                      onChange={(e) => setForm({ ...form, iron: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#CD7F32] text-sm mb-1">Wood Bonus</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.wood}
                      onChange={(e) => setForm({ ...form, wood: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#CD7F32] text-sm mb-1">Stability Bonus</label>
                    <input
                      type="number"
                      step="0.001"
                      value={form.stability}
                      onChange={(e) => setForm({ ...form, stability: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                    />
                    <p className="text-xs text-[#CD7F32]/70 mt-1">
                      Recommended: 0.001 - 0.05 (stability is 0-1 scale)
                    </p>
                  </div>
                </div>
              </div>

              {/* Seat Weight */}
              <div className="space-y-2">
                <h3 className="text-[#FFF8DC] font-semibold">Council Seat Weight</h3>
                <p className="text-xs text-[#CD7F32] mb-2">
                  Multiplier for seat allocation. Higher weight = more seats when influence is high.
                </p>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={form.seat_weight}
                  onChange={(e) => setForm({ ...form, seat_weight: parseFloat(e.target.value) || 1 })}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                />
              </div>

              {/* Preview */}
              <div className="bg-[#101012] border border-orange-600/30 rounded p-4">
                <h4 className="text-teal-400 text-sm font-semibold mb-2">Preview (at 100% influence)</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#CD7F32]">
                  {form.gold !== 0 && <div>Gold: +{form.gold}/turn</div>}
                  {form.food !== 0 && <div>Food: +{form.food}/turn</div>}
                  {form.iron !== 0 && <div>Iron: +{form.iron}/turn</div>}
                  {form.wood !== 0 && <div>Wood: +{form.wood}/turn</div>}
                  {form.stability !== 0 && <div>Stability: +{form.stability}/turn</div>}
                  <div className="col-span-2">Seat Weight: {form.seat_weight}x</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-orange-600/30">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Configuration
                    </>
                  )}
                </Button>
                {influenceConfigs.some(c => c.faction_name === form.faction_name) && (
                  <Button
                    type="button"
                    onClick={handleDelete}
                    variant="outline"
                    className="bg-red-900/20 border-red-600/50 text-red-400 hover:bg-red-900/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}