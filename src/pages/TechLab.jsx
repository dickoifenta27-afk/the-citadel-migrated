import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const categoryColors = {
  Economy: 'from-yellow-600 to-yellow-700',
  Military: 'from-red-600 to-red-700',
  Civic: 'from-blue-600 to-blue-700',
  Mystical: 'from-purple-600 to-purple-700'
};

export default function TechLab() {
  const { gameState, refetch } = useOutletContext();
  const [selectedCategory, setSelectedCategory] = useState('Economy');
  const queryClient = useQueryClient();

  const { data: technologies = [], isLoading } = useQuery({
    queryKey: ['technologies'],
    queryFn: async () => await base44.entities.TechnologyTree.list(),
    staleTime: 30000
  });

  const researchMutation = useMutation({
    mutationFn: async (techId) => {
      const tech = technologies.find((t) => t.id === techId);
      await base44.entities.TechnologyTree.update(techId, {
        is_researching: true,
        research_progress: 0
      });

      await base44.entities.UserState.update(gameState.id, {
        gold: gameState.gold - tech.research_cost_gold,
        mana: Math.max(0, gameState.mana - tech.research_cost_mana)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] });
      refetch();
    }
  });

  if (isLoading) {
    return <div className="text-[#e0e0e0]">Loading technologies...</div>;
  }

  const categories = ['Economy', 'Military', 'Civic', 'Mystical'];
  const filteredTechs = technologies.filter((t) => t.category === selectedCategory);

  const canResearch = (tech) => {
    if (tech.is_researched || tech.is_researching) return false;
    if (gameState.gold < tech.research_cost_gold) return false;
    if (gameState.mana < tech.research_cost_mana) return false;

    for (const prereqId of tech.prerequisites || []) {
      const prereq = technologies.find((t) => t.tech_id === prereqId);
      if (!prereq || !prereq.is_researched) return false;
    }
    return true;
  };

  return (
    <div className="relative min-h-screen" style={{
      backgroundImage: "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.60)), url('https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/c5b6c74df_generated_image.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="relative p-6" style={{ zIndex: 1 }}>
      






        

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[#cd7f32]/50 pb-4">
        {categories.map((cat) =>
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            selectedCategory === cat ?
            'bg-gradient-to-r ' + categoryColors[cat] + ' text-white shadow-lg' :
            'bg-[#141417] text-[#cd7f32] border border-[#cd7f32]/50 hover:border-[#cd7f32]'}`
            }>
            
            {cat}
          </button>
          )}
      </div>

      {/* Tech Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTechs.map((tech) => {
            const canStart = canResearch(tech);
            const isLocked = !tech.is_researched && !tech.is_researching && !canStart;

            const borderClass = tech.is_researched ?
            'border-green-500 shadow-lg shadow-green-500/20' :
            tech.is_researching ?
            'border-blue-500 shadow-lg shadow-blue-500/20' :
            isLocked ?
            'border-[#cd7f32]/30 opacity-60' :
            'border-[#cd7f32] hover:shadow-lg hover:shadow-[#cd7f32]/30';

            return (
              <Card key={tech.id} style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }} className={'border-2 transition-all ' + borderClass}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-[#ffd700] text-lg mb-1">{tech.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#0a0a0c] text-[#cd7f32] border border-[#cd7f32]/50">
                        Tier {tech.tier}
                      </span>
                      {tech.is_researched &&
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        }
                      {tech.is_researching &&
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        }
                      {isLocked &&
                        <Lock className="w-4 h-4 text-[#cd7f32]/50" />
                        }
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-[#e0e0e0] text-sm leading-relaxed">{tech.description}</p>

                {/* Costs */}
                <div className="bg-black/40 rounded-lg p-3 border border-[#cd7f32]/30 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#cd7f32]">Research Cost:</span>
                    <span className="text-[#ffd700] font-semibold">{tech.research_cost_gold} Gold</span>
                  </div>
                  {tech.research_cost_mana > 0 &&
                    <div className="flex justify-between text-xs">
                      <span className="text-[#cd7f32]">Mana Cost:</span>
                      <span className="text-purple-400 font-semibold">{tech.research_cost_mana} Mana</span>
                    </div>
                    }
                  <div className="flex justify-between text-xs">
                    <span className="text-[#cd7f32]">Research Time:</span>
                    <span className="text-[#ffd700] font-semibold">{tech.research_turns} turns</span>
                  </div>
                </div>

                {/* Effects */}
                {tech.effects && Object.keys(tech.effects).length > 0 &&
                <div className="bg-[#B8860B]/10 rounded-lg p-3 border border-[#B8860B]/30">
                   <p className="text-[#C9A84C] text-xs font-semibold mb-2">Effects:</p>
                  {Object.entries(tech.effects).map(([key, value]) =>
                  <div key={key} className="text-xs text-[#e0e0e0] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#C9A84C]" />
                        {key.replace(/_/g, ' ')}: <span className="text-[#ffd700] font-semibold">+{value}</span>
                      </div>
                    )}
                  </div>
                  }

                {/* Research Progress */}
                {tech.is_researching &&
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#cd7f32]">Progress:</span>
                      <span className="text-blue-400">{tech.research_progress} / {tech.research_turns} turns</span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-2 border border-blue-500/50">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${tech.research_progress / tech.research_turns * 100}%` }} />
                      
                    </div>
                  </div>
                  }

                {/* Action Button */}
                {!tech.is_researched && !tech.is_researching &&
                  <Button
                    onClick={() => researchMutation.mutate(tech.id)}
                    disabled={!canStart || researchMutation.isPending}
                    className={`w-full font-bold ${
                    canStart ?
                    'bg-gradient-to-r from-[#B8860B] to-[#8B6508] hover:from-[#C9A84C] hover:to-[#B8860B] text-[#1a1000]' :
                    'bg-[#2a2a2c] text-[#606060] cursor-not-allowed'}`
                    }>
                    
                    {researchMutation.isPending ? 'Starting...' : 'Start Research'}
                  </Button>
                  }

                {tech.is_researched &&
                  <div className="text-center py-2 text-green-500 text-sm font-semibold">
                    ✓ Research Complete
                  </div>
                  }
              </CardContent>
            </Card>);

          })}
      </div>

      {filteredTechs.length === 0 &&
        <div className="text-center py-12 text-[#cd7f32]">
          No technologies available in this category
        </div>
        }
      </div>
    </div>);

}