import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, Layers, FileText, ExternalLink } from 'lucide-react';
import type { PlaceResponse } from '../types';

interface RAGInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PlaceResponse | null;
}

export const RAGInspectorModal: React.FC<RAGInspectorModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  if (!isOpen) return null;

  const debugChunks = data?.rag_debug_chunks || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-4xl bg-[#131F1E] border border-[#EDE4CE]/25 rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-6"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#EDE4CE]/20 bg-[#1A2827]/95">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#DF795B]/20 border border-[#DF795B]/40 text-[#DF795B] shadow-md shadow-[#DF795B]/20">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#FAF6ED] font-['Fraunces'] tracking-tight">
                  RAG Evidence & Vector Pipeline Inspector
                </h3>
                <p className="text-xs sm:text-sm text-[#B8C4C2] mt-0.5">
                  Inspect candidate chunks, similarity rankings, and grounded retrieval stages
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#B8C4C2] hover:text-[#FAF6ED] hover:bg-[#203331] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Pipeline Architecture Flowchart */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#DE9B35] mb-2.5 flex items-center gap-1.5 font-mono">
                <Layers className="w-4 h-4 text-[#DE9B35]" />
                Live Execution Flow
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 text-center text-xs">
                <div className="p-3 rounded-xl bg-[#182625] border border-[#EDE4CE]/15 flex flex-col items-center justify-center gap-1.5 shadow-sm">
                  <span className="w-6 h-6 rounded-full bg-[#8E985A]/20 text-[#8E985A] font-bold flex items-center justify-center text-xs border border-[#8E985A]/30">1</span>
                  <span className="font-bold text-[#FAF6ED] font-['Fraunces']">Map Click</span>
                  <span className="text-[10px] text-[#B8C4C2] font-mono">
                    {data ? `${data.latitude.toFixed(2)}, ${data.longitude.toFixed(2)}` : 'Lat / Lng'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#182625] border border-[#EDE4CE]/15 flex flex-col items-center justify-center gap-1.5 shadow-sm">
                  <span className="w-6 h-6 rounded-full bg-[#567D77]/25 text-[#567D77] font-bold flex items-center justify-center text-xs border border-[#567D77]/30">2</span>
                  <span className="font-bold text-[#FAF6ED] font-['Fraunces']">Candidate Docs</span>
                  <span className="text-[10px] text-[#B8C4C2]">Wiki + OSM + Wikidata</span>
                </div>

                <div className="p-3 rounded-xl bg-[#182625] border border-[#EDE4CE]/15 flex flex-col items-center justify-center gap-1.5 shadow-sm">
                  <span className="w-6 h-6 rounded-full bg-[#DF795B]/20 text-[#DF795B] font-bold flex items-center justify-center text-xs border border-[#DF795B]/30">3</span>
                  <span className="font-bold text-[#FAF6ED] font-['Fraunces']">Vector Chunking</span>
                  <span className="text-[10px] text-[#B8C4C2]">text-embedding-004</span>
                </div>

                <div className="p-3 rounded-xl bg-[#182625] border border-[#EDE4CE]/15 flex flex-col items-center justify-center gap-1.5 shadow-sm">
                  <span className="w-6 h-6 rounded-full bg-[#DE9B35]/20 text-[#DE9B35] font-bold flex items-center justify-center text-xs border border-[#DE9B35]/30">4</span>
                  <span className="font-bold text-[#FAF6ED] font-['Fraunces']">Top-k Retrieval</span>
                  <span className="text-[10px] text-[#B8C4C2]">Cosine Similarity</span>
                </div>

                <div className="p-3 rounded-xl bg-[#182625] border border-[#EDE4CE]/15 flex flex-col items-center justify-center gap-1.5 shadow-sm">
                  <span className="w-6 h-6 rounded-full bg-[#8E985A]/20 text-[#8E985A] font-bold flex items-center justify-center text-xs border border-[#8E985A]/30">5</span>
                  <span className="font-bold text-[#FAF6ED] font-['Fraunces']">Gemini GenAI</span>
                  <span className="text-[10px] text-[#B8C4C2]">Epistemic JSON</span>
                </div>
              </div>
            </div>

            {/* Candidate Chunks Retrieved */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#DF795B] flex items-center gap-1.5 font-mono">
                  <FileText className="w-4 h-4 text-[#DF795B]" />
                  Retrieved Candidate Chunks ({debugChunks.length > 0 ? debugChunks.length : data?.rag_chunks_used || 0})
                </h4>
                <span className="text-xs font-semibold text-[#B8C4C2]">
                  Ranked by dense vector similarity
                </span>
              </div>

              {debugChunks.length > 0 ? (
                <div className="space-y-3">
                  {debugChunks.map((chunk, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#182625] border border-[#EDE4CE]/20 hover:border-[#DE9B35]/60 transition-all shadow-md"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#DF795B]/20 text-[#DF795B] border border-[#DF795B]/40">
                            {chunk.source}
                          </span>
                          <span className="font-bold text-sm sm:text-base text-[#FAF6ED] font-['Fraunces']">
                            {chunk.title}
                          </span>
                        </div>
                        {chunk.similarity_score !== undefined && (
                          <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#8E985A] bg-[#8E985A]/10 px-2 py-0.5 rounded-md border border-[#8E985A]/30">
                            <span>Score:</span>
                            <span>{chunk.similarity_score}</span>
                          </div>
                        )}
                      </div>

                      {/* Legible, comfortable Chunk Text */}
                      <p className="text-xs sm:text-[13.5px] text-[#FAF6ED] leading-relaxed bg-[#131F1E] p-3.5 rounded-xl border border-[#EDE4CE]/15 font-normal">
                        {chunk.content}
                      </p>

                      {chunk.url && (
                        <a
                          href={chunk.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 text-xs text-[#DE9B35] hover:text-[#FAF6ED] transition-colors font-semibold"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Inspect Original Web Source</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-[#B8C4C2] text-sm border border-dashed border-[#EDE4CE]/20 rounded-xl">
                  Select a location on the map to trigger RAG document extraction and examine chunks.
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-5 sm:px-6 py-3 border-t border-[#EDE4CE]/20 bg-[#1A2827]/95 flex items-center justify-between text-xs text-[#B8C4C2]">
            <span>Exploria • Polar Cartographic Discovery Engine</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#DF795B] to-[#DE9B35] text-[#131F1E] font-bold text-xs shadow-md transition-opacity hover:opacity-95"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
