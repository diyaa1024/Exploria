import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, ShieldCheck, CheckCircle, Server, Rocket, Award } from 'lucide-react';

interface SystemDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemDesignModal: React.FC<SystemDesignModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'epistemic' | 'freetier' | 'interview' | 'roadmap'>('architecture');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-5xl bg-[#131F1E] border border-[#EDE4CE]/25 rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#EDE4CE]/20 bg-[#1A2827]/95">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#DF795B] via-[#DE9B35] to-[#567D77] text-[#131F1E] shadow-lg shadow-[#DF795B]/20">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#FAF6ED] font-['Fraunces'] tracking-tight">
                  System Design & Engineering Architecture
                </h3>
                <p className="text-sm sm:text-base text-[#B8C4C2] mt-0.5">
                  EXPLORIA • Solo-Builder Edition (Free-Tier Stack & Grounded Cartography)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-[#B8C4C2] hover:text-[#FAF6ED] hover:bg-[#203331] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Sub Navigation */}
          <div className="flex border-b border-[#EDE4CE]/20 bg-[#142221] px-6 sm:px-8 overflow-x-auto text-xs sm:text-sm font-bold">
            <button
              onClick={() => setActiveTab('architecture')}
              className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'architecture'
                  ? 'border-[#DE9B35] text-[#DE9B35]'
                  : 'border-transparent text-[#B8C4C2] hover:text-[#FAF6ED]'
              }`}
            >
              <Server className="w-4 h-4" />
              End-to-End Pipeline
            </button>

            <button
              onClick={() => setActiveTab('epistemic')}
              className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'epistemic'
                  ? 'border-[#DF795B] text-[#DF795B]'
                  : 'border-transparent text-[#B8C4C2] hover:text-[#FAF6ED]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Epistemic Honesty Layer
            </button>

            <button
              onClick={() => setActiveTab('freetier')}
              className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'freetier'
                  ? 'border-[#8E985A] text-[#8E985A]'
                  : 'border-transparent text-[#B8C4C2] hover:text-[#FAF6ED]'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Free-Tier Reality Matrix
            </button>

            <button
              onClick={() => setActiveTab('interview')}
              className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'interview'
                  ? 'border-[#DE9B35] text-[#DE9B35]'
                  : 'border-transparent text-[#B8C4C2] hover:text-[#FAF6ED]'
              }`}
            >
              <Award className="w-4 h-4" />
              Interview Talking Points
            </button>

            <button
              onClick={() => setActiveTab('roadmap')}
              className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'roadmap'
                  ? 'border-[#567D77] text-[#567D77]'
                  : 'border-transparent text-[#B8C4C2] hover:text-[#FAF6ED]'
              }`}
            >
              <Rocket className="w-4 h-4" />
              Phase 2/3 Roadmap
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto space-y-6 text-[#FAF6ED]">
            {activeTab === 'architecture' && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-[#182625] border border-[#EDE4CE]/20">
                  <h4 className="text-lg sm:text-xl font-bold text-[#FAF6ED] mb-2 flex items-center gap-2.5 font-['Fraunces']">
                    <span className="w-3 h-3 rounded-full bg-[#DE9B35]" />
                    Linear, Inspectable RAG Architecture
                  </h4>
                  <p className="text-sm sm:text-base text-[#B8C4C2] leading-relaxed">
                    Unlike brittle prompt wrappers, Exploria implements a decoupled 6-stage physical discovery pipeline where each layer is testable and cached independently.
                  </p>
                </div>

                {/* ASCII Architecture Flowchart */}
                <div className="bg-[#101A19] p-5 sm:p-6 rounded-2xl border border-[#EDE4CE]/20 font-mono text-xs sm:text-sm text-[#DE9B35] overflow-x-auto leading-relaxed shadow-inner">
                  <pre>{`User clicks map or enters search query
  │
  ▼
[1] Reverse Geocode (Google / OSM Nominatim) + Wikidata Entity Lookup
  │
  ▼
[2] Multi-Source Document Harvesting:
    ├── Wikipedia REST API (Summary & Section Extracts)
    ├── OpenStreetMap Overpass (Heritage Sites, Monuments, Architecture)
    └── OSM / Foursquare Registry (Regional Eateries & Culinary Traditions)
  │
  ▼
[3] Chunking (Sliding 500-char window + 70-char overlap)
  │
  ▼
[4] Dense Vector Embeddings (Gemini text-embedding-004) & Cosine Retrieval
    ├── Cultural Significance Top-3 Chunks
    ├── Tourist Highlights Top-3 Chunks
    └── Culinary & Food Top-3 Chunks
  │
  ▼
[5] Parallel Structured GenAI Generation (Gemini 2.5 Flash, JSON Mode)
    └── Tags every claim: "Verified" / "Documented" / "Local lore"
  │
  ▼
[6] Response Cache (Geo-hash rounded disk storage) ──► React UI Animated Cards`}</pre>
                </div>
              </div>
            )}

            {activeTab === 'epistemic' && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-[#DF795B]/15 border border-[#DF795B]/40">
                  <h4 className="text-lg sm:text-xl font-bold text-[#FAF6ED] mb-2 font-['Fraunces']">
                    The Product Differentiator: Epistemic Honesty
                  </h4>
                  <p className="text-sm sm:text-base text-[#FAF6ED] leading-relaxed">
                    Most AI travel assistants hallucinate folklore as historical fact or flatten sacred myths into generic tourist blurbs. Exploria treats epistemic confidence as a foundational product decision.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-[#182625] border border-[#8E985A]/50 shadow-md">
                    <span className="text-sm font-bold text-[#8E985A] uppercase tracking-wider block mb-1.5 font-['Fraunces']">
                      Verified
                    </span>
                    <p className="text-xs sm:text-sm text-[#B8C4C2] leading-relaxed">
                      Hard historical dates, architectural measurements, UNESCO listings, legal designations, and scientifically consensus facts.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#182625] border border-[#567D77]/50 shadow-md">
                    <span className="text-sm font-bold text-[#567D77] uppercase tracking-wider block mb-1.5 font-['Fraunces']">
                      Documented
                    </span>
                    <p className="text-xs sm:text-sm text-[#B8C4C2] leading-relaxed">
                      Recorded in historical chronicles, secondary historical accounts, travelogues, or municipal archives where perspectives may vary.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#182625] border border-[#DF795B]/50 shadow-md">
                    <span className="text-sm font-bold text-[#DF795B] uppercase tracking-wider block mb-1.5 font-['Fraunces']">
                      Local Lore
                    </span>
                    <p className="text-xs sm:text-sm text-[#B8C4C2] leading-relaxed">
                      Oral folklore, spiritual beliefs, mythology, ghost stories, and neighborhood traditions cherished by the community.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'freetier' && (
              <div className="space-y-4">
                <p className="text-sm sm:text-base text-[#B8C4C2]">
                  Built to run 100% on verified free tiers with zero required subscriptions:
                </p>

                <div className="overflow-x-auto border border-[#EDE4CE]/20 rounded-2xl shadow-md">
                  <table className="w-full text-left text-xs sm:text-sm text-[#FAF6ED]">
                    <thead className="bg-[#182625] text-[#DE9B35] uppercase font-bold text-xs sm:text-sm">
                      <tr>
                        <th className="p-4">Layer</th>
                        <th className="p-4">Provider</th>
                        <th className="p-4">Free-Tier Reality</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDE4CE]/10 bg-[#131F1E]">
                      <tr>
                        <td className="p-4 font-bold text-[#FAF6ED] font-['Fraunces']">LLM Generation</td>
                        <td className="p-4 font-semibold text-[#DF795B]">Gemini 2.5 Flash</td>
                        <td className="p-4 text-[#B8C4C2]">Free via Google AI Studio API key with generous RPM quotas.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-[#FAF6ED] font-['Fraunces']">Embeddings</td>
                        <td className="p-4 font-semibold text-[#DF795B]">text-embedding-004</td>
                        <td className="p-4 text-[#B8C4C2]">Included free via same AI Studio key.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-[#FAF6ED] font-['Fraunces']">Physical POI Data</td>
                        <td className="p-4 font-semibold text-[#DF795B]">Wikipedia & OSM</td>
                        <td className="p-4 text-[#B8C4C2]">Completely free, open public APIs, no credit card required.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-[#FAF6ED] font-['Fraunces']">Maps</td>
                        <td className="p-4 font-semibold text-[#DF795B]">OpenStreetMap / Google</td>
                        <td className="p-4 text-[#B8C4C2]">Leaflet/OSM (free, no key) + ESRI Canvas basemaps.</td>
                      </tr>
                      <tr>
                        <td className="p-4 font-bold text-[#FAF6ED] font-['Fraunces']">Cost Control</td>
                        <td className="p-4 font-semibold text-[#DF795B]">Disk Response Cache</td>
                        <td className="p-4 text-[#B8C4C2]">Sub-10ms response on cache hits, prevents repetitive LLM token costs.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'interview' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[#DE9B35]/15 border border-[#DE9B35]/40 shadow-sm">
                  <h4 className="text-base sm:text-lg font-bold text-[#DE9B35] mb-1.5 font-['Fraunces']">
                    Resume & Technical Interview Framing
                  </h4>
                  <p className="text-sm sm:text-base text-[#FAF6ED] leading-relaxed">
                    "An AI discovery engine that grounds tourist, cultural, and food recommendations in verified sources through retrieval-augmented generation, ranks them geospatially, and clearly separates fact from folklore."
                  </p>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="p-4 rounded-xl bg-[#182625] border border-[#EDE4CE]/20">
                    <span className="font-bold text-[#8E985A] text-sm sm:text-base">1. RAG Grounding vs. Prompt Wrapper:</span>
                    <p className="text-[#B8C4C2] mt-1 leading-relaxed">Demonstrates real knowledge chunking, embeddings retrieval, and citation verification rather than relying on LLM hallucinatory memory.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#182625] border border-[#EDE4CE]/20">
                    <span className="font-bold text-[#567D77] text-sm sm:text-base">2. Cost-Aware Systems Design:</span>
                    <p className="text-[#B8C4C2] mt-1 leading-relaxed">Geo-coordinate clustering cache preserves free tier quotas and simulates enterprise latency SLA optimization.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#182625] border border-[#EDE4CE]/20">
                    <span className="font-bold text-[#DF795B] text-sm sm:text-base">3. Epistemic Product Sense:</span>
                    <p className="text-[#B8C4C2] mt-1 leading-relaxed">Distinguishing verified history from community myth demonstrates user trust empathy in consumer AI.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'roadmap' && (
              <div className="space-y-4">
                <p className="text-sm sm:text-base text-[#B8C4C2]">
                  Deliberately scoped MVP (shipping a tight, flawless core loop). Future phases documented for roadmap vision:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-[#182625] border border-[#EDE4CE]/20 shadow-md">
                    <span className="font-bold text-base sm:text-lg text-[#FAF6ED] block mb-1.5 font-['Fraunces']">Phase 2: Multimodal Walking Tours</span>
                    <p className="text-xs sm:text-sm text-[#B8C4C2] leading-relaxed">Gemini Vision image-to-place recognition and step-by-step geospatial routing.</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#182625] border border-[#EDE4CE]/20 shadow-md">
                    <span className="font-bold text-base sm:text-lg text-[#FAF6ED] block mb-1.5 font-['Fraunces']">Phase 3: Time-Travel Mode</span>
                    <p className="text-xs sm:text-sm text-[#B8C4C2] leading-relaxed">Slider allowing users to view cultural intelligence at specific historical centuries (e.g. Kyoto 1603 vs 2026).</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 sm:px-8 py-4 border-t border-[#EDE4CE]/20 bg-[#1A2827]/95 flex items-center justify-between">
            <span className="text-xs sm:text-sm text-[#B8C4C2] font-medium">Polar Cartography Discovery Engine</span>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#DF795B] to-[#DE9B35] text-[#131F1E] font-extrabold text-sm shadow-lg transition-opacity hover:opacity-95 active:scale-95"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
