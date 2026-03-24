import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ChevronDown } from 'lucide-react';

const ADVISOR_KEYS = ['elric', 'valerius', 'seraphina', 'silas'];

export default function RoyalCodex() {
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState(null);

  const { data: advisorConfigs = [] } = useQuery({
    queryKey: ['advisoryConfigs'],
    queryFn: async () => await base44.entities.AdvisoryConfigs.list(),
    staleTime: Infinity
  });

  const { data: guides = [] } = useQuery({
    queryKey: ['advisoryGuides'],
    queryFn: async () => await base44.entities.AdvisoryGuide.list(),
    staleTime: Infinity
  });

  const advisorConfig = useMemo(() => {
    const map = {};
    advisorConfigs.forEach(cfg => {
      map[cfg.advisor_id] = cfg;
    });
    return map;
  }, [advisorConfigs]);

  const topicsByAdvisor = useMemo(() => {
    const map = {};
    guides.forEach(g => {
      if (!map[g.advisor_key]) map[g.advisor_key] = [];
      map[g.advisor_key].push(g);
    });
    Object.keys(map).forEach(key => {
      map[key].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    });
    return map;
  }, [guides]);

  const currentTopics = selectedAdvisor ? topicsByAdvisor[selectedAdvisor] || [] : [];

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(10, 8, 5, 0.15) 0%, rgba(20, 16, 10, 0.1) 100%)',
      backdropFilter: 'blur(8px)',
      border: '2px solid rgba(201,168,76,0.2)',
      borderRadius: '12px',
      padding: '24px'
    }}>
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-serif text-3xl font-bold mb-2" style={{ color: '#FFD700', textShadow: '0 0 12px rgba(255,215,0,0.3)' }}>Royal Codex</h2>
        <p className="text-xs tracking-widest uppercase" style={{ color: '#C9A84C' }}>Kingdom's Archive of Knowledge</p>
        <div style={{ height: '2px', marginTop: '12px', background: 'linear-gradient(to right, rgba(201,168,76,0.5) 0%, transparent 100%)' }} />
      </div>

      {/* Advisor Cards Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {ADVISOR_KEYS.map((key) => {
          const config = advisorConfig[key];
          const isActive = selectedAdvisor === key;
          return (
            <button
              key={key}
              onClick={() => {
                setSelectedAdvisor(isActive ? null : key);
                setExpandedTopic(null);
              }}
              className="relative h-56 rounded-xl transition-all duration-200 hover:shadow-lg overflow-hidden group"
              style={{
                background: 'rgba(20,16,10,0.8)',
                border: isActive ? '2px solid #FFD700' : '1px solid rgba(201,168,76,0.25)',
                boxShadow: isActive ? '0 0 16px rgba(255,215,0,0.35), inset 0 0 16px rgba(255,215,0,0.1)' : 'none'
              }}
            >
              {config?.portrait_url && (
                <img
                  src={config.portrait_url}
                  alt={config?.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                    opacity: 0.9
                  }}
                />
              )}
              <div
                className="absolute inset-0 flex flex-col justify-end p-4"
                style={{
                  background: isActive
                    ? 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(201,168,76,0.1) 100%)'
                    : 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.3) 100%)'
                }}
              >
                <p className="text-sm font-bold" style={{ color: isActive ? '#FFD700' : '#E8E0D0' }}>
                  {config?.name}
                </p>
                <p className="text-[11px]" style={{ color: '#C9A84C' }}>
                  {config?.title}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Content Panel */}
      <div style={{
        background: 'rgba(10, 8, 5, 0.6)',
        border: '1px solid rgba(201,168,76,0.2)',
        borderRadius: '10px',
        padding: '20px',
        minHeight: '240px'
      }}>
        {!selectedAdvisor ? (
          <p style={{ color: '#A89880', fontSize: '14px', textAlign: 'center', paddingTop: '60px' }}>
            Select an advisor to explore their knowledge
          </p>
        ) : currentTopics.length === 0 ? (
          <p style={{ color: '#A89880', fontSize: '14px', textAlign: 'center', paddingTop: '60px' }}>
            Content coming soon
          </p>
        ) : (
          <div className="space-y-2">
            {currentTopics.map((topic) => {
              const isExpanded = expandedTopic === topic.id;
              return (
                <div key={topic.id}>
                  <button
                    onClick={() => setExpandedTopic(isExpanded ? null : topic.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg transition-all hover:bg-[rgba(201,168,76,0.05)]"
                    style={{
                      background: isExpanded ? 'rgba(201,168,76,0.12)' : 'transparent',
                      border: isExpanded ? '1px solid rgba(201,168,76,0.4)' : '1px solid transparent',
                      color: '#E8E0D0'
                    }}
                  >
                    <div className="text-left">
                      <p className="text-sm font-semibold">{topic.topic_title}</p>
                      <p className="text-[11px]" style={{ color: '#A89880' }}>
                        {topic.category}
                      </p>
                    </div>
                    <ChevronDown
                      size={16}
                      style={{
                        transition: 'transform 0.2s',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: '#C9A84C',
                        flexShrink: 0,
                        marginLeft: '8px'
                      }}
                    />
                  </button>

                  {isExpanded && (
                    <div
                      style={{
                        padding: '12px',
                        paddingLeft: '16px',
                        borderLeft: '2px solid rgba(255,215,0,0.3)',
                        marginLeft: '8px',
                        marginTop: '4px',
                        color: '#B0A090',
                        fontSize: '13px',
                        lineHeight: '1.7',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {topic.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}