import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, X, Trash2 } from 'lucide-react';

export default function FactionQuestEditor() {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    quest_id: '',
    faction_name: '',
    title: '',
    description: '',
    quest_type: 'resource',
    deadline_turns: 0,
    reward_loyalty: 0.1,
    reward_influence: 0.05,
    reward_favor_points: 50,
    penalty_loyalty: -0.15,
    penalty_influence: -0.05
  });
  const [requirement, setRequirement] = useState('{}');

  const { data: quests = [] } = useQuery({
    queryKey: ['factionQuests'],
    queryFn: async () => await base44.entities.FactionQuest.list()
  });

  const { data: factions = [] } = useQuery({
    queryKey: ['factions'],
    queryFn: async () => await base44.entities.FactionRegistry.list()
  });

  const handleSelectQuest = (quest) => {
    setSelectedQuest(quest);
    setShowCreateForm(false);
    setForm({
      quest_id: quest.quest_id,
      faction_name: quest.faction_name,
      title: quest.title,
      description: quest.description,
      quest_type: quest.quest_type,
      deadline_turns: quest.deadline_turns || 0,
      reward_loyalty: quest.reward_loyalty || 0.1,
      reward_influence: quest.reward_influence || 0.05,
      reward_favor_points: quest.reward_favor_points || 50,
      penalty_loyalty: quest.penalty_loyalty || -0.15,
      penalty_influence: quest.penalty_influence || -0.05
    });
    setRequirement(JSON.stringify(quest.requirement || {}, null, 2));
  };

  const handleNewQuest = () => {
    setSelectedQuest(null);
    setShowCreateForm(true);
    setForm({
      quest_id: '',
      faction_name: '',
      title: '',
      description: '',
      quest_type: 'resource',
      deadline_turns: 0,
      reward_loyalty: 0.1,
      reward_influence: 0.05,
      reward_favor_points: 50,
      penalty_loyalty: -0.15,
      penalty_influence: -0.05
    });
    setRequirement('{}');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let parsedRequirement = {};
      try {
        parsedRequirement = JSON.parse(requirement);
      } catch (err) {
        alert('Invalid JSON in requirement field');
        setIsSubmitting(false);
        return;
      }

      const data = {
        ...form,
        requirement: parsedRequirement
      };

      if (selectedQuest) {
        await base44.entities.FactionQuest.update(selectedQuest.id, data);
      } else {
        await base44.entities.FactionQuest.create({
          ...data,
          is_active: false,
          is_completed: false,
          turn_activated: 0
        });
      }

      queryClient.invalidateQueries({ queryKey: ['factionQuests'] });
      setShowCreateForm(false);
      setSelectedQuest(null);
      alert(selectedQuest ? 'Quest updated!' : 'Quest created!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save quest');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this quest?')) return;
    try {
      await base44.entities.FactionQuest.delete(id);
      queryClient.invalidateQueries({ queryKey: ['factionQuests'] });
      setSelectedQuest(null);
    } catch (error) {
      console.error('Error deleting quest:', error);
      alert('Failed to delete quest');
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Left Panel - Quests List */}
      <Card className="bg-[#1a1a1c] border-2 border-orange-600 col-span-1 flex flex-col">
        <CardHeader className="border-b border-orange-600">
          <CardTitle className="text-orange-400 text-lg">Faction Quests</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 flex-1 overflow-y-auto">
          <Button
            onClick={handleNewQuest}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white mb-4 gap-2"
          >
            <Plus className="w-4 h-4" /> New Quest
          </Button>
          
          <div className="space-y-2">
            {quests.length === 0 ? (
              <p className="text-[#CD7F32] text-sm text-center py-8">No quests yet</p>
            ) : (
              quests.map((quest) => (
                <button
                  key={quest.id}
                  onClick={() => handleSelectQuest(quest)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedQuest?.id === quest.id
                      ? 'bg-orange-600/30 border-orange-600 text-[#FFF8DC]'
                      : 'bg-[#101012] border-orange-600/20 text-[#CD7F32] hover:border-orange-600/50'
                  }`}
                >
                  <p className="font-semibold text-sm">{quest.title}</p>
                  <p className="text-xs opacity-70 mt-1">{quest.faction_name} • {quest.quest_type}</p>
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
            {showCreateForm ? 'New Quest' : selectedQuest ? 'Edit Quest' : 'Select a Quest'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 flex-1 overflow-y-auto">
          {!selectedQuest && !showCreateForm ? (
            <div className="text-center py-12 text-[#CD7F32]">
              <p>Select a quest from the list or create a new one</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-[#FFF8DC] font-semibold">Quest Information</h3>
                <input
                  type="text"
                  placeholder="Quest ID (e.g., QUEST_TRADE_01)"
                  value={form.quest_id}
                  onChange={(e) => setForm({ ...form, quest_id: e.target.value })}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC] placeholder-gray-500"
                  required
                />
                <select
                  value={form.faction_name}
                  onChange={(e) => setForm({ ...form, faction_name: e.target.value })}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                  required
                >
                  <option value="">Select Faction</option>
                  {factions.map(f => <option key={f.id} value={f.faction_name}>{f.faction_name}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Quest Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC] placeholder-gray-500"
                  required
                />
                <textarea
                  placeholder="Quest Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC] placeholder-gray-500 h-20"
                  required
                />
                <select
                  value={form.quest_type}
                  onChange={(e) => setForm({ ...form, quest_type: e.target.value })}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                  required
                >
                  <option value="law">Law (activate specific law)</option>
                  <option value="resource">Resource (deliver resources)</option>
                  <option value="region">Region (conquer territory)</option>
                  <option value="building">Building (construct building)</option>
                </select>
                <div>
                  <label className="text-[#FFF8DC] text-sm mb-2 block">Deadline (turns, 0 = no deadline)</label>
                  <input
                    type="number"
                    value={form.deadline_turns}
                    onChange={(e) => setForm({ ...form, deadline_turns: parseInt(e.target.value) })}
                    className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                  />
                </div>
              </div>

              {/* Requirement */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-[#FFF8DC] font-semibold">Requirement (JSON)</h3>
                  <p className="text-xs text-[#CD7F32] mt-1">
                    Examples: {'{'}food: 1000{'}'} | {'{'}law_id: "LAW_X", is_active: true{'}'} | {'{'}region_id: "REG_X", status: "Conquered"{'}'}
                  </p>
                </div>
                <textarea
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC] font-mono text-xs h-24"
                  placeholder='{"food": 1000}'
                />
              </div>

              {/* Rewards & Penalties */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="text-green-400 font-semibold">Rewards (Completion)</h3>
                  <div>
                    <label className="text-[#FFF8DC] text-sm">Loyalty</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.reward_loyalty}
                      onChange={(e) => setForm({ ...form, reward_loyalty: parseFloat(e.target.value) })}
                      className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                    />
                  </div>
                  <div>
                    <label className="text-[#FFF8DC] text-sm">Influence</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.reward_influence}
                      onChange={(e) => setForm({ ...form, reward_influence: parseFloat(e.target.value) })}
                      className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                    />
                  </div>
                  <div>
                    <label className="text-[#FFF8DC] text-sm">Favor Points</label>
                    <input
                      type="number"
                      value={form.reward_favor_points}
                      onChange={(e) => setForm({ ...form, reward_favor_points: parseInt(e.target.value) })}
                      className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-red-400 font-semibold">Penalties (Failure)</h3>
                  <div>
                    <label className="text-[#FFF8DC] text-sm">Loyalty</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.penalty_loyalty}
                      onChange={(e) => setForm({ ...form, penalty_loyalty: parseFloat(e.target.value) })}
                      className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                    />
                  </div>
                  <div>
                    <label className="text-[#FFF8DC] text-sm">Influence</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.penalty_influence}
                      onChange={(e) => setForm({ ...form, penalty_influence: parseFloat(e.target.value) })}
                      className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                    />
                  </div>
                </div>
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
                      {selectedQuest ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    selectedQuest ? 'Update Quest' : 'Create Quest'
                  )}
                </Button>
                {selectedQuest && (
                  <Button
                    type="button"
                    onClick={() => handleDelete(selectedQuest.id)}
                    variant="outline"
                    className="bg-red-900/20 border-red-600/50 text-red-400 hover:bg-red-900/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                {(selectedQuest || showCreateForm) && (
                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedQuest(null);
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