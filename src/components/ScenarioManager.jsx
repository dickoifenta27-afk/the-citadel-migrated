import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Trash2, Check } from 'lucide-react';

export default function ScenarioManager() {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    scenario_id: '',
    title: '',
    objective_desc: '',
    target_turn: 50,
    target_stability: 0.6
  });

  const { data: scenarios = [] } = useQuery({
    queryKey: ['scenarios'],
    queryFn: async () => await base44.entities.ScenarioMaster.list()
  });

  const selectedScenario = scenarios.find(s => s.id === selectedId);

  const handleSelectScenario = (scenario) => {
    setSelectedId(scenario.id);
    setShowForm(true);
    setForm({
      scenario_id: scenario.scenario_id,
      title: scenario.title,
      objective_desc: scenario.objective_desc,
      target_turn: scenario.target_turn,
      target_stability: scenario.target_stability
    });
  };

  const handleNewScenario = () => {
    setSelectedId(null);
    setShowForm(true);
    setForm({
      scenario_id: '',
      title: '',
      objective_desc: '',
      target_turn: 50,
      target_stability: 0.6
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedScenario) {
        await base44.entities.ScenarioMaster.update(selectedScenario.id, {
          ...form,
          is_active: selectedScenario.is_active
        });
      } else {
        await base44.entities.ScenarioMaster.create({
          ...form,
          is_active: false
        });
      }
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      setShowForm(false);
      setSelectedId(null);
      alert(selectedScenario ? 'Scenario updated!' : 'Scenario created!');
    } catch (error) {
      alert('Failed to save scenario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetActive = async (scenario) => {
    try {
      for (const s of scenarios) {
        await base44.entities.ScenarioMaster.update(s.id, { ...s, is_active: false });
      }
      await base44.entities.ScenarioMaster.update(scenario.id, { ...scenario, is_active: true });
      queryClient.invalidateQueries({ queryKey: ['scenarios', 'activeScenario'] });
    } catch (error) {
      alert('Failed to set active scenario');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this scenario?')) return;
    try {
      await base44.entities.ScenarioMaster.delete(id);
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      setShowForm(false);
      setSelectedId(null);
    } catch (error) {
      alert('Failed to delete scenario');
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Left - Scenarios List */}
      <Card className="bg-[#1a1a1c] border-2 border-orange-600 col-span-1 flex flex-col">
        <CardHeader className="border-b border-orange-600">
          <CardTitle className="text-orange-400 text-lg">Scenarios</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 flex-1 overflow-y-auto">
          <Button
            onClick={handleNewScenario}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white mb-4 gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> New Scenario
          </Button>
          <div className="space-y-2">
            {scenarios.length === 0 ? (
              <p className="text-[#CD7F32] text-sm text-center py-8">No scenarios</p>
            ) : (
              scenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => handleSelectScenario(scenario)}
                  className={`w-full text-left p-3 rounded-lg border transition-all relative ${
                    scenario.is_active ? 'bg-teal-900/30 border-teal-500' :
                    selectedId === scenario.id ? 'bg-orange-600/30 border-orange-600' :
                    'bg-[#101012] border-orange-600/20 hover:border-orange-600/50'
                  }`}
                >
                  <p className="font-semibold text-sm text-[#FFF8DC]">{scenario.title}</p>
                  <p className="text-xs opacity-70 mt-1">{scenario.scenario_id}</p>
                  {scenario.is_active && (
                    <span className="absolute top-2 right-2 bg-teal-500 text-white text-xs px-2 py-0.5 rounded">ACTIVE</span>
                  )}
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
            {showForm ? (selectedScenario ? 'Edit Scenario' : 'New Scenario') : 'Select a Scenario'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 flex-1 overflow-y-auto">
          {!showForm ? (
            <div className="text-center py-12 text-[#CD7F32]">Select or create a scenario</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Scenario ID"
                value={form.scenario_id}
                onChange={(e) => setForm({ ...form, scenario_id: e.target.value })}
                className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC] text-sm"
                required
              />
              <input
                type="text"
                placeholder="Scenario Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC] text-sm"
                required
              />
              <textarea
                placeholder="Objective Description"
                value={form.objective_desc}
                onChange={(e) => setForm({ ...form, objective_desc: e.target.value })}
                className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC] h-20 text-sm"
                required
              />
              
              <div>
                <label className="text-[#CD7F32] text-xs font-medium block mb-2">
                  Target Turn: <span className="text-orange-400">{form.target_turn}</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={form.target_turn}
                  onChange={(e) => setForm({ ...form, target_turn: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-[#CD7F32] text-xs font-medium block mb-2">
                  Min Stability: <span className="text-orange-400">{(form.target_stability * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={form.target_stability}
                  onChange={(e) => setForm({ ...form, target_stability: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-orange-600/30">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      {selectedScenario ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    selectedScenario ? 'Update' : 'Create'
                  )}
                </Button>
                {selectedScenario?.is_active === false && (
                  <Button
                    type="button"
                    onClick={() => handleSetActive(selectedScenario)}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-sm gap-1"
                  >
                    <Check className="w-3 h-3" /> Set Active
                  </Button>
                )}
                {selectedScenario && (
                  <Button
                    type="button"
                    onClick={() => handleDelete(selectedScenario.id)}
                    variant="outline"
                    className="bg-red-900/20 border-red-600/50 text-red-400 text-sm"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
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