import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FactionStatus from '@/components/FactionStatus';
import ParliamentSeats from '@/components/ParliamentSeats';
import CouncilSpokesperson from '@/components/CouncilSpokesperson';

export default function Diplomacy() {
  const { gameState } = useOutletContext();
  const [activeTab, setActiveTab] = useState('factions');

  return (
    <div className="relative min-h-screen" style={{
      backgroundImage: "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.60)), url('https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/585e32815_generated_image.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="relative p-6" style={{ zIndex: 1 }}>
      






        

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 border border-[#cd7f32]/40 mb-6" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
          <TabsTrigger
              value="factions"
              className="data-[state=active]:bg-[#B8860B] data-[state=active]:text-[#1a1000] text-[#cd7f32]">
              
            Faction Status
          </TabsTrigger>
          <TabsTrigger
              value="parliament"
              className="data-[state=active]:bg-[#B8860B] data-[state=active]:text-[#1a1000] text-[#cd7f32]">
              
            Parliament
          </TabsTrigger>
        </TabsList>

        <TabsContent value="factions" className="space-y-6">
          <Card className="border-2 border-[#cd7f32]/60" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
            <CardHeader>
              <CardTitle className="text-[#ffd700] text-xl">Faction Relations</CardTitle>
            </CardHeader>
            <CardContent>
              <FactionStatus />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parliament" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ParliamentSeats gameState={gameState} />
            <CouncilSpokesperson />
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>);

}