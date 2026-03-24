import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CouncilEditor() {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [councilData, setCouncilData] = useState({});
  const [activeTab, setActiveTab] = useState('');

  const { data: councilMembers = [] } = useQuery({
    queryKey: ['councilMembers'],
    queryFn: async () => {
      const members = await base44.entities.CouncilMember.list();
      const dataObj = {};
      members.forEach(m => {
        dataObj[m.faction_name] = {
          id: m.id,
          spokesperson_name: m.spokesperson_name,
          seat_count: m.seat_count,
          favor_points: m.favor_points
        };
      });
      setCouncilData(dataObj);
      if (members.length > 0 && !activeTab) {
        setActiveTab(members[0].faction_name);
      }
      return members;
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const faction in councilData) {
        const data = councilData[faction];
        const member = councilMembers.find(m => m.faction_name === faction);
        if (member) {
          await base44.entities.CouncilMember.update(member.id, {
            faction_name: faction,
            spokesperson_name: data.spokesperson_name,
            seat_count: data.seat_count,
            favor_points: data.favor_points
          });
        }
      }
      queryClient.invalidateQueries({ queryKey: ['councilMembers'] });
      alert('Council settings saved!');
    } catch (error) {
      alert('Failed to save council settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-[#1a1a1c] border-2 border-orange-600 h-[calc(100vh-200px)]">
      <CardHeader className="border-b border-orange-600">
        <CardTitle className="text-orange-400">Council Editor</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 h-[calc(100%-80px)] flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="bg-[#101012] border-b border-orange-600/30 mb-4">
            {councilMembers.map((member) => (
              <TabsTrigger
                key={member.faction_name}
                value={member.faction_name}
                className="data-[state=active]:border-b-2 data-[state=active]:border-orange-600"
              >
                {member.faction_name}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            {councilMembers.map((member) => (
              <TabsContent
                key={member.faction_name}
                value={member.faction_name}
                className="space-y-4"
              >
                <div className="bg-[#101012] border border-orange-600/30 rounded-lg p-6 space-y-5">
                  <div>
                    <label className="text-[#CD7F32] text-sm font-medium block mb-2">Spokesperson Name</label>
                    <input
                      type="text"
                      value={councilData[member.faction_name]?.spokesperson_name || ''}
                      onChange={(e) =>
                        setCouncilData({
                          ...councilData,
                          [member.faction_name]: {
                            ...councilData[member.faction_name],
                            spokesperson_name: e.target.value
                          }
                        })
                      }
                      className="w-full bg-[#1a1a1c] border border-orange-600/50 rounded px-3 py-2 text-[#FFF8DC]"
                    />
                  </div>

                  <div>
                    <label className="text-[#CD7F32] text-sm font-medium block mb-2">
                      Seat Count: <span className="text-orange-400">{councilData[member.faction_name]?.seat_count || 0}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={councilData[member.faction_name]?.seat_count || 0}
                      onChange={(e) =>
                        setCouncilData({
                          ...councilData,
                          [member.faction_name]: {
                            ...councilData[member.faction_name],
                            seat_count: parseInt(e.target.value)
                          }
                        })
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="bg-[#0a0a0c] border border-orange-600/20 rounded p-3">
                    <p className="text-[#CD7F32] text-xs">
                      Favor Points: <span className="text-orange-400 font-semibold">{councilData[member.faction_name]?.favor_points || 0}</span>
                    </p>
                    <p className="text-[#CD7F32] text-xs mt-2 opacity-70">Updated via council requests during gameplay</p>
                  </div>
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white mt-4"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Council Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}