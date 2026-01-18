/**
 * ModelDetailsDisplay - Shows detailed information about a scanned LEGO model
 * Displays model name, type, pieces used, and specifications
 */

import React from 'react';
import { motion } from 'framer-motion';

interface ModelAnalysis {
  modelName: string;
  modelType: string;
  description: string;
  extractedPieces: Array<{
    part_id: string;
    name: string;
    quantity: number;
    color_id?: number;
    color_name?: string;
    reasoning: string;
  }>;
}

interface ModelDetailsDisplayProps {
  modelAnalysis: ModelAnalysis;
  onClose: () => void;
}

const LEGO_COLORS: Record<number, string> = {
  0: '#1B1B1B',
  1: '#0055BF',
  2: '#237841',
  4: '#C91A09',
  5: '#C870A0',
  6: '#583927',
  7: '#9BA19D',
  8: '#6D6E5C',
  9: '#4FA3D1',
  14: '#F2CD37',
  15: '#FFFFFF',
  19: '#E4CD9E',
  25: '#FE8A18',
  28: '#958A73',
};

export const ModelDetailsDisplay: React.FC<ModelDetailsDisplayProps> = ({
  modelAnalysis,
  onClose,
}) => {
  const totalPieces = modelAnalysis.extractedPieces.reduce((sum, p) => sum + p.quantity, 0);
  const uniquePieces = modelAnalysis.extractedPieces.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm font-bold opacity-90">LEGO MODEL DETAILS</p>
            <h1 className="text-3xl font-black mt-1">{modelAnalysis.modelName}</h1>
            <p className="text-sm opacity-90 mt-2">{modelAnalysis.modelType}</p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl opacity-75 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h2 className="text-lg font-black text-gray-900 mb-2">📝 Description</h2>
            <p className="text-gray-700 leading-relaxed">{modelAnalysis.description}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center border-2 border-blue-200">
              <p className="text-3xl font-black text-blue-600">{totalPieces}</p>
              <p className="text-xs font-bold text-blue-600 mt-1">TOTAL PIECES</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center border-2 border-green-200">
              <p className="text-3xl font-black text-green-600">{uniquePieces}</p>
              <p className="text-xs font-bold text-green-600 mt-1">PIECE TYPES</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center border-2 border-purple-200">
              <p className="text-3xl font-black text-purple-600">
                {modelAnalysis.extractedPieces.filter(p => p.color_id !== undefined).length}
              </p>
              <p className="text-xs font-bold text-purple-600 mt-1">COLORS USED</p>
            </div>
          </div>

          {/* Pieces Table */}
          <div>
            <h2 className="text-lg font-black text-gray-900 mb-3">🧱 Pieces Used</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {modelAnalysis.extractedPieces.map((piece, idx) => {
                const colorHex = piece.color_id !== undefined ? LEGO_COLORS[piece.color_id] : '#CCCCCC';
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    {/* Color swatch */}
                    <div
                      className="w-10 h-8 rounded-lg flex-shrink-0"
                      style={{
                        backgroundColor: colorHex,
                        border: '1px solid rgba(0,0,0,0.2)',
                      }}
                    />
                    
                    {/* Piece info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900">
                        {piece.quantity}× {piece.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {piece.color_name && `${piece.color_name} • `}
                        {piece.reasoning}
                      </p>
                    </div>
                    
                    {/* Part ID */}
                    <div className="text-xs font-mono bg-gray-200 px-2 py-1 rounded text-gray-700">
                      {piece.part_id}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
            <p className="text-xs font-black text-blue-900 mb-1">💡 PRO TIP</p>
            <p className="text-sm text-blue-800">
              Use these specific pieces to recreate this LEGO model. The pieces are optimized based on the 3D
              geometry and design of the scanned object.
            </p>
          </div>
        </div>

        {/* Close button at bottom */}
        <div className="sticky bottom-0 bg-gray-100 p-4 border-t">
          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
