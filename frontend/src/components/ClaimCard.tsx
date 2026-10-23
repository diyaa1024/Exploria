import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, BookOpen, Sparkles, ExternalLink, ChevronDown, ChevronUp, Info, Tag } from 'lucide-react';
import type { ClaimItem, ConfidenceLevel } from '../types';

interface ClaimCardProps {
  claim: ClaimItem;
  index: number;
}

export const ClaimCard: React.FC<ClaimCardProps> = ({ claim, index }) => {
  const [showSources, setShowSources] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  // Confidence styling config in Polar Atlas Palette
  const getConfidenceBadge = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case 'Verified':
        return {
          icon: <ShieldCheck className="w-3.5 h-3.5 text-[#8E985A]" />,
          label: 'Verified Fact',
          pillBg: 'bg-[#8E985A]/20 border border-[#8E985A]/60 text-[#D8E8A3]',
          glowBorder: 'hover:border-[#8E985A]/60 hover:shadow-[0_0_15px_rgba(142,152,90,0.25)]',
          dot: 'bg-[#8E985A]',
          accentLine: 'border-[#8E985A]'
        };
      case 'Documented':
        return {
          icon: <BookOpen className="w-3.5 h-3.5 text-[#567D77]" />,
          label: 'Documented History',
          pillBg: 'bg-[#567D77]/25 border border-[#567D77]/60 text-[#A2DDD7]',
          glowBorder: 'hover:border-[#567D77]/60 hover:shadow-[0_0_15px_rgba(86,125,119,0.25)]',
          dot: 'bg-[#567D77]',
          accentLine: 'border-[#567D77]'
        };
      case 'Local lore':
      default:
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-[#DF795B]" />,
          label: 'Local Lore & Tradition',
          pillBg: 'bg-[#DF795B]/25 border border-[#DF795B]/60 text-[#F5B4A3]',
          glowBorder: 'hover:border-[#DF795B]/60 hover:shadow-[0_0_15px_rgba(223,121,91,0.25)]',
          dot: 'bg-[#DF795B]',
          accentLine: 'border-[#DF795B]'
        };
    }
  };

  const badge = getConfidenceBadge(claim.confidence);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className={`relative group p-4 sm:p-4.5 rounded-xl bg-[#182625] border border-[#EDE4CE]/20 ${badge.glowBorder} shadow-lg shadow-black/40 transition-all duration-200`}
    >
      {/* Top Header: Headline & Confidence Badge */}
      <div className="flex flex-wrap items-start justify-between gap-2.5 mb-2">
        <h3 className="text-sm sm:text-base font-bold text-[#FAF6ED] tracking-tight group-hover:text-white flex-1 font-['Fraunces'] leading-snug">
          {claim.headline}
        </h3>

        {/* Epistemic Badge */}
        <div
          onClick={() => setShowReasoning(!showReasoning)}
          className={`cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.pillBg} transition-all hover:scale-105 select-none shadow-sm`}
          title="Click to view epistemic confidence reasoning"
        >
          {badge.icon}
          <span>{badge.label}</span>
          <Info className="w-3 h-3 opacity-90 ml-0.5" />
        </div>
      </div>

      {/* Epistemic reasoning expandable panel */}
      <AnimatePresence>
        {showReasoning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2.5 overflow-hidden text-xs sm:text-[13px] bg-[#1C2C2B] rounded-lg p-3 border border-[#EDE4CE]/20 text-[#FAF6ED] shadow-inner"
          >
            <div className="flex items-center gap-1.5 font-bold text-[#FAF6ED] mb-1">
              <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
              <span className="font-['Fraunces']">Epistemic Rationale:</span>
            </div>
            <p className={`leading-relaxed text-[#EDE4CE] pl-2.5 border-l-2 ${badge.accentLine} font-normal`}>
              {claim.confidence_reason}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Narrative Content in Crisp High-Contrast Archival Parchment */}
      <p className="text-xs sm:text-[13.5px] text-[#FAF6ED] leading-relaxed mb-3 font-normal">
        {claim.text}
      </p>

      {/* Tags and Metadata */}
      {claim.tags && claim.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {claim.tags.map((tag, tIdx) => (
            <span
              key={tIdx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#142221] text-[#D8CEB8] border border-[#EDE4CE]/20"
            >
              <Tag className="w-2.5 h-2.5 text-[#DE9B35]" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Verification Evidence Drawer */}
      <div className="pt-2 border-t border-[#EDE4CE]/15 flex items-center justify-between text-xs">
        <button
          onClick={() => setShowSources(!showSources)}
          className="flex items-center gap-1 text-[#EDE4CE] hover:text-white transition-colors py-1 group/btn font-medium"
        >
          <span className="text-[#DE9B35] font-bold">Corroboration:</span>
          <span>{claim.sources.length} Archival Reference{claim.sources.length === 1 ? '' : 's'}</span>
          {showSources ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#DE9B35] group-hover/btn:-translate-y-0.5 transition-transform" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#DE9B35] group-hover/btn:translate-y-0.5 transition-transform" />
          )}
        </button>

        {/* Confidence Tier Pill */}
        <span className="text-[11px] font-mono text-[#B8C4C2]">
          Tier: <span className="font-bold text-[#FAF6ED]">{claim.confidence}</span>
        </span>
      </div>

      {/* Sources list */}
      <AnimatePresence>
        {showSources && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2.5 pt-2 space-y-1.5 overflow-hidden"
          >
            {claim.sources.map((src, sIdx) => (
              <a
                key={sIdx}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-[#142221]/90 hover:bg-[#1E3230] border border-[#EDE4CE]/15 text-xs text-[#FAF6ED] hover:text-white transition-all group/link"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DE9B35] shrink-0" />
                  <span className="truncate font-medium">{src.title}</span>
                </div>
                <div className="flex items-center gap-1 text-[#DE9B35] shrink-0 text-[11px]">
                  <span>{src.source_type}</span>
                  <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                </div>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
