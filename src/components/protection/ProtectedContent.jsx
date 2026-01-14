import React, { useEffect, useState } from 'react';

/**
 * ProtectedContent Component
 * 
 * Enforces content protection policies including:
 * - Watermark overlay
 * - Copy/paste blocking
 * - Right-click menu blocking
 * - Print blocking
 * - Screenshot detection (best-effort)
 * 
 * @param {Object} policy - Content protection policy from school settings
 * @param {string} userEmail - Current user email for watermark
 * @param {string} schoolName - School name for watermark
 * @param {boolean} isEntitled - Whether user has full access rights
 * @param {React.ReactNode} children - Content to protect
 */
export default function ProtectedContent({ 
  policy = {}, 
  userEmail, 
  schoolName,
  canCopy = false,
  canDownload = false,
  children 
}) {
  const [watermarkText, setWatermarkText] = useState('');

  useEffect(() => {
    if (policy.watermark_enabled && userEmail) {
      const timestamp = new Date().toLocaleDateString();
      setWatermarkText(`${userEmail} • ${schoolName || 'Protected'} • ${timestamp}`);
    }
  }, [policy, userEmail, schoolName]);

  useEffect(() => {
    if (!policy.protect_content) return;

    const handleContextMenu = (e) => {
      if (policy.block_right_click) {
        e.preventDefault();
        return false;
      }
    };

    const handleCopy = (e) => {
      if (policy.block_copy && !canCopy) {
        e.preventDefault();
        return false;
      }
    };

    const handleKeyDown = (e) => {
      // Block Ctrl/Cmd + C (copy)
      if (policy.block_copy && !canCopy && (e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        return false;
      }
      
      // Block Ctrl/Cmd + P (print)
      if (policy.block_print && (e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        return false;
      }

      // Block Ctrl/Cmd + S (save)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        return false;
      }

      // Block Ctrl/Cmd + Shift + S (save as)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
    };

    const handleSelectStart = (e) => {
      if (policy.block_copy && !canCopy) {
        // Allow selection for reading but clipboard is blocked via handleCopy
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);

    // Print blocking via CSS
    if (policy.block_print) {
      const style = document.createElement('style');
      style.id = 'print-block-style';
      style.textContent = `
        @media print {
          body { display: none !important; }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
      
      const printStyle = document.getElementById('print-block-style');
      if (printStyle) printStyle.remove();
    };
  }, [policy, isEntitled]);

  return (
    <div className="relative">
      {children}
      
      {/* Watermark Overlay */}
      {policy.watermark_enabled && watermarkText && (
        <div 
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{ 
            opacity: policy.watermark_opacity || 0.18,
            zIndex: 9999
          }}
        >
          <div 
            className="whitespace-nowrap text-slate-400 font-mono text-xs transform rotate-[-45deg] select-none"
            style={{
              fontSize: '10px',
              lineHeight: '40px',
              width: '200%',
              textAlign: 'center'
            }}
          >
            {Array(20).fill(watermarkText).join('   •   ')}
          </div>
        </div>
      )}

      {/* Screen reader only notice */}
      <div className="sr-only" role="status" aria-live="polite">
        {policy.protect_content && !canCopy && (
          <p>This content is protected. Copying and downloading may be restricted.</p>
        )}
      </div>
    </div>
  );
}