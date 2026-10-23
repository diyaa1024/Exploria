import React from 'react';
import { Compass, Cpu, Database, ArrowLeft } from 'lucide-react';
import type { SystemMetrics } from '../types';

interface HeaderProps {
  metrics: SystemMetrics | null;
  onOpenArchitecture: () => void;
  onOpenInspector: () => void;
  isInspecting: boolean;
  onReturnToLanding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  metrics,
  onOpenArchitecture,
  onOpenInspector,
  isInspecting,
  onReturnToLanding
}) => {
  return (
    <header className="relative z-30 flex items-center justify-between px-4 sm:px-6 py-2.5 bg-[#131F1E]/95 backdrop-blur-xl border-b border-[#EDE4CE]/20 shadow-xl shadow-black/40 gap-3">
      {/* Brand & Atlas Return Button */}
      <div className="flex items-center gap-3">
        {onReturnToLanding && (
          <button
            onClick={onReturnToLanding}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#1A2928] hover:bg-[#233735] text-[#EDE4CE] hover:text-white border border-[#EDE4CE]/25 transition-all shadow-sm active:scale-95 group"
            title="Return to Illustrated Atlas Overview"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#DF795B] group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Atlas Overview</span>
            <span className="sm:hidden">Overview</span>
          </button>
        )}

        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#DF795B] via-[#DE9B35] to-[#567D77] p-[2px] shadow-md shadow-[#DF795B]/20 hover:scale-105 transition-transform">
          <div className="w-full h-full bg-[#162423] rounded-[10px] flex items-center justify-center">
            <Compass className="w-5 h-5 text-[#DE9B35] animate-spin" style={{ animationDuration: '40s' }} />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-wider text-[#FAF6ED] font-['Fraunces']">
              EXPLORIA
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-[#DF795B]/20 text-[#DF795B] border border-[#DF795B]/40 rounded-full shadow-sm font-sans">
              Epistemic RAG
            </span>
          </div>
          <p className="text-xs text-[#B8C4C2] hidden sm:block font-normal">
            AI Cultural & Culinary Discovery Engine for the Physical World
          </p>
        </div>
      </div>

      {/* Center Live Metrics Banner in Archival Atlas Theme */}
      {metrics && (
        <div className="hidden xl:flex items-center gap-3 px-3.5 py-1 bg-[#1A2827]/95 rounded-full border border-[#EDE4CE]/20 text-xs text-[#FAF6ED] shadow-inner font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#8E985A] shadow-[0_0_8px_#8E985A] animate-ping" />
            <span className="text-[#B8C4C2]">Cache Hit Rate:</span>
            <span className="font-bold text-[#8E985A]">{metrics.cache_hit_ratio}%</span>
          </div>
          <div className="h-3 w-px bg-[#EDE4CE]/20" />
          <div className="flex items-center gap-1.5">
            <span className="text-[#B8C4C2]">Live Queries:</span>
            <span className="font-semibold text-[#FAF6ED]">{metrics.total_queries}</span>
          </div>
          <div className="h-3 w-px bg-[#EDE4CE]/20" />
          <div className="flex items-center gap-1.5">
            <span className="text-[#B8C4C2]">Tokens Saved:</span>
            <span className="font-bold text-[#DE9B35]">${metrics.estimated_cost_saved_usd.toFixed(3)}</span>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenInspector}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
            isInspecting
              ? 'bg-[#567D77]/30 text-[#8EC7C1] border border-[#567D77]/60 shadow-md shadow-[#567D77]/20'
              : 'bg-[#1A2928] hover:bg-[#233735] text-[#EDE4CE] hover:text-white border border-[#EDE4CE]/25'
          }`}
          title="Inspect RAG vector chunks and semantic scoring"
        >
          <Database className="w-3.5 h-3.5 text-[#DE9B35]" />
          <span>RAG Pipeline</span>
        </button>

        <button
          onClick={onOpenArchitecture}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-[#DF795B] to-[#DE9B35] hover:brightness-105 text-[#131F1E] shadow-md shadow-[#DF795B]/20 border border-white/20 transition-all hover:scale-[1.02] active:scale-98"
        >
          <Cpu className="w-3.5 h-3.5 text-[#131F1E]" />
          <span>System Design</span>
        </button>
      </div>
    </header>
  );
};
