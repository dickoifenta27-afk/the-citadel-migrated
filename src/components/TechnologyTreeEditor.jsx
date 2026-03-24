import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Trash2 } from 'lucide-react';

export default function TechnologyTreeEditor() {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTech, setSelectedTech] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    tech_id: '',
    name: '',
    description: '',
    category: 'Economy',
    tier: 1,
    research_cost_gold: 500,
    research_cost_mana: 0,
    research_turns: 3
  });
  const [prerequisites, setPrerequisites] = useState('[]');
  const [effects, setEffects] = useState('{}');

  const { data: technologies = [] } = useQuery({
    queryKey: ['technologies'],
    queryFn: async () => await base44.entities.TechnologyTree.list()
  });

  const handleSelectTech = (tech) => {
    setSelectedTech(tech);
    setShowCreateForm(false);
    setForm({
      tech_id: tech.tech_id,
      name: tech.name,
      description: tech.description,
      category: tech.category,
      tier: tech.tier || 1,
      research_cost_gold: tech.research_cost_gold || 500,
      research_cost_mana: tech.research_cost_mana || 0,
      research_turns: tech.research_turns || 3
    });
    setPrerequisites(JSON.stringify(tech.prerequisites || [], null, 2));
    setEffects(JSON.stringify(tech.effects || {}, null, 2));
  };

  const handleNewTech = () => {
    setSelectedTech(null);
    setShowCreateForm(true);
    setForm({
      tech_id: '',
      name: '',
      description: '',
      category: 'Economy',
      tier: 1,
      research_cost_gold: 500,
      research_cost_mana: 0,
      research_turns: 3
    });
    setPrerequisites('[]');
    setEffects('{}');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let parsedPrerequisites = [];
      let parsedEffects = {};
      
      try {
        parsedPrerequisites = JSON.parse(prerequisites);
        parsedEffects = JSON.parse(effects);
      } catch (err) {
        alert('Invalid JSON in prerequisites or effects');
        setIsSubmitting(false);
        return;
      }

      const data = {
        ...form,
        prerequisites: parsedPrerequisites,
        effects: parsedEffects
      };

      if (selectedTech) {
        await base44.entities.TechnologyTree.update(selectedTech.id, data);
      } else {
        await base44.entities.TechnologyTree.create({
          ...data,
          is_researched: false,
          is_researching: false,
          research_progress: 0
        });
      }

      queryClient.invalidateQueries({ queryKey: ['technologies'] });
      setShowCreateForm(false);
      setSelectedTech(null);
      alert(selectedTech ? 'Technology updated!' : 'Technology created!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save technology');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this technology?')) return;
    try {
      await base44.entities.TechnologyTree.delete(id);
      queryClient.invalidateQueries({ queryKey: ['technologies'] });
      setSelectedTech(null);
    } catch (error) {
      console.error('Error deleting technology:', error);
      alert('Failed to delete technology');
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Left Panel - Technologies List */}
      <Card className="bg-[#1a1a1c] border-2 border-orange-600 col-span-1 flex flex-col">
        <CardHeader className="border-b border-orange-600">
          <CardTitle className="text-orange-400 text-lg">Technologies</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 flex-1 overflow-y-auto">
          <Button
            onClick={handleNewTech}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white mb-4 gap-2"
          >
            <Plus className="w-4 h-4" /> New Technology
          </Button>
          
          <div className="space-y-2">
            {technologies.length === 0 ? (
              <p className="text-[#CD7F32] text-sm text-center py-8">No technologies yet</p>
            ) : (
              technologies.map((tech) => (
                <button
                  key={tech.id}
                  onClick={() => handleSelectTech(tech)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedTech?.id === tech.id
                      ? 'bg-orange-600/30 border-orange-600 text-[#FFF8DC]'
                      : 'bg-[#101012] border-orange-600/20 text-[#CD7F32] hover:border-orange-600/50'
                  }`}
                >
                  <p className="font-semibold text-sm">{tech.name}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {tech.category} • Tier {tech.tier}
                  </p>
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
            {showCreateForm ? 'New Technology' : selectedTech ? 'Edit Technology' : 'Select a Technology'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 flex-1 overflow-y-auto">
          {!selectedTech && !showCreateForm ? (
            <div className="text-center py-12 text-[#CD7F32]">
              <p>Select a technology from the list or create a new one</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-[#FFF8DC] font-semibold">Technology Information</h3>
                <input
                  type="text"
                  placeholder="Tech ID (e.g., TECH_AGRICULTURE_01)"
                  value={form.tech_id}
                  onChange={(e) => setForm({ ...form, tech_id: e.target.value })}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC] placeholder-gray-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Technology Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC] placeholder-gray-500"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC] placeholder-gray-500 h-20"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#FFF8DC] text-sm mb-2 block">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                      required
                    >
                      <option value="Economy">Economy</option>
                      <option value="Military">Military</option>
                      <option value="Civic">Civic</option>
                      <option value="Mystical">Mystical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[#FFF8DC] text-sm mb-2 block">Tier (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={form.tier}
                      onChange={(e) => setForm({ ...form, tier: parseInt(e.target.value) })}
                      className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Research Costs */}
              <div className="space-y-3">
                <h3 className="text-[#FFF8DC] font-semibold">Research Costs</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[#FFF8DC] text-sm mb-2 block">Gold</label>
                    <input
                      type="number"
                      value={form.research_cost_gold}
                      onChange={(e) => setForm({ ...form, research_cost_gold: parseInt(e.target.value) })}
                      className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[#FFF8DC] text-sm mb-2 block">Mana</label>
                    <input
                      type="number"
                      min="0"
                      value={form.research_cost_mana}
                      onChange={(e) => setForm({ ...form, research_cost_mana: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                    />
                  </div>
                  <div>
                    <label className="text-[#FFF8DC] text-sm mb-2 block">Turns</label>
                    <input
                      type="number"
                      value={form.research_turns}
                      onChange={(e) => setForm({ ...form, research_turns: parseInt(e.target.value) })}
                      className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Prerequisites */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-[#FFF8DC] font-semibold">Prerequisites (JSON Array)</h3>
                  <p className="text-xs text-[#CD7F32] mt-1">
                    Example: ["TECH_BASIC_01", "TECH_BASIC_02"]
                  </p>
                </div>
                <textarea
                  value={prerequisites}
                  onChange={(e) => setPrerequisites(e.target.value)}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC] font-mono text-xs h-20"
                  placeholder='["TECH_ID_1"]'
                />
              </div>

              {/* Effects */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-[#FFF8DC] font-semibold">Effects (JSON Object)</h3>
                  <p className="text-xs text-[#CD7F32] mt-1">
                    Example: {'{'}gold_per_turn: 100, food_per_turn: 50, stability_bonus: 0.05{'}'}
                  </p>
                </div>
                <textarea
                  value={effects}
                  onChange={(e) => setEffects(e.target.value)}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC] font-mono text-xs h-32"
                  placeholder='{"gold_per_turn": 100}'
                />
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
                      {selectedTech ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    selectedTech ? 'Update Technology' : 'Create Technology'
                  )}
                </Button>
                {selectedTech && (
                  <Button
                    type="button"
                    onClick={() => handleDelete(selectedTech.id)}
                    variant="outline"
                    className="bg-red-900/20 border-red-600/50 text-red-400 hover:bg-red-900/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                {(selectedTech || showCreateForm) && (
                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedTech(null);
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