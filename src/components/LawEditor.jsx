import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, X, Edit2, Trash2 } from 'lucide-react';

export default function LawEditor() {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLaw, setSelectedLaw] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    law_id: '',
    name: '',
    description: '',
    image_url: '',
    category: 'Education',
    pp_cost: 15
  });
  const [effects, setEffects] = useState([
    { resource: 'stability', value: 0.02 }
  ]);
  const [factionStances, setFactionStances] = useState([]);

  const { data: laws = [] } = useQuery({
    queryKey: ['laws'],
    queryFn: async () => {
      return await base44.entities.LawLibrary.list();
    }
  });

  const { data: factions = [] } = useQuery({
    queryKey: ['factions'],
    queryFn: async () => await base44.entities.FactionRegistry.list()
  });

  const resources = [
    'gold', 'food', 'iron', 'wood', 'stability', 'mana', 'population', 'prosperity', 'corruption_reduction'
  ];

  // Build structured effects object from UI rows
  const buildEffectsObject = () => {
    const result = {};
    effects.forEach(e => {
      if (e.resource) result[e.resource] = e.value;
    });
    return result;
  };

  // Build display preview string
  const buildPreview = () =>
    effects.map(e => `${e.value >= 0 ? '+' : ''}${e.value} ${e.resource}`).join(', ') || 'No effects';

  // Parse effects object to UI rows
  const parseEffectsFromObject = (obj) => {
    if (!obj || typeof obj !== 'object') return [];
    return Object.entries(obj).map(([resource, value]) => ({ resource, value }));
  };

  const handleSelectLaw = (law) => {
    setSelectedLaw(law);
    setShowCreateForm(false);
    setForm({
      law_id: law.law_id,
      name: law.name,
      description: law.description || '',
      image_url: law.image_url || '',
      category: law.category || 'Education',
      pp_cost: law.pp_cost ?? 15
    });
    const parsed = parseEffectsFromObject(law.effects);
    setEffects(parsed.length > 0 ? parsed : [{ resource: 'stability', value: 0.02 }]);
    
    const parseStances = (stanceObj) => {
      if (!stanceObj || typeof stanceObj !== 'object') return [];
      return Object.entries(stanceObj).map(([faction, multiplier]) => ({ faction, multiplier }));
    };
    setFactionStances(parseStances(law.faction_stances));
  };

  const handleNewLaw = () => {
    setSelectedLaw(null);
    setShowCreateForm(true);
    setForm({ law_id: '', name: '', description: '', image_url: '', category: 'Education', pp_cost: 15 });
    setEffects([{ resource: 'stability', value: 0.02 }]);
    setFactionStances([]);
  };

  const buildStances = (stances) => {
    const result = {};
    stances.forEach(s => {
      if (s.faction) result[s.faction] = s.multiplier;
    });
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = {
        law_id: form.law_id,
        name: form.name,
        category: form.category,
        description: form.description,
        image_url: form.image_url,
        pp_cost: form.pp_cost ?? 15,
        effects: buildEffectsObject(),
        faction_stances: buildStances(factionStances)
      };

      if (selectedLaw) {
        await base44.entities.LawLibrary.update(selectedLaw.id, data);
      } else {
        await base44.entities.LawLibrary.create({
          ...data,
          is_active: false,
          intensity: 50
        });
      }

      queryClient.invalidateQueries({ queryKey: ['laws'] });
      setShowCreateForm(false);
      setSelectedLaw(null);
      alert(selectedLaw ? 'Law updated successfully!' : 'Law created successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save law');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this law?')) return;
    try {
      await base44.entities.LawLibrary.delete(id);
      queryClient.invalidateQueries({ queryKey: ['laws'] });
      setSelectedLaw(null);
    } catch (error) {
      console.error('Error deleting law:', error);
      alert('Failed to delete law');
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Left Panel - Laws List */}
      <Card className="bg-[#1a1a1c] border-2 border-orange-600 col-span-1 flex flex-col">
        <CardHeader className="border-b border-orange-600">
          <CardTitle className="text-orange-400 text-lg">Laws</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 flex-1 overflow-y-auto">
          <Button
            onClick={handleNewLaw}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white mb-4 gap-2"
          >
            <Plus className="w-4 h-4" /> New Law
          </Button>
          
          <div className="space-y-2">
            {laws.length === 0 ? (
              <p className="text-[#CD7F32] text-sm text-center py-8">No laws yet</p>
            ) : (
              laws.map((law) => (
                <button
                  key={law.id}
                  onClick={() => handleSelectLaw(law)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedLaw?.id === law.id
                      ? 'bg-orange-600/30 border-orange-600 text-[#FFF8DC]'
                      : 'bg-[#101012] border-orange-600/20 text-[#CD7F32] hover:border-orange-600/50'
                  }`}
                >
                  <p className="font-semibold text-sm">{law.name}</p>
                  <p className="text-xs opacity-70 mt-1">{law.law_id}</p>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Right Panel - Editor */}
      <Card className="bg-[#1a1a1c] border-2 border-orange-600 col-span-2 flex flex-col">
        <CardHeader className="border-b border-orange-600">
          <CardTitle className="text-orange-400 text-lg">
            {showCreateForm ? 'New Law' : selectedLaw ? 'Edit Law' : 'Select a Law'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 flex-1 overflow-y-auto">
          {!selectedLaw && !showCreateForm ? (
            <div className="text-center py-12 text-[#CD7F32]">
              <p>Select a law from the list or create a new one</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-[#FFF8DC] font-semibold">Law Information</h3>
                <input
                  type="text"
                  placeholder="Law ID (e.g., LAW_CUSTOM)"
                  value={form.law_id}
                  onChange={(e) => setForm({ ...form, law_id: e.target.value })}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC] placeholder-gray-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Law Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC] placeholder-gray-500"
                  required
                />
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                  required
                >
                  <option value="Education">Education</option>
                  <option value="Military">Military</option>
                  <option value="Welfare">Welfare</option>
                  <option value="Trade">Trade</option>
                  <option value="Economy">Economy</option>
                  <option value="Environment">Environment</option>
                  <option value="Magic">Magic</option>
                  <option value="Population">Population</option>
                </select>
                <textarea
                  placeholder="Law Description (optional)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC] placeholder-gray-500 h-16"
                />
                <input
                  type="text"
                  placeholder="Image URL (optional)"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC] placeholder-gray-500"
                />
              </div>

              {/* PP Cost */}
              <div className="space-y-1">
                <h3 className="text-[#FFF8DC] font-semibold">Activation Cost</h3>
                <label className="text-[#CD7F32] text-xs">Political Points (PP) required to activate</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={form.pp_cost ?? 15}
                  onChange={(e) => setForm({ ...form, pp_cost: parseInt(e.target.value) })}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                />
              </div>

              {/* Effects Builder */}
              <div className="space-y-3">
                <h3 className="text-[#FFF8DC] font-semibold">Effects (per turn, at full intensity)</h3>
                <p className="text-[#CD7F32] text-xs">Values are scaled by law intensity (0–100%). Positive = bonus, Negative = penalty.</p>
                <div className="space-y-2">
                  {effects.map((effect, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select
                        value={effect.resource}
                        onChange={(e) => {
                          const newEffects = [...effects];
                          newEffects[idx].resource = e.target.value;
                          setEffects(newEffects);
                        }}
                        className="bg-[#101012] border border-orange-600/50 rounded px-2 py-2 text-[#FFF8DC] flex-1"
                      >
                        {resources.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        value={effect.value}
                        onChange={(e) => {
                          const newEffects = [...effects];
                          newEffects[idx].value = parseFloat(e.target.value);
                          setEffects(newEffects);
                        }}
                        placeholder="Value (e.g. 50 or -0.02)"
                        className="bg-[#101012] border border-orange-600/50 rounded px-2 py-2 text-[#FFF8DC] w-40"
                      />
                      <button
                        type="button"
                        onClick={() => setEffects(effects.filter((_, i) => i !== idx))}
                        className="text-orange-600 hover:text-orange-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setEffects([...effects, { resource: 'stability', value: 0.01 }])}
                  className="text-orange-400 hover:text-orange-300 flex items-center gap-1 text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Effect
                </button>
              </div>

              {/* Faction Stances */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-[#FFF8DC] font-semibold">Faction Stances</h3>
                  <p className="text-xs text-[#CD7F32] mt-1">
                    Positive = support (increases intensity), Negative = oppose (decreases intensity)
                  </p>
                </div>
                <div className="space-y-2">
                  {factionStances.map((stance, idx) => (
                    <div key={idx} className="flex gap-2 items-end">
                      <select
                        value={stance.faction}
                        onChange={(e) => {
                          const newStances = [...factionStances];
                          newStances[idx].faction = e.target.value;
                          setFactionStances(newStances);
                        }}
                        className="bg-[#101012] border border-orange-600/50 rounded px-2 py-2 text-[#FFF8DC] flex-1"
                      >
                        <option value="">Select faction</option>
                        {factions.map(f => <option key={f.id} value={f.faction_name}>{f.faction_name}</option>)}
                      </select>
                      <input
                        type="number"
                        step="0.1"
                        value={stance.multiplier}
                        onChange={(e) => {
                          const newStances = [...factionStances];
                          newStances[idx].multiplier = parseFloat(e.target.value);
                          setFactionStances(newStances);
                        }}
                        placeholder="Multiplier"
                        className="bg-[#101012] border border-orange-600/50 rounded px-2 py-2 text-[#FFF8DC] w-24"
                      />
                      <button
                        type="button"
                        onClick={() => setFactionStances(factionStances.filter((_, i) => i !== idx))}
                        className="text-orange-600 hover:text-orange-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setFactionStances([...factionStances, { faction: '', multiplier: 1 }])}
                  className="text-orange-400 hover:text-orange-300 flex items-center gap-1 text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Faction Stance
                </button>
              </div>

              {/* Preview */}
              <div className="bg-[#101012] border border-orange-600/30 rounded p-3">
                <p className="text-orange-400 text-xs font-mono">
                  ✓ {buildPreview()} (scaled by intensity % — currently saved as structured object)
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {selectedLaw ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    selectedLaw ? 'Update Law' : 'Create Law'
                  )}
                </Button>
                {selectedLaw && (
                  <Button
                    type="button"
                    onClick={() => handleDelete(selectedLaw.id)}
                    variant="outline"
                    className="bg-red-900/20 border-red-600/50 text-red-400 hover:bg-red-900/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                {(selectedLaw || showCreateForm) && (
                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedLaw(null);
                      setShowCreateForm(false);
                    }}
                    variant="outline"
                    className="bg-[#101012] border-orange-600/50 text-[#CD7F32] hover:text-[#FFF8DC]"
                  >
                    Cancel
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