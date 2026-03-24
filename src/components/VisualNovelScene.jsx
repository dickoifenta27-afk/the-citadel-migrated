import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { processSceneNode, applyConsequences } from '@/utils/sceneEngine';

const BACKGROUND_MAP = {
  citadel: 'https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/0401a2039_generated_image.png',
  diplomacy: 'https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/585e32815_generated_image.png',
  marketplace: 'https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/4cb4a1b4e_generated_image.png',
  war_room: 'https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/dc4fc725c_generated_image.png',
  hall_of_laws: 'https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/6f25335ac_generated_image.png',
  tech_lab: 'https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/c5b6c74df_generated_image.png',
  infrastructure: 'https://media.base44.com/images/public/69bbb7616d6a3bbc5a56a8f8/24194bdf0_generated_image.png'
};

export default function VisualNovelScene({ eventId, onClose, gameState }) {
  const queryClient = useQueryClient();
  const [currentNodeId, setCurrentNodeId] = useState('START');
  const [currentNode, setCurrentNode] = useState(null);
  const [portraitUrl, setPortraitUrl] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Fetch event, advisors
  const { data: event } = useQuery({
    queryKey: ['activeEvent', eventId],
    queryFn: async () => {
      const events = await base44.entities.ActiveEvent.filter({ id: eventId });
      return events[0];
    }
  });

  const { data: advisors = [] } = useQuery({
    queryKey: ['advisors'],
    queryFn: async () => await base44.entities.AdvisorConfig.list()
  });

  // Parse dialogue tree and setup
  useEffect(() => {
    if (!event) return;

    const tree = JSON.parse(event.dialogue_tree || '[]');
    const context = JSON.parse(event.game_context || '{}');
    
    const node = tree.find(n => n.id === currentNodeId);
    if (!node) return;

    const processedNode = processSceneNode(node, context);
    setCurrentNode(processedNode);
    setDisplayedText('');
    setIsTyping(true);

    // Get portrait from AdvisorConfig
    if (event.speaker_advisor_id) {
      const advisor = advisors.find(a => a.advisor_id === event.speaker_advisor_id);
      if (advisor) setPortraitUrl(advisor.portrait_url);
    }
  }, [event, currentNodeId, advisors]);

  // Typewriter effect
  useEffect(() => {
    if (!isTyping || !currentNode?.text) return;

    let index = 0;
    const fullText = currentNode.text;
    const interval = setInterval(() => {
      index++;
      setDisplayedText(fullText.slice(0, index));
      if (index === fullText.length) {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isTyping, currentNode]);

  const handleNext = async () => {
    if (!event || !currentNode) return;

    if (currentNode.next === 'END') {
      // Apply consequences and close
      if (currentNode.consequences) {
        await applyConsequences(currentNode.consequences, gameState.id);
      }
      await base44.entities.ActiveEvent.update(event.id, { is_read: true });
      queryClient.invalidateQueries({ queryKey: ['activeEvents'] });
      queryClient.invalidateQueries({ queryKey: ['userState'] });
      onClose();
    } else {
      setCurrentNodeId(currentNode.next || 'END');
    }
  };

  const handleChoice = async (choice) => {
    if (!event || !gameState) return;

    // Check requirements
    if (choice.requires) {
      for (const [resource, required] of Object.entries(choice.requires)) {
        if ((gameState[resource] || 0) < required) return;
      }
    }

    // Apply consequences
    if (choice.consequences) {
      await applyConsequences(choice.consequences, gameState.id);
    }

    // Move to next node
    setCurrentNodeId(choice.next || 'END');
  };

  if (!event || !currentNode) return null;

  const backgroundUrl = BACKGROUND_MAP[event.background_asset] || BACKGROUND_MAP.citadel;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          backgroundImage: `url('${backgroundUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/45" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 text-white hover:text-gray-300 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Portrait */}
        {portraitUrl && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute left-0 bottom-0 z-10 h-[70vh]"
          >
            <img
              src={portraitUrl}
              alt="Character"
              className="h-full object-contain object-bottom"
            />
          </motion.div>
        )}

        {/* Dialogue Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="absolute bottom-8 right-8 z-20 max-w-md backdrop-blur-sm rounded-lg p-6"
          style={{
            background: 'rgba(10,8,5,0.85)',
            border: '1px solid rgba(255,215,0,0.3)',
            minWidth: '320px'
          }}
        >
          {/* Speaker */}
          <div className="mb-2">
            <h3 className="font-serif text-lg font-bold" style={{ color: '#C9A84C' }}>
              {currentNode.speaker || 'Advisor'}
            </h3>
            <p className="text-xs opacity-60" style={{ color: 'var(--color-text-secondary)' }}>
              {currentNode.role}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px mb-4 bg-gradient-to-r from-yellow-600 to-transparent opacity-40" />

          {/* Dialogue Text */}
          <p
            className="text-sm leading-relaxed mb-6 min-h-24"
            style={{ color: '#E8E0D0' }}
          >
            {displayedText}
          </p>

          {/* Buttons */}
          <div className="space-y-2">
            {currentNode.type === 'PLAYER' && currentNode.choices ? (
              currentNode.choices.map((choice, idx) => {
                const canAfford = !choice.requires || Object.entries(choice.requires).every(
                  ([resource, required]) => (gameState[resource] || 0) >= required
                );
                return (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => handleChoice(choice)}
                    disabled={!canAfford}
                    className="w-full text-left px-3 py-2 rounded text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: canAfford ? 'rgba(201,168,76,0.2)' : 'rgba(100,100,100,0.2)',
                      border: `1px solid ${canAfford ? 'rgba(201,168,76,0.5)' : 'rgba(100,100,100,0.3)'}`,
                      color: canAfford ? 'var(--color-text-accent)' : 'var(--color-text-muted)'
                    }}
                    title={!canAfford && choice.requires ? `Requires: ${JSON.stringify(choice.requires)}` : ''}
                  >
                    {choice.text}
                  </motion.button>
                );
              })
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={handleNext}
                disabled={isTyping}
                className="w-full px-3 py-2 rounded text-xs font-semibold transition-all disabled:opacity-50"
                style={{
                  background: 'rgba(201,168,76,0.2)',
                  border: '1px solid rgba(201,168,76,0.5)',
                  color: 'var(--color-text-accent)'
                }}
              >
                {currentNode.next === 'END' ? 'Close' : 'Next ▶'}
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}