import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const FIELDS = [
  { key: 'food_consumption_rate', label: 'Food Consumption Rate', desc: 'Food consumed per population per turn', step: 0.01 },
  { key: 'base_tax_rate', label: 'Base Tax Rate', desc: 'Base gold income per population per turn', step: 0.01 },
  { key: 'prosperity_tax_bonus', label: 'Prosperity Tax Bonus (max)', desc: 'Max additional tax rate from max prosperity', step: 0.01 },
  { key: 'corruption_per_10k_pop', label: 'Corruption per 10k Pop', desc: 'Corruption rate increase per 10,000 population', step: 0.01 },
  { key: 'max_corruption_cap', label: 'Max Corruption Cap', desc: 'Maximum corruption rate (0-1)', step: 0.01 },
  { key: 'region_iron_yield_multiplier', label: 'Region Iron Yield Multiplier', desc: 'Iron per richness point from conquered regions', step: 1 },
  { key: 'region_food_yield_multiplier', label: 'Region Food Yield Multiplier', desc: 'Food per richness point from conquered regions', step: 1 },
  { key: 'council_request_chance', label: 'Council Request Chance', desc: 'Probability of council request per turn (0-1)', step: 0.01 },
  { key: 'base_pp', label: 'Base PP Regen', desc: 'Base Political Points regenerated per turn', step: 1 },
  { key: 'min_pp', label: 'Min PP (after strain)', desc: 'Floor for PP regen after administrative strain', step: 1 },
  { key: 'strain_threshold', label: 'Strain Threshold (buildings)', desc: 'Buildings before each -1 PP strain penalty', step: 1 },
  { key: 'starvation_stability_penalty', label: 'Starvation Stability Penalty', desc: 'Stability lost per turn when food = 0', step: 0.01 },
  { key: 'starvation_population_penalty', label: 'Starvation Population Penalty', desc: 'Fraction of population lost per starvation turn', step: 0.01 },
  { key: 'starvation_prosperity_penalty', label: 'Starvation Prosperity Penalty', desc: 'Prosperity lost per turn when food = 0', step: 0.01 },
];

const DEFAULTS = {
  config_id: 'main',
  food_consumption_rate: 0.5,
  base_tax_rate: 0.5,
  prosperity_tax_bonus: 0.5,
  corruption_per_10k_pop: 0.05,
  max_corruption_cap: 0.4,
  region_iron_yield_multiplier: 100,
  region_food_yield_multiplier: 100,
  council_request_chance: 0.2,
  base_pp: 10,
  min_pp: 7,
  strain_threshold: 25,
  starvation_stability_penalty: 0.05,
  starvation_population_penalty: 0.02,
  starvation_prosperity_penalty: 0.05,
};

export default function GameConfigEditor() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(DEFAULTS);
  const [isSaving, setIsSaving] = useState(false);
  const [configId, setConfigId] = useState(null);

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['gameConfig'],
    queryFn: () => base44.entities.GameConfig.list(),
  });

  useEffect(() => {
    if (configs.length > 0) {
      const cfg = configs[0];
      setConfigId(cfg.id);
      setForm({ ...DEFAULTS, ...cfg });
    }
  }, [configs]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (configId) {
        await base44.entities.GameConfig.update(configId, form);
      } else {
        const created = await base44.entities.GameConfig.create(form);
        setConfigId(created.id);
      }
      queryClient.invalidateQueries({ queryKey: ['gameConfig'] });
      alert('Game config saved!');
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="text-orange-400 py-8 text-center">Loading...</div>;

  return (
    <Card className="bg-[#1a1a1c] border-2 border-orange-600">
      <CardHeader className="border-b border-orange-600">
        <CardTitle className="text-orange-400 text-lg">⚙️ Game Constants</CardTitle>
        <p className="text-[#CD7F32] text-sm mt-1">These values control core game balance. Changes take effect on the next End Turn.</p>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-2 gap-4">
            {FIELDS.map(({ key, label, desc, step }) => (
              <div key={key} className="space-y-1">
                <label className="text-[#FFF8DC] text-sm font-semibold">{label}</label>
                <p className="text-[#CD7F32] text-xs">{desc}</p>
                <input
                  type="number"
                  step={step}
                  value={form[key] ?? DEFAULTS[key]}
                  onChange={(e) => setForm({ ...form, [key]: parseFloat(e.target.value) })}
                  className="w-full bg-[#101012] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button type="submit" disabled={isSaving} className="bg-orange-600 hover:bg-orange-700 text-white">
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Config'}
            </Button>
            <button
              type="button"
              onClick={() => setForm(DEFAULTS)}
              className="text-[#CD7F32] hover:text-orange-400 text-sm underline"
            >
              Reset to Defaults
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}