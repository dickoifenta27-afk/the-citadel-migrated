import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Shield, User, Zap, Save } from 'lucide-react';

const ADVISORS = [
  { id: 'elric', name: 'Lord Elric', title: 'Royal Treasurer', color: '#ffd700', icon: Coins },
  { id: 'valerius', name: 'Cdr. Valerius', title: 'War Marshal', color: '#ef4444', icon: Shield },
  { id: 'seraphina', name: 'Lady Seraphina', title: 'High Steward', color: '#38bdf8', icon: User },
  { id: 'silas', name: 'Master Silas', title: 'Arcane Advisor', color: '#a855f7', icon: Zap },
];

const STORAGE_KEY = 'advisory_images';

export function getAdvisoryImages() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export default function AdvisoryConfigEditor() {
  const [images, setImages] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setImages(getAdvisoryImages());
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-orange-400 mb-1">Advisory Board Portraits</h2>
        <p className="text-[#cd7f32] text-sm">Set portrait image URL for each Royal Advisor. Leave blank to use default icon.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ADVISORS.map(advisor => {
          const Icon = advisor.icon;
          const imgUrl = images[advisor.id] || '';
          return (
            <Card key={advisor.id} className="bg-[#141417] border-[#cd7f32]/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2" style={{ color: advisor.color }}>
                  <Icon className="w-4 h-4" />
                  {advisor.name}
                  <span className="text-[#e0e0e0]/40 font-normal text-xs">— {advisor.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3 items-start">
                  {/* Preview */}
                  <div
                    className="w-16 h-16 rounded-md border flex items-center justify-center shrink-0 overflow-hidden"
                    style={{ borderColor: advisor.color + '55', background: 'rgba(0,0,0,0.4)' }}
                  >
                    {imgUrl ? (
                      <img src={imgUrl} alt={advisor.name} className="w-full h-full object-cover" />
                    ) : (
                      <Icon className="w-7 h-7" style={{ color: advisor.color }} />
                    )}
                  </div>
                  {/* Input */}
                  <div className="flex-1">
                    <label className="text-[10px] text-[#e0e0e0]/50 uppercase tracking-wide mb-1 block">Image URL</label>
                    <input
                      type="text"
                      className="w-full bg-[#0a0a0c] border border-[#cd7f32]/30 rounded px-3 py-2 text-xs text-[#e0e0e0] placeholder-[#e0e0e0]/30 focus:outline-none focus:border-[#cd7f32]/70"
                      placeholder="https://example.com/portrait.png"
                      value={imgUrl}
                      onChange={e => setImages(prev => ({ ...prev, [advisor.id]: e.target.value }))}
                    />
                    <p className="text-[10px] text-[#e0e0e0]/30 mt-1">Recommended: square image, min 64×64px</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button
        onClick={handleSave}
        className="bg-orange-600 hover:bg-orange-500 text-white flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        {saved ? 'Saved!' : 'Save Portraits'}
      </Button>
    </div>
  );
}