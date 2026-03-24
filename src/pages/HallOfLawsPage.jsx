import React from 'react';
import { useOutletContext } from 'react-router-dom';
import HallOfLaws from '@/components/HallOfLaws';

export default function HallOfLawsPage() {
  const { gameState } = useOutletContext();

  return (
    <div className="relative min-h-screen" style={{
      backgroundImage: "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.60)), url('https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/6f25335ac_generated_image.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="relative p-6" style={{ zIndex: 1 }}>
        






        
        <div>
          <HallOfLaws gameState={gameState} />
        </div>
      </div>
    </div>);

}