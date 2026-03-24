import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import * as XLSX from 'xlsx';
import EventCreator from '@/components/EventCreator';
import LawEditor from '@/components/LawEditor';
import ScenarioManager from '@/components/ScenarioManager';
import CouncilEditor from '@/components/CouncilEditor';
import ElectionCycleEditor from '@/components/ElectionCycleEditor';
import RegionEditor from '@/components/RegionEditor';
import BuildingManager from '@/components/BuildingManager';
import BuildingStatsEditor from '@/components/BuildingStatsEditor';
import FactionQuestEditor from '@/components/FactionQuestEditor';
import TechnologyTreeEditor from '@/components/TechnologyTreeEditor';
import ProsperityEditor from '@/components/ProsperityEditor';
import GameConfigEditor from '@/components/GameConfigEditor';
import AdvisoryGuideEditor from '@/components/AdvisoryGuideEditor';
import AiAssetGenerator from '@/components/AiAssetGenerator';
import AssetManager from '@/components/AssetManager';

const ENTITY_EXPORTS = [
  { name: 'EventMaster', label: 'Events' },
  { name: 'LawLibrary', label: 'Laws' },
  { name: 'ScenarioMaster', label: 'Scenarios' },
  { name: 'CouncilMember', label: 'Council' },
  { name: 'ElectionCycle', label: 'Elections' },
  { name: 'Regions', label: 'Regions' },
  { name: 'BuildingTypes', label: 'Building Types' },
  { name: 'Buildings', label: 'Buildings' },
  { name: 'BuildingStats', label: 'Building Stats' },
  { name: 'FactionQuest', label: 'Faction Quests' },
  { name: 'TechnologyTree', label: 'Tech Tree' },
  { name: 'FactionRegistry', label: 'Factions' },
  { name: 'FactionInfluenceConfig', label: 'Faction Influence' },
  { name: 'GameConfig', label: 'Game Config' },
  { name: 'MarketRates', label: 'Market Rates' },
  { name: 'AdvisoryGuide', label: 'Advisory Guides' },
];



const GROUPS = [
  {
    label: 'World',
    tabs: [
      { id: 'scenarios', icon: '🗺', label: 'Scenarios' },
      { id: 'events', icon: '⚡', label: 'Events' },
      { id: 'regions', icon: '🏔', label: 'Regions' },
    ]
  },
  {
    label: 'Laws & Tech',
    tabs: [
      { id: 'laws', icon: '📜', label: 'Laws' },
      { id: 'tech', icon: '🔬', label: 'Tech Tree' },
    ]
  },
  {
    label: 'Factions',
    tabs: [
      { id: 'council', icon: '👑', label: 'Council' },
      { id: 'election', icon: '🗳', label: 'Elections' },
      { id: 'quests', icon: '📋', label: 'Quests' },
    ]
  },
  {
    label: 'Infrastructure',
    tabs: [
      { id: 'buildings', icon: '🏗', label: 'Buildings' },
      { id: 'building-stats', icon: '📊', label: 'Bldg Stats' },
    ]
  },
  {
    label: 'Economy',
    tabs: [
      { id: 'prosperity', icon: '💹', label: 'Prosperity' },
      { id: 'gameconfig', icon: '⚙️', label: 'Game Constants' },
    ]
  },
  {
    label: 'Player Experience',
    tabs: [
      { id: 'advisoryguide', icon: '📚', label: 'Advisory Guides' },
    ]
  },
  {
    label: 'Assets',
    tabs: [
      { id: 'ai-generator', icon: '🎨', label: 'AI Generator' },
      { id: 'asset-manager', icon: '🖼', label: 'Asset Manager' },
    ]
  },
];

export default function Architect() {
  const [activeTab, setActiveTab] = useState('scenarios');
  const [exporting, setExporting] = useState(false);

  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  const handleExportAll = async () => {
    setExporting(true);
    const wb = XLSX.utils.book_new();
    
    for (const e of ENTITY_EXPORTS) {
      try {
        const rows = await base44.entities[e.name].list();
        const ws = XLSX.utils.json_to_sheet(rows || []);
        XLSX.utils.book_append_sheet(wb, ws, e.label);
        await new Promise(r => setTimeout(r, 200));
      } catch (_) {}
    }
    
    XLSX.writeFile(wb, `GameConfig_${new Date().toISOString().split('T')[0]}.xlsx`);
    setExporting(false);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImporting(true);
    setImportMsg('');
    
    try {
      const wb = XLSX.read(await file.arrayBuffer());
      const sheets = {};
      
      for (const sheetName of wb.SheetNames) {
        sheets[sheetName] = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
      }
      
      const res = await base44.functions.invoke('importGameConfig', { sheets });
      setImportMsg('✓ Import successful!');
    } catch (err) {
      setImportMsg('✗ Import failed: ' + err.message);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const activeGroup = GROUPS.find(g => g.tabs.some(t => t.id === activeTab));

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden gap-0">

      {/* Left Sidebar Nav */}
      <div className="w-44 flex-shrink-0 flex flex-col overflow-y-auto"
        style={{ background: 'rgba(10,8,5,0.85)', borderRight: '1px solid rgba(201,168,76,0.25)' }}>

        <div className="px-3 py-3 border-b border-[#cd7f32]/20">
          <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--color-text-muted)' }}>Architect</p>
          <p className="text-xs font-semibold" style={{ color: 'var(--color-text-accent)' }}>Game Builder</p>
        </div>

        <nav className="flex-1 py-2">
          {GROUPS.map((group) => (
            <div key={group.label} className="mb-1">
              <p className="px-3 pt-3 pb-1 text-[9px] uppercase tracking-widest font-bold"
                style={{ color: 'var(--color-text-muted)' }}>
                {group.label}
              </p>
              {group.tabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left transition-all text-xs"
                    style={active ? {
                      background: 'rgba(201,168,76,0.15)',
                      borderLeft: '2px solid var(--color-gold-primary)',
                      color: 'var(--color-text-accent)',
                      fontWeight: 600,
                    } : {
                      color: 'var(--color-text-secondary)',
                      borderLeft: '2px solid transparent',
                    }}
                  >
                    <span className="text-sm">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(201,168,76,0.2)', background: 'rgba(10,8,5,0.6)' }}>
          <div className="flex items-center gap-2">
            {GROUPS.flatMap(g => g.tabs).filter(t => t.id === activeTab).map(t => (
              <div key={t.id} className="flex items-center gap-2">
                <span className="text-lg">{t.icon}</span>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--color-text-accent)', fontFamily: 'Cinzel' }}>{t.label}</p>
                  {activeGroup && <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{activeGroup.label}</p>}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAll}
              disabled={exporting}
              className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-all disabled:opacity-50"
              style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)', color: 'var(--color-text-accent)' }}
            >
              {exporting ? '⏳ Exporting...' : '📥 Export All CSV'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              disabled={importing}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-all disabled:opacity-50"
              style={{ background: 'rgba(76,201,168,0.15)', border: '1px solid rgba(76,201,168,0.4)', color: 'var(--color-text-accent)' }}
            >
              {importing ? '⏳ Importing...' : '📤 Import Excel'}
            </button>
            {importMsg && <span className="text-xs" style={{ color: importMsg.includes('✓') ? '#27AE60' : '#C0392B' }}>{importMsg}</span>}
          </div>
        </div>

        {/* Editor Panel */}
        <div className="flex-1 overflow-y-auto p-5" onClick={() => setImportMsg('')}>
          {activeTab === 'events' && <EventCreator />}
          {activeTab === 'laws' && <LawEditor />}
          {activeTab === 'scenarios' && <ScenarioManager />}
          {activeTab === 'council' && <CouncilEditor />}
          {activeTab === 'election' && <ElectionCycleEditor />}
          {activeTab === 'regions' && <RegionEditor />}
          {activeTab === 'buildings' && <BuildingManager />}
          {activeTab === 'building-stats' && <BuildingStatsEditor />}
          {activeTab === 'quests' && <FactionQuestEditor />}
          {activeTab === 'tech' && <TechnologyTreeEditor />}
          {activeTab === 'prosperity' && <ProsperityEditor />}
          {activeTab === 'gameconfig' && <GameConfigEditor />}
          {activeTab === 'advisoryguide' && <AdvisoryGuideEditor />}
          {activeTab === 'ai-generator' && <AiAssetGenerator />}
          {activeTab === 'asset-manager' && <AssetManager />}
        </div>
      </div>
    </div>
  );
}