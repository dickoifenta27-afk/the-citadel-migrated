import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Loader2, AlertCircle } from 'lucide-react';

export default function LawManageModal({ law, onClose, gameState }) {
  const queryClient = useQueryClient();
  const [intensity, setIntensity] = useState(law.intensity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [powerfulFaction, setPowerfulFaction] = useState(null);

  const { data: councilMembers = [] } = useQuery({
    queryKey: ['councilMembers'],
    queryFn: async () => {
      return await base44.entities.CouncilMember.list();
    }
  });

  // Check if there's a faction with > 40% seats (8+ out of 20)
  useEffect(() => {
    const powerful = councilMembers.find(c => c.seat_count >= 8);
    setPowerfulFaction(powerful);
  }, [councilMembers]);

  const foodCost = gameState ? (gameState.population * (intensity / 100) * 0.5).toFixed(0) : 0;

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await base44.entities.LawLibrary.update(law.id, {
        ...law,
        intensity
      });
      queryClient.invalidateQueries({ queryKey: ['laws'] });
    } catch (error) {
      console.error('Error saving law:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await base44.entities.LawLibrary.update(law.id, {
        ...law,
        is_active: !law.is_active
      });
      queryClient.invalidateQueries({ queryKey: ['laws'] });
      onClose();
    } catch (error) {
      console.error('Error toggling law:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-slate-800 border-slate-700 w-full max-w-md">
        <CardHeader className="flex flex-row justify-between items-start">
          <CardTitle className="text-white">{law.name}</CardTitle>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-300 text-sm">{law.description}</p>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-slate-300 text-sm font-medium">Intensity</label>
              <span className="text-teal-400 font-bold">{intensity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="bg-slate-700 rounded-lg p-3 space-y-2">
            <h4 className="text-slate-200 font-medium text-sm">Impact Preview</h4>
            <div className="text-sm text-slate-300 space-y-1">
              <p>🍎 Food Cost: <span className="text-red-400 font-semibold">{foodCost}</span> per turn</p>
              <p>😊 Stability Bonus: <span className="text-green-400 font-semibold">+0.02</span> per turn</p>
              <p>👥 Common Folk: <span className="text-blue-400 font-semibold">+{(0.03 * intensity / 100).toFixed(3)}</span> loyalty</p>
              <p>💰 Gilded Council: <span className="text-red-400 font-semibold">-{(0.01 * intensity / 100).toFixed(3)}</span> loyalty</p>
            </div>
          </div>

          {powerfulFaction && !law.is_active && (
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-200">
                <p className="font-semibold mb-1">⚠️ Parliamentary Constraint</p>
                <p>{powerfulFaction.faction_name} holds {powerfulFaction.seat_count}/20 seats (>40%).</p>
                <p className="mt-1">Activation cost:</p>
                <p>• <span className="font-bold text-yellow-400">2x Gold</span> OR</p>
                <p>• <span className="font-bold text-teal-400">5 Favor Points</span> from {powerfulFaction.faction_name}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isUpdating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
            <Button
              onClick={handleToggle}
              disabled={isUpdating}
              className={`flex-1 ${
                law.is_active
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {law.is_active ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}