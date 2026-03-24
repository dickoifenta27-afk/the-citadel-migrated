import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { BACKGROUND_MAP, getAdvisorPortrait } from '@/lib/assets';

export default function AdvisoryGuideViewer({ advisorKey, topicKey, onClose }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const { data: advisor } = useQuery({
    queryKey: ['advisors'],
    queryFn: async () => {
      const advisors = await base44.entities.AdvisorConfig.list();
      return advisors.find(a => a.advisor_id === advisorKey);
    }
  });

  const { data: guide } = useQuery({
    queryKey: ['guide', advisorKey, topicKey],
    queryFn: async () => {
      const guides = await base44.entities.AdvisoryGuide.filter({
        advisor_key: advisorKey,
        topic_key: topicKey
      });
      return guides[0];
    }
  });

  // Typewriter effect
  useEffect(() => {
    if (!isTyping || !guide?.content) return;

    let index = 0;
    const fullText = guide.content;
    const interval = setInterval(() => {
      index++;
      setDisplayedText(fullText.slice(0, index));
      if (index === fullText.length) {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isTyping, guide]);

  useEffect(() => {
    if (guide) {
      setDisplayedText('');
      setIsTyping(true);
    }
  }, [guide]);

  if (!advisor || !guide) return null;

  // Get portrait URL - use full body portrait for dialog
  const portraitUrl = advisor.portrait_full_url || advisor.portrait_url || getAdvisorPortrait(advisorKey, 'full');
  const backgroundUrl = BACKGROUND_MAP.citadel;

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
              alt={advisor.name}
              className="h-full object-contain object-bottom"
            />
          </motion.div>
        )}

        {/* Guide Content Box */}
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
          {/* Advisor Name */}
          <div className="mb-2">
            <h3 className="font-serif text-lg font-bold" style={{ color: '#C9A84C' }}>
              {advisor.name}
            </h3>
            <p className="text-xs opacity-60" style={{ color: 'var(--color-text-secondary)' }}>
              {advisor.title}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px mb-4 bg-gradient-to-r from-yellow-600 to-transparent opacity-40" />

          {/* Topic Title */}
          <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-accent)' }}>
            {guide.topic_title}
          </h4>

          {/* Content Text */}
          <p
            className="text-sm leading-relaxed min-h-32"
            style={{ color: '#E8E0D0' }}
          >
            {displayedText}
          </p>

          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={onClose}
            disabled={isTyping}
            className="w-full mt-6 px-3 py-2 rounded text-xs font-semibold transition-all disabled:opacity-50"
            style={{
              background: 'rgba(201,168,76,0.2)',
              border: '1px solid rgba(201,168,76,0.5)',
              color: 'var(--color-text-accent)'
            }}
          >
            Close
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}