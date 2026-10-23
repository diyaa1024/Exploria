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
  MapPin,
  Landmark,
  UtensilsCrossed
} from 'lucide-react';

interface AtlasLandingPageProps {
  onExploreNow: (destination?: { lat: number; lng: number; name: string }) => void;
  onOpenArchitecture: () => void;
}

const CURATED_EXPEDITIONS = [
  {
    name: 'Kyoto, Japan',
    title: 'Imperial temples & the lore of Gion',
    tag: 'Living Heritage',
    lat: 35.0116,
    lng: 135.7681,
    bgBadge: 'bg-[#567D77]/15 text-[#37534F]'
  },
  {
    name: 'Varanasi, India',
    title: 'Ganges ghats & sacred mythology',
    tag: 'Spiritual Center',
    lat: 25.3176,
    lng: 82.9739,
    bgBadge: 'bg-[#DE9B35]/15 text-[#B8781B]'
  },
  {
    name: 'Oaxaca, Mexico',
    title: 'Ancestral moles & Zapotec traditions',
    tag: 'Culinary Capital',
    lat: 17.0732,
    lng: -96.7266,
    bgBadge: 'bg-[#DF795B]/15 text-[#B94C2E]'
  },
  {
    name: 'Edinburgh Castle, UK',
    title: 'The Royal Mile & a volcanic stronghold',
    tag: 'Fortress Quarter',
    lat: 55.9486,
    lng: -3.1999,
    bgBadge: 'bg-[#8E985A]/15 text-[#636D33]'
  }
];

const HOW_IT_WORKS = [
  {
    icon: <MapPin className="w-4 h-4" />,
    title: 'Pick a place',
    text: 'Tap anywhere on the map or search for a city, landmark or neighbourhood.',
    color: 'bg-[#567D77]/15 text-[#37534F]'
  },
  {
    icon: <BookOpen className="w-4 h-4" />,
    title: 'We check trusted sources',
    text: 'Encyclopedias, heritage registers and live maps are read in seconds, not guessed.',
    color: 'bg-[#DE9B35]/15 text-[#B8781B]'
  },
  {
    icon: <Landmark className="w-4 h-4" />,
    title: 'Culture, sights & food',
    text: 'Get the story of the place, what to see, and what to eat, each with its source.',
    color: 'bg-[#DF795B]/15 text-[#B94C2E]'
  },
  {
    icon: <UtensilsCrossed className="w-4 h-4" />,
    title: 'Real spots nearby',
    text: 'See actual restaurants and attractions around you, with distances and map links.',
    color: 'bg-[#8E985A]/15 text-[#636D33]'
  }
];

/* Muted section backgrounds: decorative only, kept faint so content stays the focus. */

/** Faded atlas print that dissolves into the section colour at the edges. */
const AtlasSectionBackdrop: React.FC<{ fade: string }> = ({ fade }) => (
  <div aria-hidden className="absolute inset-0 pointer-events-none">
    <div
      className="absolute inset-0 bg-cover bg-center opacity-[0.22] saturate-[0.5] sepia-[0.3]"
      style={{ backgroundImage: "url('/vintage_atlas_hero.jpg')" }}
    />
    <div
      className="absolute inset-0"
      style={{ background: `radial-gradient(ellipse at center, transparent 30%, ${fade} 85%)` }}
    />
  </div>
);

/** Fine latitude/longitude grid with a large compass-rose watermark. */
const GraticuleBackdrop: React.FC = () => (
  <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
    <div
      className="absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage:
          'linear-gradient(#221E19 1px, transparent 1px), linear-gradient(90deg, #221E19 1px, transparent 1px)',
        backgroundSize: '64px 64px'
      }}
    />
    <Compass
      strokeWidth={0.6}
      className="absolute -right-24 -bottom-24 w-[28rem] h-[28rem] text-[#B93F2C] opacity-[0.07]"
    />
    <Compass
      strokeWidth={0.6}
      className="absolute -left-20 -top-20 w-72 h-72 text-[#567D77] opacity-[0.06]"
    />
  </div>
);

/** Topographic contour rings radiating from opposite corners. */
const ContourBackdrop: React.FC = () => (
  <div
    aria-hidden
    className="absolute inset-0 pointer-events-none opacity-[0.6]"
    style={{
      backgroundImage: [
        'repeating-radial-gradient(circle at 0% 100%, transparent 0 26px, rgba(86,125,119,0.10) 26px 27px)',
        'repeating-radial-gradient(circle at 100% 0%, transparent 0 26px, rgba(185,63,44,0.08) 26px 27px)'
      ].join(', ')
    }}
  />
);

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
      summary: 'A National Special Historic Site and part of a UNESCO World Heritage listing. The pavilion you see today was rebuilt in 1955 after a fire.',
      evidence: 'Confirmed by official heritage registers and Japan’s Agency for Cultural Affairs.',
      source: 'UNESCO World Heritage Centre'
    },
    documented: {
      headline: 'Edo-Period Teahouse Customs',
      badge: 'Documented History',
      badgeColor: 'bg-[#567D77]/20 text-[#2C4A45] border-[#567D77]/60',
      icon: <BookOpen className="w-4 h-4 text-[#37534F]" />,
      summary: 'Travellers on the old Tokaido highway wrote about ritual matcha preparation and roadside sweets at teahouses along the way.',
      evidence: 'Recorded in 17th-century travel journals and merchant records. Details vary a little between accounts.',
      source: 'Kyoto historical records & travel accounts'
    },
    lore: {
      headline: 'The Sacred Foxes of Fushimi Inari',
      badge: 'Local Lore',
      badgeColor: 'bg-[#DF795B]/20 text-[#8E3218] border-[#DF795B]/60',
      icon: <Sparkles className="w-4 h-4 text-[#B94C2E]" />,
      summary: 'White fox statues guard the shrine gates, holding keys to the rice granaries. Locals believe they carry prayers to the deity Inari.',
      evidence: 'A cherished belief passed down through generations, shared as tradition rather than recorded fact.',
      source: 'Local Shinto folklore & oral tradition'
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
                The stories behind every place
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#524B3E]">
            <a href="#trusted-stories" className="hover:text-[#567D77] transition-colors">
              Fact or Folklore
            </a>
            <a href="#how-it-works" className="hover:text-[#567D77] transition-colors">
              How It Works
            </a>
            <a href="#destinations" className="hover:text-[#567D77] transition-colors">
              Destinations
            </a>
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
                <span>Free to explore • Anywhere on Earth</span>
              </div>

              <h1 className="font-serif-title text-4xl sm:text-5xl lg:text-6xl font-bold text-[#221E19] leading-[1.1] tracking-tight">
                Point anywhere on the map.{' '}
                <span className="italic text-[#B93F2C] font-normal">
                  Discover what truly happened there.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#524B3E] leading-relaxed font-normal">
                Why a place matters to the people who live there, what they believe about it, and where to eat nearby. Every story comes with its source, so you always know what's fact and what's folklore.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onExploreNow()}
                  className="flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#DF795B] hover:bg-[#B94C2E] text-white font-bold text-base shadow-xl shadow-[#DF795B]/30 transition-all hover:scale-105 active:scale-95"
                >
                  <Navigation className="w-5 h-5 text-white" />
                  <span>Start Exploring</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </button>

                <a
                  href="#how-it-works"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#F4EEDB] border border-[#221E19]/20 text-[#221E19] font-bold text-base shadow-sm transition-all"
                >
                  <Compass className="w-4 h-4 text-[#567D77]" />
                  <span>How It Works</span>
                </a>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#221E19]/10 text-xs font-semibold text-[#524B3E]">
                <div className="p-3 rounded-xl bg-white/70 border border-[#221E19]/10">
                  <span className="block text-lg font-bold text-[#37534F] font-serif-title">Anywhere</span>
                  <span>Any city, town or landmark</span>
                </div>
                <div className="p-3 rounded-xl bg-white/70 border border-[#221E19]/10">
                  <span className="block text-lg font-bold text-[#DE9B35] font-serif-title">Seconds</span>
                  <span>To a full local guide</span>
                </div>
                <div className="p-3 rounded-xl bg-white/70 border border-[#221E19]/10">
                  <span className="block text-lg font-bold text-[#DF795B] font-serif-title">Sourced</span>
                  <span>Every story, every time</span>
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
                    alt="Vintage illustrated world atlas"
                    className="w-full h-auto object-cover transform group-hover:scale-102 transition-transform duration-700"
                  />

                  {/* Engraved Title Overlay */}
                  <div className="absolute top-4 left-4 bg-[#FAF7EE]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-[#221E19]/20 shadow-md">
                    <span className="font-cinzel text-xs font-bold uppercase tracking-widest text-[#B93F2C] block">
                      Plate No. VII • Polar Azimuthal
                    </span>
                    <span className="font-serif-title text-sm font-bold text-[#221E19]">
                      Culture, Sights & Food, Worldwide
                    </span>
                  </div>

                  {/* Interactive Trigger Pill on the Image */}
                  <div className="absolute bottom-4 right-4">
                    <button
                      onClick={() => onExploreNow()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#221E19] text-[#FAF7EE] text-xs font-bold shadow-xl hover:bg-[#B93F2C] transition-colors"
                    >
                      <span>Open the Map</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Fact or Folklore */}
      <section id="trusted-stories" className="relative overflow-hidden px-6 sm:px-12 py-16 bg-[#F5EFE1] border-b border-[#221E19]/10 scroll-mt-20">
        <GraticuleBackdrop />
        <div className="relative max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#DF795B] font-cinzel">
              Stories You Can Trust
            </span>
            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#221E19]">
              Know what's fact and what's folklore
            </h2>
            <p className="text-sm sm:text-base text-[#645C4F]">
              Most travel apps mix history and legend together. Exploria labels every story, so you can enjoy the myths and still know the facts.
            </p>
          </div>

          {/* Tier Switcher */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveTier('verified')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
                activeTier === 'verified'
                  ? 'bg-[#8E985A] text-white shadow-md'
                  : 'bg-white text-[#524B3E] hover:bg-[#FAF7EE] border border-[#221E19]/10'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Fact</span>
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
              <span>Documented History</span>
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
              <span>Local Lore</span>
            </button>
          </div>

          {/* Example Story Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTier}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto rounded-3xl bg-white border-2 border-[#221E19]/15 shadow-xl"
            >
              <div className="p-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${tierExamples[activeTier].badgeColor}`}>
                    {tierExamples[activeTier].icon}
                    {tierExamples[activeTier].badge}
                  </span>
                  <span className="text-xs font-mono text-[#6F6656]">Kyoto, Japan</span>
                </div>
                <h3 className="font-serif-title text-2xl font-bold text-[#221E19] mb-4">
                  {tierExamples[activeTier].headline}
                </h3>

                <p className="text-base text-[#221E19] leading-relaxed mb-5 font-normal">
                  {tierExamples[activeTier].summary}
                </p>

                <div className="space-y-3 pt-4 border-t border-[#221E19]/10 text-xs">
                  <div className="flex items-start gap-2 bg-[#FAF7EE] p-3.5 rounded-xl border border-[#221E19]/10">
                    <span className="font-bold text-[#37534F] uppercase tracking-wider shrink-0 mt-0.5">
                      Why this label:
                    </span>
                    <span className="text-[#524B3E] font-medium leading-relaxed">
                      {tierExamples[activeTier].evidence}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-bold text-[#6F6656] pt-1">
                    <ExternalLink className="w-3.5 h-3.5 text-[#567D77]" />
                    Source: {tierExamples[activeTier].source}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative overflow-hidden px-6 sm:px-12 py-16 bg-[#FAF7EE] border-b border-[#221E19]/10 scroll-mt-20">
        <ContourBackdrop />
        <div className="relative max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#567D77] font-cinzel">
              How It Works
            </span>
            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#221E19]">
              A local guide in four simple steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((step, idx) => (
              <div key={step.title} className="p-6 rounded-2xl bg-white border border-[#221E19]/15 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center ${step.color}`}>
                    {step.icon}
                  </div>
                  <span className="text-xs font-bold text-[#8C8272] font-mono">0{idx + 1}</span>
                </div>
                <h3 className="font-serif-title text-lg font-bold text-[#221E19]">{step.title}</h3>
                <p className="text-sm text-[#645C4F] leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section id="destinations" className="relative overflow-hidden px-6 sm:px-12 py-16 bg-[#F4EEDB] border-b border-[#221E19]/10 scroll-mt-20">
        <AtlasSectionBackdrop fade="#F4EEDB" />
        <div className="relative max-w-6xl mx-auto space-y-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#B93F2C] font-cinzel">
                Where Will You Go First?
              </span>
              <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#221E19] mt-1">
                Featured Destinations
              </h2>
            </div>
            <button
              onClick={() => onExploreNow()}
              className="text-sm font-bold text-[#567D77] hover:text-[#37534F] flex items-center gap-1.5 transition-colors"
            >
              <span>Explore the full map</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CURATED_EXPEDITIONS.map((exp) => (
              <div
                key={exp.name}
                className="rounded-2xl bg-white border-2 border-[#221E19]/10 shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="p-6 h-full flex flex-col justify-between">
                  <div>
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md mb-3 inline-block ${exp.bgBadge}`}>
                      {exp.tag}
                    </span>
                    <h3 className="font-serif-title text-xl font-bold text-[#221E19]">
                      {exp.name}
                    </h3>
                    <p className="text-xs text-[#524B3E] mt-1 font-medium">
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="px-6 sm:px-12 py-16 bg-[#FAF7EE] text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="font-serif-title text-4xl sm:text-5xl font-bold text-[#221E19]">
            Your next discovery is one click away
          </h2>
          <p className="text-base text-[#645C4F] max-w-xl mx-auto">
            Open the map, pick any place, and see its stories, sights and flavours in seconds.
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
            <span>• Culture, sights & food for every place on Earth</span>
          </div>
          <button
            onClick={onOpenArchitecture}
            className="flex items-center gap-1 hover:text-[#221E19] transition-colors"
          >
            <Cpu className="w-3.5 h-3.5" />
            For developers: system design
          </button>
        </div>
      </footer>
    </div>
  );
};
