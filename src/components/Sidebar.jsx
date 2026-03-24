import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Code, Crown } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, isDeveloper, user } = useAuth();
  


  const menuItems = [
    { name: 'Citadel', path: '/Citadel', emblem: 'https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/4239e63f3_generated_image.png' },
    { name: 'Marketplace', path: '/Marketplace', emblem: 'https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/d0ea9d3a2_generated_image.png' },
    { name: 'Hall of Laws', path: '/HallOfLawsPage', emblem: 'https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/6a2f226c2_generated_image.png' },
    { name: 'Diplomacy', path: '/Diplomacy', emblem: 'https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/d51106d0e_generated_image.png' },
    { name: 'War Room', path: '/WarRoom', emblem: 'https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/f0ae537e9_generated_image.png' },
    { name: 'Tech Lab', path: '/TechLab', emblem: 'https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/c2ecfa1e8_generated_image.png' },
    { name: 'Infrastructure', path: '/Infrastructure', emblem: 'https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/f519088d0_generated_image.png' },
  ];

  const developerItems = [
    { name: 'Architect', path: '/Architect', emblem: 'https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/08c4df216_generated_image.png' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="relative h-full z-40 flex-shrink-0 w-64 flex flex-col"
      style={{ borderRight: '1px solid var(--color-border-active)', boxShadow: '2px 0 20px rgba(0,0,0,0.6)' }}>

      {/* Header */}
      <div className="flex items-center justify-center h-24 px-4" style={{ borderBottom: '1px solid var(--color-border-active)' }}>
        <img
          src="https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/7d791a42f_logo_text_transparent.png"
          alt="The Citadel"
          style={{ width: '100%', maxWidth: 200, height: 'auto', objectFit: 'contain', mixBlendMode: 'lighten', filter: 'brightness(1.2) drop-shadow(0 0 6px rgba(201,168,76,0.5))' }}
        />
      </div>



      {/* Navigation */}
      <nav className="mt-2 space-y-1 px-2 flex-1">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link key={item.path} to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
              style={active ? {
                background: 'linear-gradient(to right, rgba(201,168,76,0.85), rgba(139,105,20,0.7))',
                color: '#0A0A0F',
                boxShadow: '0 2px 12px var(--color-gold-glow)',
                fontWeight: 600
              } : { color: 'var(--color-text-accent)' }}>
              <img src={item.emblem} alt={item.name}
                style={{ width: 42, height: 42, objectFit: 'contain', flexShrink: 0,
                  filter: active ? 'drop-shadow(0 0 8px gold)' : 'none' }} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Developer Section - Only for Developers */}
      {isDeveloper && (
        <div className="pt-2 px-2 space-y-1" style={{ borderTop: '1px solid var(--color-border-active)' }}>
          <div className="px-4 py-1 flex items-center gap-2">
            <Code className="w-3 h-3" style={{ color: '#C9A84C' }} />
            <span className="text-[9px] uppercase tracking-wider font-bold" style={{ color: '#8B7355' }}>
              Developer
            </span>
          </div>
          {developerItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border-l-2 transition-all"
                style={{ color: 'var(--color-text-accent)', borderLeftColor: active ? 'var(--color-gold-primary)' : 'var(--color-border-default)',
                  background: active ? 'rgba(201,168,76,0.1)' : 'transparent' }}>
                <img src={item.emblem} alt={item.name}
                  style={{ width: 42, height: 42, objectFit: 'contain', flexShrink: 0,
                    filter: active ? 'brightness(1.4) drop-shadow(0 0 8px gold)' : 'brightness(0.6) grayscale(0.3)' }} />
                <span className="font-medium text-xs uppercase tracking-wider">{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* User Info & Actions */}
      <div className="p-3 space-y-2" style={{ borderTop: '1px solid var(--color-border-active)' }}>
        {/* User Badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: 'rgba(201,168,76,0.1)' }}
        >
          <Crown className="w-4 h-4" style={{ color: '#C9A84C' }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs truncate" style={{ color: '#E0E0E0' }}>
              {user?.email || 'Player'}
            </p>
            {isDeveloper && (
              <p className="text-[9px]" style={{ color: '#8B7355' }}>
                Developer Access
              </p>
            )}
          </div>
        </div>

        {/* Main Menu Button */}
        <button onClick={() => navigate('/MainMenu')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm"
          style={{ color: 'var(--color-text-accent)', background: 'rgba(0,0,0,0.3)' }}>
          <LogOut className="w-4 h-4" />
          <span>Main Menu</span>
        </button>

        {/* Logout Button */}
        <button 
          onClick={async () => {
            await signOut();
            // Force redirect to login
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm"
          style={{ color: '#E74C3C', background: 'rgba(192, 57, 43, 0.1)' }}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}