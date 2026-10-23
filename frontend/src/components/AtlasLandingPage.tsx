import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Sparkles,
  Cpu,
  ExternalLink,
  ChevronRight,
  Navigation,
  Globe2,
  Award
} from 'lucide-react';

interface AtlasLandingPageProps {
  onExploreNow: (destination?: { lat: number; lng: number; name: string }) => void;
  onOpenArchitecture: () => void;
}

const CURATED_EXPEDITIONS = [
  {
    name: 'Kyoto, Japan',
    title: 'Imperial Temples & Gion Lore',
    tag: 'Living Heritage',
    lat: 35.0116,
    lng: 135.7681,
    accent: 'border-[#567D77]',
    bgBadge: 'bg-[#567D77]/15 text-[#37534F]'
  },
  {
    name: 'Varanasi, India',
    title: 'Ganges Ghats & Sacred Mythology',
    tag: 'Spiritual Center',
    lat: 25.3176,
    lng: 82.9739,
    accent: 'border-[#DE9B35]',
    bgBadge: 'bg-[#DE9B35]/15 text-[#B8781B]'
  },
  {
    name: 'Oaxaca, Mexico',
    title: 'Ancestral Moles & Zapotec Traditions',
    tag: 'Culinary Capital',
    lat: 17.0732,
    lng: -96.7266,
    accent: 'border-[#DF795B]',
    bgBadge: 'bg-[#DF795B]/15 text-[#B94C2E]'
  },
  {
    name: 'Edinburgh Castle, UK',
    title: 'Royal Mile & Volcanic Stronghold',
    tag: 'Fortress Quarter',
    lat: 55.9486,
    lng: -3.1999,
    accent: 'border-[#8E985A]',
    bgBadge: 'bg-[#8E985A]/15 text-[#636D33]'
  }
];

export const AtlasLandingPage: React.FC<AtlasLandingPageProps> = ({
  onExploreNow,
  onOpenArchitecture
}) => {
  const [activeTier, setActiveTier] = useState<'verified' | 'documented' | 'lore'>('verified');

  const tierExamples = {
    verified: {
      headline: 'Kinkaku-ji (Temple of the Golden Pavilion)',
      badge: 'Verified Fact',
      badgeColor: 'bg-[#8E985A]/20 text-[#4E5624] border-[#8E985A]/60',
      icon: <ShieldCheck className="w-4 h-4 text-[#636D33]" />,
      summary: 'Designated as a National Special Historic Site and a UNESCO World Heritage cultural property.',
      evidence: 'Directly corroborated by Agency for Cultural Affairs of Japan registers and Kyoto Municipal Conservation Deeds (1955 reconstruction following arson).',
      source: 'UNESCO World Heritage Centre • Ref: 688bis'
    },
    documented: {
      headline: 'Edo-Period Pilgrim Teahouse Customs',
      badge: 'Documented History',
      badgeColor: 'bg-[#567D77]/20 text-[#2C4A45] border-[#567D77]/60',
      icon: <BookOpen className="w-4 h-4 text-[#37534F]" />,
      summary: 'Travelers traversing the Tokaido highway recorded ritualized matcha preparation and roadside sweets.',
      evidence: 'Attested in 17th-century woodblock travelogues, merchant registers, and regional culinary compendiums.',
      source: 'Kyoto Historical Gazetteers & Provincial Accounts'
    },
    lore: {
      headline: 'Fushimi Inari Sacred Fox Messengers (Kitsune)',
      badge: 'Local Lore & Tradition',
      badgeColor: 'bg-[#DF795B]/20 text-[#8E3218] border-[#DF795B]/60',
      icon: <Sparkles className="w-4 h-4 text-[#B94C2E]" />,
      summary: 'White foxes guard the shrine gates carrying keys to grain storehouses, believed to convey community prayers.',
      evidence: 'Cherished as living oral folklore and spiritual tradition across generations rather than state archival deed.',
      source: 'Regional Shinto Folklore & Neighborhood Oral Chronicles'
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-[#221E19] flex flex-col selection:bg-[#DE9B35]/30">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF7EE]/95 backdrop-blur-md border-b border-[#221E19]/10 px-6 sm:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Emblem */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full border-2 border-[#567D77] p-1 flex items-center justify-center bg-[#E7EFEF] shadow-sm">
              <Compass className="w-5 h-5 text-[#567D77] animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-title text-2xl font-bold tracking-tight text-[#221E19]">
                  EXPLORIA
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-[#567D77]/15 text-[#37534F] border border-[#567D77]/30 px-2 py-0.5 rounded">
                  Atlas Edition
                </span>
              </div>
              <p className="text-xs text-[#645C4F] hidden sm:block font-medium">
                Physical World Epistemic Discovery Engine
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#524B3E]">
            <a href="#epistemic-layer" className="hover:text-[#567D77] transition-colors">
              Epistemic Engine
            </a>
            <a href="#rag-pipeline" className="hover:text-[#567D77] transition-colors">
              RAG Pipeline
            </a>
            <a href="#curated-wonders" className="hover:text-[#567D77] transition-colors">
              Curated Wonders
            </a>
            <button
              onClick={onOpenArchitecture}
              className="hover:text-[#B93F2C] transition-colors flex items-center gap-1"
            >
              <Cpu className="w-3.5 h-3.5" />
              System Design
            </button>
          </nav>

          {/* Primary CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onExploreNow()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#DF795B] hover:bg-[#B94C2E] text-white font-bold text-sm shadow-md shadow-[#DF795B]/25 transition-all hover:scale-105 active:scale-95"
            >
              <span>Explore Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 sm:px-12 pt-12 pb-16 overflow-hidden border-b border-[#221E19]/10">
        {/* Subtle background graticule lines */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="w-full h-full bg-[radial-gradient(#221E19_1px,transparent_1px)] [background-size:32px_32px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E7EFEF] border border-[#567D77]/30 text-xs font-bold uppercase tracking-wider text-[#37534F]">
                <Globe2 className="w-3.5 h-3.5 text-[#567D77]" />
                <span>Solo-Builder Edition • Verified Free-Tier Architecture</span>
              </div>

              <h1 className="font-serif-title text-4xl sm:text-5xl lg:text-6xl font-bold text-[#221E19] leading-[1.1] tracking-tight">
                Point anywhere on the map.{' '}
                <span className="italic text-[#B93F2C] font-normal">
                  Discover what truly happened there.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#524B3E] leading-relaxed font-normal">
                Why it matters to the people who live there, what they believe about it, and where to eat nearby — with every claim traceable to real physical sources and labeled by evidence strength.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onExploreNow()}
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#DF795B] hover:bg-[#B94C2E] text-white font-bold text-base shadow-xl shadow-[#DF795B]/30 transition-all hover:scale-105 active:scale-95"
                >
                  <Navigation className="w-5 h-5 text-white" />
                  <span>Launch Engine</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </button>

                <button
                  onClick={onOpenArchitecture}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#F4EEDB] border border-[#221E19]/20 text-[#221E19] font-bold text-base shadow-sm transition-all"
                >
                  <Cpu className="w-4 h-4 text-[#567D77]" />
                  <span>System Design</span>
                </button>
              </div>

              {/* Metric Highlights Pill */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#221E19]/10 text-xs font-semibold text-[#524B3E]">
                <div className="p-3 rounded-xl bg-white/70 border border-[#221E19]/10">
                  <span className="block text-lg font-bold text-[#37534F] font-serif-title">100% Free</span>
                  <span>Zero-tier cloud infra</span>
                </div>
                <div className="p-3 rounded-xl bg-white/70 border border-[#221E19]/10">
                  <span className="block text-lg font-bold text-[#DE9B35] font-serif-title">&lt; 10ms</span>
                  <span>Disk GeoCache retrieval</span>
                </div>
                <div className="p-3 rounded-xl bg-white/70 border border-[#221E19]/10">
                  <span className="block text-lg font-bold text-[#DF795B] font-serif-title">3 Tiers</span>
                  <span>Epistemic honesty</span>
                </div>
              </div>
            </div>

            {/* Right Illustrated Atlas Print Showcase */}
            <div className="lg:col-span-6 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative rounded-3xl p-3 bg-white shadow-2xl border-4 border-[#EDE4CE] shadow-[#567D77]/15 group"
              >
                {/* Vintage Frame Inset */}
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#221E19]/20">
                  <img
                    src="/vintage_atlas_hero.jpg"
                    alt="Vintage Polar World Atlas Illustrated Cartography"
                    className="w-full h-auto object-cover transform group-hover:scale-102 transition-transform duration-700"
                  />

                  {/* Engraved Title Overlay */}
                  <div className="absolute top-4 left-4 bg-[#FAF7EE]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-[#221E19]/20 shadow-md">
                    <span className="font-cinzel text-xs font-bold uppercase tracking-widest text-[#B93F2C] block">
                      Plate No. VII • Polar Azimuthal
                    </span>
                    <span className="font-serif-title text-sm font-bold text-[#221E19]">
                      Global Cultural & Spatial Coordinates
                    </span>
                  </div>

                  {/* Interactive Trigger Pill on the Image */}
                  <div className="absolute bottom-4 right-4">
                    <button
                      onClick={() => onExploreNow()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#221E19] text-[#FAF7EE] text-xs font-bold shadow-xl hover:bg-[#B93F2C] transition-colors"
                    >
                      <span>Open Interactive Globe</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 1: The Epistemic Confidence Layer */}
      <section id="epistemic-layer" className="px-6 sm:px-12 py-20 bg-[#F5EFE1] border-b border-[#221E19]/10">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#DF795B] font-cinzel">
              Foundational Product Differentiator
            </span>
            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#221E19]">
              The Epistemic Confidence Layer
            </h2>
            <p className="text-sm sm:text-base text-[#645C4F]">
              Direct prompting causes LLMs to fabricate folklore as historical fact or flatten sacred traditions into tourist brochures. Exploria separates truth from tradition as a foundational product decision.
            </p>
          </div>

          {/* Interactive Tier Switcher */}
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setActiveTier('verified')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
                activeTier === 'verified'
                  ? 'bg-[#8E985A] text-white shadow-md'
                  : 'bg-white text-[#524B3E] hover:bg-[#FAF7EE] border border-[#221E19]/10'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>1. Verified Fact</span>
            </button>

            <button
              onClick={() => setActiveTier('documented')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
                activeTier === 'documented'
                  ? 'bg-[#567D77] text-white shadow-md'
                  : 'bg-white text-[#524B3E] hover:bg-[#FAF7EE] border border-[#221E19]/10'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>2. Documented History</span>
            </button>

            <button
              onClick={() => setActiveTier('lore')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
                activeTier === 'lore'
                  ? 'bg-[#DF795B] text-white shadow-md'
                  : 'bg-white text-[#524B3E] hover:bg-[#FAF7EE] border border-[#221E19]/10'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>3. Local Lore & Tradition</span>
            </button>
          </div>

          {/* Interactive Card Presentation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTier}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto p-8 rounded-3xl bg-white border-2 border-[#221E19]/15 shadow-xl relative"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${tierExamples[activeTier].badgeColor}`}>
                      {tierExamples[activeTier].icon}
                      {tierExamples[activeTier].badge}
                    </span>
                    <span className="text-xs font-mono text-[#8C8272]">Kyoto Prefecture, Japan</span>
                  </div>
                  <h3 className="font-serif-title text-2xl font-bold text-[#221E19]">
                    {tierExamples[activeTier].headline}
                  </h3>
                </div>
              </div>

              <p className="text-base text-[#221E19] leading-relaxed mb-5 font-normal">
                {tierExamples[activeTier].summary}
              </p>

              {/* Rationale and Source Attribution */}
              <div className="space-y-3 pt-4 border-t border-[#221E19]/10 text-xs">
                <div className="flex items-start gap-2 bg-[#FAF7EE] p-3.5 rounded-xl border border-[#221E19]/10">
                  <span className="font-bold text-[#37534F] uppercase tracking-wider shrink-0 mt-0.5">
                    Epistemic Proof:
                  </span>
                  <span className="text-[#524B3E] font-medium leading-relaxed">
                    {tierExamples[activeTier].evidence}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#8C8272] pt-1">
                  <span className="flex items-center gap-1.5 font-bold">
                    <ExternalLink className="w-3.5 h-3.5 text-[#567D77]" />
                    Cited Source: {tierExamples[activeTier].source}
                  </span>
                  <span className="text-[11px] font-mono uppercase">Inspectable in Engine</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Feature 2: Multi-Source RAG Pipeline */}
      <section id="rag-pipeline" className="px-6 sm:px-12 py-20 bg-[#FAF7EE] border-b border-[#221E19]/10">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#567D77] font-cinzel">
              Architecture Over Prompt Wrappers
            </span>
            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#221E19]">
              Linear, Citable RAG Engineering
            </h2>
            <p className="text-sm sm:text-base text-[#645C4F]">
              Every request executes an inspectable 5-stage retrieval pipeline, grounding claims directly in physical world registries rather than LLM memorization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl bg-white border border-[#221E19]/15 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-full bg-[#567D77]/15 text-[#37534F] font-bold flex items-center justify-center text-sm font-serif-title">
                1
              </div>
              <h3 className="font-serif-title text-lg font-bold text-[#221E19]">Spatial Harvesting</h3>
              <p className="text-xs text-[#645C4F] leading-relaxed">
                Reverse geocodes coordinates and executes parallel queries across Wikipedia REST, OpenStreetMap Overpass, and Wikidata entities.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#221E19]/15 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-full bg-[#DE9B35]/15 text-[#B8781B] font-bold flex items-center justify-center text-sm font-serif-title">
                2
              </div>
              <h3 className="font-serif-title text-lg font-bold text-[#221E19]">Dense Embeddings</h3>
              <p className="text-xs text-[#645C4F] leading-relaxed">
                Splits documents into 500-character windows and computes vector embeddings via Gemini <code className="text-[11px] bg-[#FAF7EE] px-1 rounded">text-embedding-004</code>.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#221E19]/15 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-full bg-[#DF795B]/15 text-[#B94C2E] font-bold flex items-center justify-center text-sm font-serif-title">
                3
              </div>
              <h3 className="font-serif-title text-lg font-bold text-[#221E19]">Semantic Retrieval</h3>
              <p className="text-xs text-[#645C4F] leading-relaxed">
                Queries in-memory vector indices with category-specific prompts to extract Top-3 most relevant grounded chunks per section.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#221E19]/15 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-full bg-[#8E985A]/15 text-[#636D33] font-bold flex items-center justify-center text-sm font-serif-title">
                4
              </div>
              <h3 className="font-serif-title text-lg font-bold text-[#221E19]">Structured Synthesis</h3>
              <p className="text-xs text-[#645C4F] leading-relaxed">
                Gemini 2.5 Flash synthesizes strict JSON, assigning epistemic confidence ratings and source citations to every generated claim.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3: Curated World Expeditions */}
      <section id="curated-wonders" className="px-6 sm:px-12 py-20 bg-[#F4EEDB] border-b border-[#221E19]/10">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#B93F2C] font-cinzel">
                World Cultural Epicenters
              </span>
              <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#221E19] mt-1">
                Curated Physical Expeditions
              </h2>
            </div>
            <button
              onClick={() => onExploreNow()}
              className="text-sm font-bold text-[#567D77] hover:text-[#37534F] flex items-center gap-1.5 transition-colors"
            >
              <span>Explore full interactive map</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CURATED_EXPEDITIONS.map((exp, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border-2 border-[#221E19]/10 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md mb-3 inline-block ${exp.bgBadge}`}>
                    {exp.tag}
                  </span>
                  <h3 className="font-serif-title text-xl font-bold text-[#221E19]">
                    {exp.name}
                  </h3>
                  <p className="text-xs text-[#645C4F] mt-1 font-medium">
                    {exp.title}
                  </p>
                </div>

                <button
                  onClick={() => onExploreNow({ lat: exp.lat, lng: exp.lng, name: exp.name })}
                  className="mt-6 w-full py-2.5 px-4 rounded-xl bg-[#FAF7EE] hover:bg-[#567D77] text-[#221E19] hover:text-white font-bold text-xs border border-[#221E19]/15 hover:border-transparent transition-all flex items-center justify-between"
                >
                  <span>Explore on Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recruiter & Interviewer Value Section */}
      <section className="px-6 sm:px-12 py-16 bg-white border-b border-[#221E19]/10">
        <div className="max-w-4xl mx-auto p-8 sm:p-10 rounded-3xl bg-[#FAF7EE] border-2 border-[#567D77]/30 shadow-md space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#567D77] font-cinzel">
            <Award className="w-4 h-4" />
            <span>Product Framing for Technical Roles</span>
          </div>

          <blockquote className="font-serif-title text-xl sm:text-2xl text-[#221E19] italic leading-snug">
            "For consumer-product companies and general tech interviewers alike, the difference between a portfolio toy and a credible product signal is architecture, not polish. Calling Gemini to write travel blurbs reads as a wrapper. RAG grounding, cost-aware caching, and epistemic honesty read as genuine product engineering."
          </blockquote>

          <p className="text-xs text-[#645C4F] font-mono">
            — Excerpt from Exploria Solo-Builder Engineering Plan • September 2026
          </p>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="px-6 sm:px-12 py-20 bg-[#FAF7EE] text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="font-serif-title text-4xl sm:text-5xl font-bold text-[#221E19]">
            Step into the Physical Discovery Engine
          </h2>
          <p className="text-base text-[#645C4F] max-w-xl mx-auto">
            Click anywhere on the physical cartography to inspect live RAG retrieval, vector similarity rankings, and verified cultural traditions.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onExploreNow()}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#DF795B] hover:bg-[#B94C2E] text-white font-bold text-base shadow-xl shadow-[#DF795B]/30 transition-all hover:scale-105 active:scale-95"
            >
              <span>Explore Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 sm:px-12 border-t border-[#221E19]/10 bg-[#EDE4CE] text-xs text-[#645C4F]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#567D77]" />
            <span className="font-bold text-[#221E19]">EXPLORIA</span>
            <span>• An AI Cultural & Culinary Discovery Engine</span>
          </div>
          <span>Solo-Builder Edition • Free-Tier Stack Throughout</span>
        </div>
      </footer>
    </div>
  );
};
