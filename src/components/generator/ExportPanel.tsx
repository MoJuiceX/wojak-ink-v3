/**
 * Export Panel Component
 *
 * Modal for exporting the Wojak with format and size options.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Download, Image, Check } from 'lucide-react';
import { useGenerator } from '@/contexts/GeneratorContext';
import type { ExportOptions } from '@/types/generator';
import { CANVAS_CONFIG } from '@/config/layers';
import {
  modalBackdropVariants,
  modalContentVariants,
  exportOptionVariants,
} from '@/config/generatorAnimations';

type ExportFormat = 'png' | 'jpeg' | 'webp';
type ExportSizePreset = '512' | '1024' | '2048';

const FORMAT_OPTIONS: { value: ExportFormat; label: string; description: string }[] = [
  { value: 'png', label: 'PNG', description: 'Lossless, transparent background' },
  { value: 'jpeg', label: 'JPEG', description: 'Smaller file, no transparency' },
  { value: 'webp', label: 'WebP', description: 'Modern format, best compression' },
];

const SIZE_OPTIONS: { value: ExportSizePreset; label: string; description: string }[] = [
  { value: '512', label: '512×512', description: 'Standard size' },
  { value: '1024', label: '1024×1024', description: 'High quality' },
  { value: '2048', label: '2048×2048', description: 'Maximum resolution' },
];

interface ExportPanelProps {
  className?: string;
}

export function ExportPanel({ className = '' }: ExportPanelProps) {
  const { isExportOpen, toggleExport, exportWojak, previewImage, favorites } = useGenerator();
  const prefersReducedMotion = useReducedMotion();

  // Generate the next project name (same logic as favorites)
  const getNextProjectName = () => {
    const projectNumbers = favorites
      .map((f) => {
        const match = f.name.match(/^Wojak\s*(\d+)$/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n > 0);

    const nextNumber = projectNumbers.length > 0 ? Math.max(...projectNumbers) + 1 : 1;
    return `Wojak ${nextNumber}`;
  };

  const [format, setFormat] = useState<ExportFormat>('png');
  const [sizePreset, setSizePreset] = useState<ExportSizePreset>('1024');
  const [includeBackground, setIncludeBackground] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Fixed quality for JPEG/WebP exports
  const quality = 0.92;
  const [filename, setFilename] = useState(getNextProjectName);

  // Update filename when modal opens or favorites change
  useEffect(() => {
    if (isExportOpen) {
      setFilename(getNextProjectName());
    }
  }, [isExportOpen, favorites.length]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const options: ExportOptions = {
        format,
        size: { preset: sizePreset },
        quality: format !== 'png' ? quality : undefined,
        includeBackground,
      };
      await exportWojak(options, filename);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    toggleExport(false);
  };

  const estimatedSize = CANVAS_CONFIG.exportSizes[sizePreset];

  return (
    <AnimatePresence>
      {isExportOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={`fixed inset-0 z-50 ${className}`}
            style={{ background: 'rgba(0, 0, 0, 0.7)' }}
            variants={prefersReducedMotion ? undefined : modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-4 bottom-24 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 sm:w-full sm:max-w-lg rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
            }}
            variants={prefersReducedMotion ? undefined : modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-2">
                <Download
                  size={20}
                  style={{ color: 'var(--color-brand-primary)' }}
                />
                <h2
                  className="text-lg font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Export Image
                </h2>
              </div>

              <button
                className="p-2 rounded-lg transition-colors"
                style={{
                  background: 'var(--color-glass-bg)',
                  color: 'var(--color-text-secondary)',
                }}
                onClick={handleClose}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Preview */}
              <div className="flex justify-center">
                <div
                  className="w-32 h-32 rounded-xl overflow-hidden"
                  style={{
                    background: 'var(--color-glass-bg)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {previewImage && (
                    <img
                      src={previewImage}
                      alt="Export preview"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>

              {/* Filename */}
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Filename
                </label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'var(--color-glass-bg)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border)',
                  }}
                />
              </div>

              {/* Format selection */}
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FORMAT_OPTIONS.map((option) => (
                    <motion.button
                      key={option.value}
                      className="relative p-3 rounded-lg text-center transition-colors"
                      style={{
                        background:
                          format === option.value
                            ? 'var(--color-brand-primary)'
                            : 'var(--color-glass-bg)',
                        color:
                          format === option.value
                            ? 'white'
                            : 'var(--color-text-secondary)',
                        border: `1px solid ${format === option.value ? 'var(--color-brand-primary)' : 'var(--color-border)'}`,
                      }}
                      variants={prefersReducedMotion ? undefined : exportOptionVariants}
                      onClick={() => setFormat(option.value)}
                    >
                      <Image size={20} className="mx-auto mb-1" />
                      <div className="text-sm font-medium">{option.label}</div>
                      {format === option.value && (
                        <Check
                          size={14}
                          className="absolute top-1 right-1"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
                <p
                  className="text-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {FORMAT_OPTIONS.find((o) => o.value === format)?.description}
                </p>
              </div>

              {/* Size selection */}
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SIZE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      className="p-3 rounded-lg text-center transition-colors"
                      style={{
                        background:
                          sizePreset === option.value
                            ? 'var(--color-brand-primary)'
                            : 'var(--color-glass-bg)',
                        color:
                          sizePreset === option.value
                            ? 'white'
                            : 'var(--color-text-secondary)',
                        border: `1px solid ${sizePreset === option.value ? 'var(--color-brand-primary)' : 'var(--color-border)'}`,
                      }}
                      onClick={() => setSizePreset(option.value)}
                    >
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
                <p
                  className="text-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Output: {estimatedSize.width} × {estimatedSize.height} pixels
                </p>
              </div>

              {/* Include background toggle */}
              <div
                className="flex items-center justify-between p-3 rounded-lg"
                style={{
                  background: 'var(--color-glass-bg)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Include Background
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {format === 'png'
                      ? 'Uncheck for transparent background'
                      : 'Background will be white if excluded'}
                  </div>
                </div>
                <button
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{
                    background: includeBackground
                      ? 'var(--color-brand-primary)'
                      : 'var(--color-border)',
                  }}
                  onClick={() => setIncludeBackground(!includeBackground)}
                  role="switch"
                  aria-checked={includeBackground}
                >
                  <div
                    className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
                    style={{
                      transform: includeBackground
                        ? 'translateX(26px)'
                        : 'translateX(4px)',
                    }}
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex gap-3 p-4"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              <button
                className="flex-1 py-3 rounded-xl font-medium transition-colors"
                style={{
                  background: 'var(--color-glass-bg)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                }}
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors"
                style={{
                  background: 'var(--color-brand-primary)',
                  color: 'white',
                  opacity: isExporting ? 0.7 : 1,
                }}
                onClick={handleExport}
                disabled={isExporting}
              >
                <Download size={18} />
                {isExporting ? 'Exporting...' : 'Download'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ExportPanel;
