import React, { useRef, useEffect, useState } from 'react';
import * as QRCodeNamespace from 'qrcode';
import { Download, Copy, Save, Check, RefreshCw, AlertCircle, Share2, Sparkles, QrCode } from 'lucide-react';
import { QRDesign } from '../types';

// Robust ESM/CJS interop support for qrcode dependency
const QRCode = (QRCodeNamespace as any).default || QRCodeNamespace;

interface QRPreviewProps {
  rawText: string;
  design: QRDesign;
  title: string;
  onSaveToHistory: (rawText: string, design: QRDesign, title: string) => void;
}

export default function QRPreview({ rawText, design, title, onSaveToHistory }: QRPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);
  const [rendering, setRendering] = useState<boolean>(false);

  // Trigger drawing the QR code to the canvas whenever input or styling updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!rawText.trim()) {
      setErrorMsg('Ready for content inputs...');
      return;
    }

    setRendering(true);
    setErrorMsg(null);

    try {
      // Call qrcode library
      QRCode.toCanvas(
        canvas,
        rawText,
        {
          width: design.size,
          margin: design.margin,
          color: {
            dark: design.fgColor,
            light: design.bgColor,
          },
          errorCorrectionLevel: design.errorCorrection,
        },
        (error) => {
          setRendering(false);
          if (error) {
            console.error(error);
            setErrorMsg(error.message || 'Failed to render QR Code. Raw text may be too long for the active Error Correction level.');
            return;
          }

          // Successfully drawn base QR code. Now overlay the logo if present
          if (design.logoUrl) {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              const size = canvas.width;
              const logoDim = size * design.logoSize;
              const centerX = size / 2;
              const centerY = size / 2;

              // Draw white/bg backing boundary if logoMargin chosen
              if (design.logoMargin) {
                const shieldSize = logoDim + (size * 0.04); // subtle padding multiplier
                ctx.fillStyle = design.bgColor;
                ctx.beginPath();
                
                // Rounded rectangle backing
                if (typeof ctx.roundRect === 'function') {
                  ctx.roundRect(
                    centerX - shieldSize / 2, 
                    centerY - shieldSize / 2, 
                    shieldSize, 
                    shieldSize, 
                    size * 0.015 // rounded radius relative to size
                  );
                } else {
                  ctx.rect(centerX - shieldSize / 2, centerY - shieldSize / 2, shieldSize, shieldSize);
                }
                ctx.fill();
              }

              // Draw logo image
              ctx.drawImage(
                img,
                centerX - logoDim / 2,
                centerY - logoDim / 2,
                logoDim,
                logoDim
              );
            };
            img.src = design.logoUrl;
          }
        }
      );
    } catch (err: any) {
      setRendering(false);
      console.error(err);
      setErrorMsg(err.message || 'Rendering error encountered.');
    }
  }, [rawText, design]);

  // Download JPEG / PNG format
  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas || !rawText) return;

    try {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
      link.download = `qrcode-${slug || 'download'}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Could not download image. Logos from other domains might trigger security context blocks.');
    }
  };

  // Generate and Download custom scalable vector SVG with optional embedded logo
  const downloadSVG = async () => {
    if (!rawText.trim()) return;

    try {
      let svgText = await QRCode.toString(rawText, {
        type: 'svg',
        width: design.size,
        margin: design.margin,
        color: {
          dark: design.fgColor,
          light: design.bgColor,
        },
        errorCorrectionLevel: design.errorCorrection,
      });

      // Inject the logo centered inside the SVG
      if (design.logoUrl && svgText.includes('</svg>')) {
        const logoDim = design.size * design.logoSize;
        const centerPos = (design.size - logoDim) / 2;
        let logoMarkup = '';

        if (design.logoMargin) {
          const shieldSize = logoDim + (design.size * 0.04);
          const shieldPos = (design.size - shieldSize) / 2;
          const radius = design.size * 0.015;
          logoMarkup += `<rect x="${shieldPos}" y="${shieldPos}" width="${shieldSize}" height="${shieldSize}" fill="${design.bgColor}" rx="${radius}" />\n`;
        }

        logoMarkup += `<image href="${design.logoUrl}" x="${centerPos}" y="${centerPos}" width="${logoDim}" height="${logoDim}" />\n`;

        // Insert logo features before closing tag
        svgText = svgText.replace('</svg>', `${logoMarkup}</svg>`);
      }

      const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
      link.download = `qrcode-${slug || 'download'}.svg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to output target SVG.');
    }
  };

  // Copy PNG image direct to OS paste board
  const copyPNGToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (copyErr) {
          console.error(copyErr);
          // Fallback to copying base64 link if clipboard item fails on some browsers
          const base64 = canvas.toDataURL('image/png');
          await navigator.clipboard.writeText(base64);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    } catch (err) {
      console.error(err);
      alert('Your browser security rules prevented copying canvas images.');
    }
  };

  // Save Setup to local-storage history
  const triggerSave = () => {
    if (!rawText.trim()) return;
    setSaving(true);
    onSaveToHistory(rawText, design, title);
    setTimeout(() => {
      setSaving(false);
    }, 800);
  };

  // Native share sheet integration
  const shareQR = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'qrcode.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: title || 'QR Code',
            text: 'Check out this generated QR code!',
          });
          setShared(true);
          setTimeout(() => setShared(false), 2000);
        } else {
          // Fallback share link copy
          await navigator.clipboard.writeText(rawText);
          setShared(true);
          setTimeout(() => setShared(false), 2000);
        }
      });
    } catch (err) {
      console.error(err);
      alert('Sharing details are restricted in the iframe preview environment.');
    }
  };

  return (
    <div className="bg-zinc-950 border-2 border-black rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white flex flex-col gap-6" id="qr-preview-panel">
      {/* Title */}
      <div>
        <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-100">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block animate-ping"></span>
          3. STUDIO LIVE EXPORT & TRACKER
        </h2>
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mt-1">Scan active viewport output or export print-ready assets.</p>
      </div>

      {/* Main Canvas Frame */}
      <div className="flex flex-col items-center justify-center border-2 border-black rounded-2xl p-6 bg-zinc-900 relative min-h-[290px] overflow-hidden group" id="canvas-card-frame">
        {rendering && (
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xs flex items-center justify-center z-10" id="rendering-overlap-loader">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
              <span className="text-xs font-black uppercase tracking-widest text-zinc-450">Matrix Reconfiguration...</span>
            </div>
          </div>
        )}

        {errorMsg ? (
          <div className="flex flex-col items-center text-center max-w-xs gap-2" id="canvas-error-alert">
            <AlertCircle className="w-10 h-10 text-zinc-650 animate-bounce" />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-500 leading-normal">{errorMsg}</span>
          </div>
        ) : (
          <div className="relative p-4 bg-white rounded-3xl shadow-[4px_4px_0px_0px_rgba(30,58,138,0.4)] border-2 border-black flex items-center justify-center max-w-full">
            <canvas
              ref={canvasRef}
              id="qr-output-canvas"
              className="max-w-[240px] max-h-[240px] w-full h-auto object-contain rounded-lg"
            />
          </div>
        )}

        {/* Floating Tag Type Badge */}
        {rawText && !errorMsg && (
          <div className="absolute bottom-3 left-3 bg-white text-zinc-900 border-2 border-black font-mono text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" id="live-slug-badge">
            {design.errorCorrection} MODE • {design.size}PX
          </div>
        )}
      </div>

      {/* Description metadata */}
      {rawText && !errorMsg && (
        <div className="bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-4" id="qr-metadata-bubble">
          <span className="text-[9px] font-black text-zinc-400 block uppercase tracking-widest">Active Data Stream Payload</span>
          <span className="text-xs font-mono text-zinc-300 block truncate mt-1" title={rawText}>
            {rawText}
          </span>
        </div>
      )}

      {/* Action export control layout */}
      <div className="grid grid-cols-2 gap-3.5" id="preview-actions-grid">
        <button
          type="button"
          disabled={!rawText || !!errorMsg}
          onClick={downloadPNG}
          id="export-png-btn"
          className="flex items-center justify-center gap-1.5 py-3 px-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          GET PNG
        </button>

        <button
          type="button"
          disabled={!rawText || !!errorMsg}
          onClick={downloadSVG}
          id="export-svg-btn"
          className="flex items-center justify-center gap-1.5 py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <QrCode className="w-4 h-4" />
          GET SVG
        </button>

        <button
          type="button"
          disabled={!rawText || !!errorMsg}
          onClick={copyPNGToClipboard}
          id="copy-clipboard-btn"
          className="flex items-center justify-center gap-1.5 py-3 px-3 bg-white hover:bg-zinc-150 text-black font-black text-xs uppercase tracking-widest rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600 animate-scale-up" /> : <Copy className="w-4 h-4 text-zinc-900" />}
          {copied ? 'COPIED!' : 'COPY CODE'}
        </button>

        <button
          type="button"
          disabled={!rawText || !!errorMsg}
          onClick={triggerSave}
          id="save-history-btn"
          className="flex items-center justify-center gap-1.5 py-3 px-3 bg-white hover:bg-zinc-150 text-black font-black text-xs uppercase tracking-widest rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
          ) : (
            <Save className="w-4 h-4 text-zinc-900" />
          )}
          {saving ? 'SAVED!' : 'SAVE SETUP'}
        </button>

        <button
          type="button"
          disabled={!rawText || !!errorMsg}
          onClick={shareQR}
          id="share-qr-btn"
          className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-widest rounded-xl border-2 border-zinc-800 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Share2 className="w-3.5 h-3.5 text-zinc-500" />
          {shared ? 'LINK COPIED!' : 'SHARE / COPY PAYLOAD LINK'}
        </button>
      </div>
    </div>
  );
}
