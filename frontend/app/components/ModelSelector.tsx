'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  generateModelInterpretations,
  suggestPiecesForShape,
  getPieceInfo,
  type ModelInterpretation,
  type ConversionResult,
  ALL_PIECES,
} from '../../lib/geminiLegoConverter';
import type { PieceCount } from '../../lib/legoManualGenerator';

interface ModelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  pieceCount: PieceCount;
  roomType: string;
  totalBricks: number;
  onSelectModel: (interpretation: ModelInterpretation) => void;
}

export default function ModelSelector({
  isOpen,
  onClose,
  pieceCount,
  roomType,
  totalBricks,
  onSelectModel,
}: ModelSelectorProps) {
  const [interpretations, setInterpretations] = useState<ModelInterpretation[]>([]);
  const [selectedId, setSelectedId] = useState<string>('realistic');
  const [isLoading, setIsLoading] = useState(false);
  const [abstractQuery, setAbstractQuery] = useState('');
  const [shapeSuggestion, setShapeSuggestion] = useState<{
    pieces: Array<{ id: string; name: string; reason: string }>;
    technique: string;
  } | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);

  const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  useEffect(() => {
    if (isOpen && pieceCount.breakdown.length > 0 && interpretations.length === 0) {
      loadInterpretations();
    }
  }, [isOpen, pieceCount]);

  const loadInterpretations = async () => {
    setIsLoading(true);
    try {
      const result = await generateModelInterpretations(
        pieceCount.breakdown.map(p => ({
          part_id: p.part_id,
          quantity: p.quantity,
          piece_name: p.piece_name,
        })),
        roomType,
        totalBricks,
        geminiApiKey
      );
      setConversionResult(result);
      setInterpretations(result.interpretations);
      console.log('[ModelSelector] Loaded interpretations:', result.interpretations.length);
    } catch (error) {
      console.error('[ModelSelector] Failed to load interpretations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShapeQuery = () => {
    if (abstractQuery.trim()) {
      const suggestion = suggestPiecesForShape(abstractQuery);
      setShapeSuggestion(suggestion);
    }
  };

  const handleApply = () => {
    const selected = interpretations.find(i => i.id === selectedId);
    if (selected) {
      onSelectModel(selected);
      onClose();
    }
  };

  if (!isOpen) return null;

  const selectedInterpretation = interpretations.find(i => i.id === selectedId);

  return (
    <div className="model-selector-overlay" onClick={onClose}>
      <motion.div
        className="model-selector-container"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="model-selector-header">
          <div className="header-icon">🧱</div>
          <div>
            <h2>LEGO Model Interpreter</h2>
            <p>Choose how to build your model with AI-powered suggestions</p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Main Content */}
        <div className="model-selector-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Analyzing your model with Gemini AI...</p>
              <p className="loading-subtext">Referencing LEGO piece database</p>
            </div>
          ) : (
            <>
              {/* Model Options */}
              <div className="model-options">
                <h3>Select Build Style</h3>
                <div className="options-grid">
                  {interpretations.map((interp) => (
                    <div
                      key={interp.id}
                      className={`model-option ${selectedId === interp.id ? 'selected' : ''}`}
                      onClick={() => setSelectedId(interp.id)}
                    >
                      <div className="option-header">
                        <span className="option-icon">
                          {interp.style === 'realistic' && '🏛️'}
                          {interp.style === 'simplified' && '🎯'}
                          {interp.style === 'stylized' && '🎨'}
                          {interp.style === 'micro' && '🔬'}
                        </span>
                        <span className="option-name">{interp.name}</span>
                      </div>
                      <p className="option-description">{interp.description}</p>
                      <div className="option-stats">
                        <span className="stat">
                          <strong>{interp.pieceCount}</strong> pieces
                        </span>
                        <span className={`difficulty ${interp.difficulty.toLowerCase()}`}>
                          {interp.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Model Details */}
              {selectedInterpretation && (
                <div className="model-details">
                  <h3>Suggested Pieces</h3>
                  <div className="pieces-list">
                    {selectedInterpretation.suggestedPieces.slice(0, 8).map((piece, idx) => {
                      const pieceInfo = getPieceInfo(piece.part_id);
                      return (
                        <div key={idx} className="piece-item">
                          <div className="piece-icon" style={{
                            backgroundColor: ['#E3000B', '#0055BF', '#237841', '#FFCA28'][idx % 4]
                          }}>
                            🧱
                          </div>
                          <div className="piece-info">
                            <div className="piece-name">{piece.name}</div>
                            <div className="piece-meta">
                              ID: {piece.part_id}
                              {pieceInfo && ` • ${pieceInfo.size.join('×')}`}
                            </div>
                            <div className="piece-reason">{piece.reason}</div>
                          </div>
                          <div className="piece-qty">×{piece.quantity}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Build Notes */}
                  <div className="build-notes">
                    <h4>📝 Build Notes</h4>
                    <ul>
                      {selectedInterpretation.buildNotes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Abstract Shape Helper */}
              <div className="shape-helper">
                <h3>🔍 Abstract Shape Helper</h3>
                <p>Need help building a specific shape? Describe it below:</p>
                <div className="shape-input-row">
                  <input
                    type="text"
                    placeholder="e.g., curved wall, sloped roof, round pillar..."
                    value={abstractQuery}
                    onChange={(e) => setAbstractQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleShapeQuery()}
                  />
                  <button onClick={handleShapeQuery}>Suggest Pieces</button>
                </div>
                
                {shapeSuggestion && (
                  <div className="shape-suggestion">
                    <h4>Recommended Pieces:</h4>
                    <div className="suggestion-pieces">
                      {shapeSuggestion.pieces.map((piece, idx) => (
                        <div key={idx} className="suggestion-piece">
                          <span className="piece-id">{piece.id}</span>
                          <span className="piece-name">{piece.name}</span>
                          <span className="piece-reason">{piece.reason}</span>
                        </div>
                      ))}
                    </div>
                    <div className="technique-tip">
                      <strong>💡 Technique:</strong> {shapeSuggestion.technique}
                    </div>
                  </div>
                )}
              </div>

              {/* Abstract Shape Suggestions from AI */}
              {conversionResult?.abstractShapeSuggestions && conversionResult.abstractShapeSuggestions.length > 0 && (
                <div className="ai-suggestions">
                  <h3>🤖 AI Shape Suggestions</h3>
                  <div className="suggestions-grid">
                    {conversionResult.abstractShapeSuggestions.map((suggestion, idx) => (
                      <div key={idx} className="ai-suggestion-card">
                        <div className="suggestion-shape">{suggestion.shape}</div>
                        <div className="suggestion-pieces-list">
                          {suggestion.suggestedPieces.map((pid, i) => {
                            const info = getPieceInfo(pid);
                            return (
                              <span key={i} className="suggestion-piece-tag">
                                {info?.name || pid}
                              </span>
                            );
                          })}
                        </div>
                        <div className="suggestion-technique">{suggestion.technique}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="model-selector-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleApply}
            disabled={!selectedInterpretation || isLoading}
          >
            Apply {selectedInterpretation?.name || 'Model'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
