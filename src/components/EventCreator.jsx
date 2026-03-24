import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, X, Trash2 } from 'lucide-react';

export default function EventCreator() {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    event_id: '',
    title: '',
    description: '',
    choice_a_title: '',
    choice_b_title: ''
  });
  const [triggers, setTriggers] = useState([{ resource: 'gold', operator: '>', value: 0 }]);
  const [choiceAEffects, setChoiceAEffects] = useState([{ resource: 'gold', value: 0 }]);
  const [choiceBEffects, setChoiceBEffects] = useState([{ resource: 'gold', value: 0 }]);
  const [choiceAAlignment, setChoiceAAlignment] = useState([]);
  const [choiceBAlignment, setChoiceBAlignment] = useState([]);

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: async () => await base44.entities.EventMaster.list()
  });

  const { data: factions = [] } = useQuery({
    queryKey: ['factions'],
    queryFn: async () => await base44.entities.FactionRegistry.list()
  });

  const resources = ['gold', 'food', 'iron', 'wood', 'stability', 'mana', 'population'];
  const operators = ['>', '<', '==', '!=', '>=', '<='];
  const factionOptions = ['Gilded_Council', 'Common_Folk', 'Iron_Vanguard'];

  const buildConditionScript = () => triggers.map(t => `${t.resource} ${t.operator} ${t.value}`).join(' && ');

  const buildEffects = (effects) => {
    const result = {};
    effects.forEach(e => {
      if (e.resource.includes('_')) {
        if (!result.faction_updates) result.faction_updates = {};
        const factionName = e.resource.split('_')[1];
        result.faction_updates[factionName] = e.value;
      } else {
        result[e.resource] = e.value;
      }
    });
    return result;
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowCreateForm(false);
    setForm({
      event_id: event.event_id,
      title: event.title,
      description: event.description,
      choice_a_title: event.choice_a_title,
      choice_b_title: event.choice_b_title
    });
    const parsedTriggers = event.condition_script?.split(' && ').map(t => {
      const match = t.match(/(\w+)\s(>=|<=|==|!=|>|<)\s([\d.]+)/);
      return match ? { resource: match[1], operator: match[2], value: parseFloat(match[3]) } : null;
    }).filter(Boolean) || [{ resource: 'gold', operator: '>', value: 0 }];
    setTriggers(parsedTriggers);
    
    const parseEffects = (effObj) => {
      if (!effObj) return [{ resource: 'gold', value: 0 }];
      return Object.entries(effObj).map(([key, val]) => ({ resource: key, value: val }));
    };
    setChoiceAEffects(parseEffects(event.choice_a_effects));
    setChoiceBEffects(parseEffects(event.choice_b_effects));
    
    const parseAlignment = (alignObj) => {
      if (!alignObj || typeof alignObj !== 'object') return [];
      return Object.entries(alignObj).map(([faction, multiplier]) => ({ faction, multiplier }));
    };
    setChoiceAAlignment(parseAlignment(event.choice_a_faction_alignment));
    setChoiceBAlignment(parseAlignment(event.choice_b_faction_alignment));
  };

  const handleNewEvent = () => {
    setSelectedEvent(null);
    setShowCreateForm(true);
    setForm({ event_id: '', title: '', description: '', choice_a_title: '', choice_b_title: '' });
    setTriggers([{ resource: 'gold', operator: '>', value: 0 }]);
    setChoiceAEffects([{ resource: 'gold', value: 0 }]);
    setChoiceBEffects([{ resource: 'gold', value: 0 }]);
    setChoiceAAlignment([]);
    setChoiceBAlignment([]);
  };

  const buildAlignment = (alignments) => {
    const result = {};
    alignments.forEach(a => {
      result[a.faction] = a.multiplier;
    });
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = {
        event_id: form.event_id,
        title: form.title,
        description: form.description,
        condition_script: buildConditionScript(),
        choice_a_title: form.choice_a_title,
        choice_a_effects: buildEffects(choiceAEffects),
        choice_a_faction_alignment: buildAlignment(choiceAAlignment),
        choice_b_title: form.choice_b_title,
        choice_b_effects: buildEffects(choiceBEffects),
        choice_b_faction_alignment: buildAlignment(choiceBAlignment),
        is_triggered: selectedEvent?.is_triggered || false
      };

      if (selectedEvent) {
        await base44.entities.EventMaster.update(selectedEvent.id, data);
      } else {
        await base44.entities.EventMaster.create(data);
      }

      queryClient.invalidateQueries({ queryKey: ['events'] });
      setShowCreateForm(false);
      setSelectedEvent(null);
      alert(selectedEvent ? 'Event updated!' : 'Event created!');
    } catch (error) {
      alert('Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await base44.entities.EventMaster.delete(id);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setSelectedEvent(null);
    } catch (error) {
      alert('Failed to delete event');
    }
  };

  const renderEffectRow = (effects, setEffects, index) => {
    const effect = effects[index];
    return (
      <div key={index} className="flex gap-2 items-end">
        <select
          value={effect.resource}
          onChange={(e) => {
            const newEffects = [...effects];
            newEffects[index].resource = e.target.value;
            setEffects(newEffects);
          }}
          className="bg-[#101012] border border-orange-600/50 rounded px-2 py-2 text-[#FFF8DC] flex-1"
        >
          {resources.map(r => <option key={r} value={r}>{r}</option>)}
          <optgroup label="Factions">
            {factionOptions.map(f => <option key={f} value={f}>{f}</option>)}
          </optgroup>
        </select>
        <input
          type="number"
          step="0.01"
          value={effect.value}
          onChange={(e) => {
            const newEffects = [...effects];
            newEffects[index].value = parseFloat(e.target.value);
            setEffects(newEffects);
          }}
          placeholder="Value"
          className="bg-[#101012] border border-orange-600/50 rounded px-2 py-2 text-[#FFF8DC] w-20"
        />
        <button
          type="button"
          onClick={() => setEffects(effects.filter((_, i) => i !== index))}
          className="text-orange-600 hover:text-orange-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Left - Events List */}
      <Card className="bg-[#1a1a1c] border-2 border-orange-600 col-span-1 flex flex-col">
        <CardHeader className="border-b border-orange-600">
          <CardTitle className="text-orange-400 text-lg">Events</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 flex-1 overflow-y-auto">
          <Button
            onClick={handleNewEvent}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white mb-4 gap-2"
          >
            <Plus className="w-4 h-4" /> New Event
          </Button>
          <div className="space-y-2">
            {events.length === 0 ? (
              <p className="text-[#CD7F32] text-sm text-center py-8">No events yet</p>
            ) : (
              events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => handleSelectEvent(event)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedEvent?.id === event.id
                      ? 'bg-orange-600/30 border-orange-600 text-[#FFF8DC]'
                      : 'bg-[#101012] border-orange-600/20 text-[#CD7F32] hover:border-orange-600/50'
                  }`}
                >
                  <p className="font-semibold text-sm">{event.title}</p>
                  <p className="text-xs opacity-70 mt-1">{event.event_id}</p>
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
            {showCreateForm ? 'New Event' : selectedEvent ? 'Edit Event' : 'Select an Event'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 flex-1 overflow-y-auto">
          {!selectedEvent && !showCreateForm ? (
            <div className="text-center py-12 text-[#CD7F32]">Select or create an event</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-3">
                <h3 className="text-[#FFF8DC] font-semibold text-sm">Event Info</h3>
                <input
                  type="text"
                  placeholder="Event ID"
                  value={form.event_id}
                  onChange={(e) => setForm({ ...form, event_id: e.target.value })}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC] text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Event Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC] text-sm"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC] h-16 text-sm"
                  required
                />
              </div>

              {/* Triggers */}
              <div className="space-y-2">
                <h3 className="text-[#FFF8DC] font-semibold text-sm">Conditions</h3>
                <div className="space-y-1">
                  {triggers.map((trigger, idx) => (
                    <div key={idx} className="flex gap-2 items-end text-sm">
                      <select
                        value={trigger.resource}
                        onChange={(e) => {
                          const newT = [...triggers];
                          newT[idx].resource = e.target.value;
                          setTriggers(newT);
                        }}
                        className="bg-[#101012] border border-orange-600/50 rounded px-2 py-1 text-[#FFF8DC] flex-1"
                      >
                        {resources.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <select
                        value={trigger.operator}
                        onChange={(e) => {
                          const newT = [...triggers];
                          newT[idx].operator = e.target.value;
                          setTriggers(newT);
                        }}
                        className="bg-[#101012] border border-orange-600/50 rounded px-2 py-1 text-[#FFF8DC] w-14"
                      >
                        {operators.map(op => <option key={op} value={op}>{op}</option>)}
                      </select>
                      <input
                        type="number"
                        value={trigger.value}
                        onChange={(e) => {
                          const newT = [...triggers];
                          newT[idx].value = parseFloat(e.target.value);
                          setTriggers(newT);
                        }}
                        className="bg-[#101012] border border-orange-600/50 rounded px-2 py-1 text-[#FFF8DC] w-16"
                      />
                      <button
                        type="button"
                        onClick={() => setTriggers(triggers.filter((_, i) => i !== idx))}
                        className="text-orange-600 hover:text-orange-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setTriggers([...triggers, { resource: 'gold', operator: '>', value: 0 }])}
                  className="text-orange-400 hover:text-orange-300 text-xs flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Condition
                </button>
              </div>

              {/* Choices */}
              <div className="grid grid-cols-2 gap-4">
                {/* Choice A */}
                <div className="space-y-2 border-l-2 border-teal-600 pl-3">
                  <h3 className="text-teal-400 font-semibold text-sm">Choice A</h3>
                  <input
                    type="text"
                    placeholder="Title"
                    value={form.choice_a_title}
                    onChange={(e) => setForm({ ...form, choice_a_title: e.target.value })}
                    className="w-full bg-[#101012] border border-orange-600/50 rounded px-2 py-1 text-[#FFF8DC] text-sm"
                    required
                  />
                  <div className="space-y-1">
                    <p className="text-xs text-teal-400/70">Effects:</p>
                    {choiceAEffects.map((_, idx) => renderEffectRow(choiceAEffects, setChoiceAEffects, idx))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setChoiceAEffects([...choiceAEffects, { resource: 'gold', value: 0 }])}
                    className="text-teal-400 hover:text-teal-300 text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Effect
                  </button>
                  
                  <div className="space-y-1 pt-2 mt-2 border-t border-teal-600/30">
                    <p className="text-xs text-teal-400/70">Faction Alignment:</p>
                    {choiceAAlignment.map((align, idx) => (
                      <div key={idx} className="flex gap-1 items-end text-xs">
                        <select
                          value={align.faction}
                          onChange={(e) => {
                            const newAlign = [...choiceAAlignment];
                            newAlign[idx].faction = e.target.value;
                            setChoiceAAlignment(newAlign);
                          }}
                          className="bg-[#101012] border border-teal-600/50 rounded px-1 py-1 text-[#FFF8DC] flex-1 text-xs"
                        >
                          <option value="">Select faction</option>
                          {factions.map(f => <option key={f.id} value={f.faction_name}>{f.faction_name}</option>)}
                        </select>
                        <input
                          type="number"
                          step="0.1"
                          value={align.multiplier}
                          onChange={(e) => {
                            const newAlign = [...choiceAAlignment];
                            newAlign[idx].multiplier = parseFloat(e.target.value);
                            setChoiceAAlignment(newAlign);
                          }}
                          placeholder="×"
                          className="bg-[#101012] border border-teal-600/50 rounded px-1 py-1 text-[#FFF8DC] w-12 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setChoiceAAlignment(choiceAAlignment.filter((_, i) => i !== idx))}
                          className="text-teal-600 hover:text-teal-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setChoiceAAlignment([...choiceAAlignment, { faction: '', multiplier: 1 }])}
                      className="text-teal-400/70 hover:text-teal-300 text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Faction
                    </button>
                  </div>
                </div>

                {/* Choice B */}
                <div className="space-y-2 border-l-2 border-red-600 pl-3">
                  <h3 className="text-red-400 font-semibold text-sm">Choice B</h3>
                  <input
                    type="text"
                    placeholder="Title"
                    value={form.choice_b_title}
                    onChange={(e) => setForm({ ...form, choice_b_title: e.target.value })}
                    className="w-full bg-[#101012] border border-orange-600/50 rounded px-2 py-1 text-[#FFF8DC] text-sm"
                    required
                  />
                  <div className="space-y-1">
                    <p className="text-xs text-red-400/70">Effects:</p>
                    {choiceBEffects.map((_, idx) => renderEffectRow(choiceBEffects, setChoiceBEffects, idx))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setChoiceBEffects([...choiceBEffects, { resource: 'gold', value: 0 }])}
                    className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Effect
                  </button>
                  
                  <div className="space-y-1 pt-2 mt-2 border-t border-red-600/30">
                    <p className="text-xs text-red-400/70">Faction Alignment:</p>
                    {choiceBAlignment.map((align, idx) => (
                      <div key={idx} className="flex gap-1 items-end text-xs">
                        <select
                          value={align.faction}
                          onChange={(e) => {
                            const newAlign = [...choiceBAlignment];
                            newAlign[idx].faction = e.target.value;
                            setChoiceBAlignment(newAlign);
                          }}
                          className="bg-[#101012] border border-red-600/50 rounded px-1 py-1 text-[#FFF8DC] flex-1 text-xs"
                        >
                          <option value="">Select faction</option>
                          {factions.map(f => <option key={f.id} value={f.faction_name}>{f.faction_name}</option>)}
                        </select>
                        <input
                          type="number"
                          step="0.1"
                          value={align.multiplier}
                          onChange={(e) => {
                            const newAlign = [...choiceBAlignment];
                            newAlign[idx].multiplier = parseFloat(e.target.value);
                            setChoiceBAlignment(newAlign);
                          }}
                          placeholder="×"
                          className="bg-[#101012] border border-red-600/50 rounded px-1 py-1 text-[#FFF8DC] w-12 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setChoiceBAlignment(choiceBAlignment.filter((_, i) => i !== idx))}
                          className="text-red-600 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setChoiceBAlignment([...choiceBAlignment, { faction: '', multiplier: 1 }])}
                      className="text-red-400/70 hover:text-red-300 text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Faction
                    </button>
                  </div>
                </div>
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
                      {selectedEvent ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    selectedEvent ? 'Update' : 'Create'
                  )}
                </Button>
                {selectedEvent && (
                  <Button
                    type="button"
                    onClick={() => handleDelete(selectedEvent.id)}
                    variant="outline"
                    className="bg-red-900/20 border-red-600/50 text-red-400 hover:bg-red-900/40 text-sm"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => {
                    setSelectedEvent(null);
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