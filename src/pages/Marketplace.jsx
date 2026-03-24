import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const resourceIcons = {
  gold: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/120da579d_gold.png',
  food: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/206bfbc58_food.png',
  iron: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/ebe2e7076_iron.png',
  wood: 'https://base44.app/api/apps/69bbb7616d6a3bbc5a56a8f8/files/mp/public/69bbb7616d6a3bbc5a56a8f8/21930e5bf_wood.png'
};

function Sparkline({ data, color = '#ffd700', width = 80, height = 32 }) {
  if (!data || data.length < 2) {
    return <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 10, color: '#555' }}>No data</span>
    </div>;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  const lastVal = data[data.length - 1];
  const firstVal = data[0];
  const trend = lastVal > firstVal ? '#4ade80' : lastVal < firstVal ? '#ef4444' : '#94a3b8';

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={trend} stopOpacity="0.3" />
          <stop offset="100%" stopColor={trend} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#grad-${color.replace('#','')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={trend}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {(() => {
        const lastX = width;
        const lastY = height - ((lastVal - min) / range) * (height - 4) - 2;
        return <circle cx={lastX} cy={lastY} r="2.5" fill={trend} />;
      })()}
    </svg>
  );
}

export default function Marketplace() {
  const { gameState, refetch } = useOutletContext();
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [amount, setAmount] = useState('');
  const [isTrading, setIsTrading] = useState(false);

  const { data: marketRates } = useQuery({
    queryKey: ['marketRates', gameState?.turn_count],
    queryFn: async () => {
      const rates = await base44.entities.MarketRates.filter({ turn_number: gameState.turn_count });
      if (rates.length > 0) return rates[0];

      const prevRates = await base44.entities.MarketRates.filter({ turn_number: gameState.turn_count - 1 });
      const prev = prevRates.length > 0 ? prevRates[0] : null;

      const generateRate = (prevValue, baseMin, baseMax) => {
        if (!prev || !prevValue) return Math.floor(Math.random() * (baseMax - baseMin)) + baseMin;
        const change = (Math.random() - 0.5) * 0.4;
        const newValue = prevValue * (1 + change);
        return Math.max(baseMin, Math.min(baseMax, Math.floor(newValue)));
      };

      const generateRateFloat = (prevValue, baseMin, baseMax) => {
        if (!prev || !prevValue) return (Math.random() * (baseMax - baseMin) + baseMin).toFixed(3);
        const change = (Math.random() - 0.5) * 0.4;
        const newValue = parseFloat(prevValue) * (1 + change);
        return Math.max(baseMin, Math.min(baseMax, newValue)).toFixed(3);
      };

      const newRates = {
        turn_number: gameState.turn_count,
        gold_to_food: generateRate(prev?.gold_to_food, 8, 18),
        gold_to_iron: generateRate(prev?.gold_to_iron, 12, 27),
        gold_to_wood: generateRate(prev?.gold_to_wood, 5, 13),
        food_to_gold: generateRateFloat(prev?.food_to_gold, 0.08, 0.13),
        iron_to_gold: generateRateFloat(prev?.iron_to_gold, 0.06, 0.10),
        wood_to_gold: generateRateFloat(prev?.wood_to_gold, 0.12, 0.20)
      };

      const created = await base44.entities.MarketRates.create(newRates);
      return created;
    },
    enabled: !!gameState
  });

  const { data: previousRates } = useQuery({
    queryKey: ['marketRates', gameState?.turn_count - 1],
    queryFn: async () => {
      if (!gameState || gameState.turn_count <= 1) return null;
      const rates = await base44.entities.MarketRates.filter({ turn_number: gameState.turn_count - 1 });
      return rates.length > 0 ? rates[0] : null;
    },
    enabled: !!gameState && gameState.turn_count > 1
  });

  const { data: marketHistory } = useQuery({
    queryKey: ['marketHistory', gameState?.turn_count],
    queryFn: async () => {
      if (!gameState) return [];
      const allRates = await base44.entities.MarketRates.list();
      // Only show rates from turn 1 to current turn (not from previous games)
      const currentGameRates = allRates.filter(r => r.turn_number <= gameState.turn_count);
      return currentGameRates.sort((a, b) => a.turn_number - b.turn_number).slice(-8);
    },
    enabled: !!gameState
  });

  const getSparklineData = (key) => {
    if (!marketHistory || marketHistory.length === 0) return [];
    return marketHistory.map(r => parseFloat(r[key]) || 0).filter(v => v > 0);
  };

  const trades = [
    { from: 'gold', to: 'food', rate: marketRates?.gold_to_food, label: 'Buy Food', key: 'gold_to_food' },
    { from: 'gold', to: 'iron', rate: marketRates?.gold_to_iron, label: 'Buy Iron', key: 'gold_to_iron' },
    { from: 'gold', to: 'wood', rate: marketRates?.gold_to_wood, label: 'Buy Wood', key: 'gold_to_wood' },
    { from: 'food', to: 'gold', rate: marketRates?.food_to_gold, label: 'Sell Food', key: 'food_to_gold' },
    { from: 'iron', to: 'gold', rate: marketRates?.iron_to_gold, label: 'Sell Iron', key: 'iron_to_gold' },
    { from: 'wood', to: 'gold', rate: marketRates?.wood_to_gold, label: 'Sell Wood', key: 'wood_to_gold' }
  ];

  const handleTrade = async () => {
    if (!selectedTrade || !gameState) return;
    const rawCost = Math.ceil(amount * selectedTrade.rate);
    const transactionFee = Math.ceil(rawCost * 0.15);
    const cost = rawCost + transactionFee;

    if (gameState[selectedTrade.from] < cost) {
      alert(`Not enough ${selectedTrade.from}! You need ${cost} (includes 15% fee) but have ${gameState[selectedTrade.from]}`);
      return;
    }

    setIsTrading(true);
    try {
      await base44.entities.UserState.update(gameState.id, {
        [selectedTrade.from]: gameState[selectedTrade.from] - cost,
        [selectedTrade.to]: gameState[selectedTrade.to] + parseInt(amount)
      });
      await refetch();
      setAmount('');
      alert(`Trade successful! Exchanged ${cost} ${selectedTrade.from} (includes ${transactionFee} fee) for ${amount} ${selectedTrade.to}`);
    } catch (error) {
      console.error('Trade error:', error);
      alert('Trade failed');
    } finally {
      setIsTrading(false);
    }
  };

  const getCost = () => {
    if (!selectedTrade || !amount) return 0;
    const rawCost = Math.ceil(amount * selectedTrade.rate);
    return rawCost + Math.ceil(rawCost * 0.15);
  };

  const canAfford = () => {
    if (!selectedTrade || !gameState || !amount) return false;
    return gameState[selectedTrade.from] >= getCost();
  };

  const getMaxAmount = () => {
    if (!selectedTrade || !gameState) return 0;
    return Math.floor(gameState[selectedTrade.from] / (selectedTrade.rate * 1.15));
  };

  const setQuickAmount = (multiplier) => {
    setAmount(multiplier === 'max' ? getMaxAmount() : multiplier);
  };

  const getPriceChange = (tradeKey) => {
    if (!previousRates || !marketRates) return null;
    const current = marketRates[tradeKey];
    const previous = previousRates[tradeKey];
    if (!previous || !current) return null;
    return (parseFloat(current) - parseFloat(previous)) / parseFloat(previous) * 100;
  };

  if (!gameState || !marketRates) {
    return <div className="text-slate-300 p-8">Loading marketplace...</div>;
  }

  return (
    <div className="relative min-h-screen" style={{
      backgroundImage: "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.60)), url('https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/4cb4a1b4e_generated_image.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="relative p-6" style={{ zIndex: 1 }}>
        <div className="grid grid-cols-2 gap-6">

          {/* LEFT: Available Trades */}
          <div>
            <Card className="border-[#cd7f32]/50 mb-4" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
              <CardHeader className="border-b border-[#cd7f32]/30">
                <CardTitle className="text-[#ffd700] font-serif">Available Trades</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {trades.map((trade, idx) => {
                    const isSelected = selectedTrade?.from === trade.from && selectedTrade?.to === trade.to;
                    const priceChange = getPriceChange(trade.key);
                    const isUp = priceChange > 0;
                    const isDown = priceChange < 0;
                    const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedTrade(trade)}
                        className={`w-full p-3 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-[#B8860B]/20 border-[#B8860B] shadow-lg'
                            : 'bg-black/40 border-[#cd7f32]/30 hover:border-[#cd7f32]/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img src={resourceIcons[trade.from]} alt={trade.from} style={{ width: 28, height: 28, objectFit: 'contain', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }} />
                            <span style={{ fontSize: 14, color: priceChange > 0 ? '#4ade80' : priceChange < 0 ? '#ef4444' : '#94a3b8', fontWeight: 'bold' }}>
                              {priceChange > 0 ? '▲' : priceChange < 0 ? '▼' : '—'}
                            </span>
                            <img src={resourceIcons[trade.to]} alt={trade.to} style={{ width: 28, height: 28, objectFit: 'contain', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }} />
                          </div>
                          <div className="flex-1 text-right mx-3">
                            <div className="text-sm font-semibold text-[#e0e0e0]">{trade.label}</div>
                            <div className="text-xs text-[#cd7f32]">{trade.rate} {trade.from}/{trade.to}</div>
                          </div>
                          {priceChange !== null && (
                            <div className={`flex items-center gap-1 text-xs font-bold min-w-[48px] justify-end ${isUp ? 'text-green-400' : isDown ? 'text-red-400' : 'text-gray-500'}`}>
                              <TrendIcon className="w-3 h-3" />
                              {priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Market Trends + Execute Trade */}
          <div>
            <Card className="border-[#cd7f32]/50 mb-4" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
              <CardHeader className="border-b border-[#cd7f32]/30 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#ffd700] font-serif text-sm">Market Trends</CardTitle>
                  <span className="text-xs text-[#cd7f32]">Turn {gameState.turn_count} · price history</span>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                {!selectedTrade ? (
                  <div className="text-center py-6 text-[#cd7f32]/60 text-sm">Select a trade to view its price history</div>
                ) : (() => {
                  const trade = selectedTrade;
                  const sparkData = getSparklineData(trade.key);
                  const priceChange = getPriceChange(trade.key);
                  const isUp = priceChange > 0;
                  const isDown = priceChange < 0;
                  return (
                    <div className="flex items-center justify-between py-2 px-2 rounded-md bg-black/20">
                      <div className="flex items-center gap-2">
                        <img src={resourceIcons[trade.from]} alt={trade.from} style={{ width: 28, height: 28, objectFit: 'contain', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }} />
                        <span style={{ fontSize: 9, color: '#666' }}>→</span>
                        <img src={resourceIcons[trade.to]} alt={trade.to} style={{ width: 28, height: 28, objectFit: 'contain', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }} />
                        <span className="text-xs text-[#888] ml-1">{trade.label}</span>
                      </div>
                      <div className="flex-1 flex justify-center">
                        <Sparkline data={sparkData} width={80} height={28} />
                      </div>
                      <div className="text-right w-20">
                        <div className="text-xs font-bold text-[#e0e0e0]">{parseFloat(trade.rate).toFixed(2)}</div>
                        {priceChange !== null && (
                          <div className={`text-xs font-semibold ${isUp ? 'text-green-400' : isDown ? 'text-red-400' : 'text-gray-500'}`}>
                            {isUp ? '▲' : isDown ? '▼' : '—'} {Math.abs(priceChange).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            <Card className="border-[#cd7f32]/50" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
              <CardHeader className="border-b border-[#cd7f32]/30">
                <CardTitle className="text-[#ffd700] font-serif">Execute Trade</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {!selectedTrade ? (
                  <div className="text-center py-12 text-[#cd7f32]">Select a trade option to continue</div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[#cd7f32] text-sm mb-2">Amount of {selectedTrade.to} to receive:</label>
                      <input
                        type="number" min="1" placeholder="Enter amount" value={amount}
                        onChange={(e) => setAmount(e.target.value ? parseInt(e.target.value) : '')}
                        className="w-full bg-[#0a0a0c] border border-[#cd7f32]/50 rounded px-4 py-3 text-[#ffd700] text-lg font-bold text-center"
                      />
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        {[10, 100, 1000].map(n => (
                          <Button key={n} type="button" onClick={() => setQuickAmount(n)} variant="outline"
                            className="bg-[#0a0a0c] border-[#cd7f32]/50 text-[#cd7f32] hover:bg-[#1a1a1c] hover:text-[#ffd700]">
                            x{n}
                          </Button>
                        ))}
                        <Button type="button" onClick={() => setQuickAmount('max')} variant="outline"
                          className="bg-[#B8860B]/20 border-[#B8860B] text-[#C9A84C] hover:bg-[#B8860B]/30 hover:text-[#ffd700] font-bold">
                          MAX
                        </Button>
                      </div>
                    </div>
                    <div className="bg-[#0a0a0c] rounded-lg p-4 border border-[#cd7f32]/30 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#cd7f32]">Base cost:</span>
                        <span className="text-[#e0e0e0]">{amount ? Math.ceil(amount * selectedTrade.rate) : 0} {selectedTrade.from}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#8b0000]">Transaction fee (15%):</span>
                        <span className="text-[#8b0000]">+{amount ? Math.ceil(Math.ceil(amount * selectedTrade.rate) * 0.15) : 0} {selectedTrade.from}</span>
                      </div>
                      <div className="border-t border-[#cd7f32]/20 pt-2 flex justify-between text-sm">
                        <span className="text-[#cd7f32] font-bold">Total cost:</span>
                        <span className="text-[#e0e0e0] font-bold">{getCost()} {selectedTrade.from}</span>
                      </div>
                      <div className="flex justify-center">
                        <ArrowRightLeft className="w-5 h-5 text-[#ffd700]" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#cd7f32]">You receive:</span>
                        <span className="text-[#C9A84C] font-bold">{amount} {selectedTrade.to}</span>
                      </div>
                    </div>
                    <div className="bg-[#1a1a1c] rounded-lg p-3 border border-[#cd7f32]/20">
                      <div className="flex justify-between text-xs text-[#cd7f32] mb-1">
                        <span>Available {selectedTrade.from}:</span>
                        <span className={canAfford() ? 'text-[#C9A84C]' : 'text-[#8b0000]'}>{gameState[selectedTrade.from]}</span>
                      </div>
                      <div className="flex justify-between text-xs text-[#cd7f32]">
                        <span>After trade:</span>
                        <span>{gameState[selectedTrade.from] - getCost()}</span>
                      </div>
                    </div>
                    <Button
                      onClick={handleTrade}
                      disabled={isTrading || !canAfford() || !amount}
                      className="w-full bg-gradient-to-r from-[#B8860B] to-[#8B6508] hover:from-[#C9A84C] hover:to-[#B8860B] text-[#1a1000] font-bold py-6">
                      {isTrading ? 'Processing...' : !amount ? 'Enter Amount' : canAfford() ? 'Execute Trade' : 'Insufficient Resources'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}