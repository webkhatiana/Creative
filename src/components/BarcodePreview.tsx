import React, { useRef, useEffect, useState } from 'react';
import * as JsBarcodeNamespace from 'jsbarcode';
import { 
  Download, 
  Copy, 
  Save, 
  Check, 
  Printer, 
  AlertCircle, 
  FileCode, 
  Sparkles, 
  Scan,
  Maximize2
} from 'lucide-react';
import { BarcodeDesign } from '../types';
import { BARCODE_FORMATS, validateBarcodeValue } from '../utils/barcodeUtils';

// ESM/CJS interop for jsbarcode
const JsBarcode = (JsBarcodeNamespace as any).default || JsBarcodeNamespace;

interface BarcodePreviewProps {
  value: string;
  design: BarcodeDesign;
  title: string;
  onSaveToHistory: (val: string, design: BarcodeDesign, title: string) => void;
}

export default function BarcodePreview({
  value,
  design,
  title,
  onSaveToHistory,
}: BarcodePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [rendering, setRendering] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [exportScale, setExportScale] = useState<number>(2); // 1x, 2x, 3x for crisp printing
  const [renderedDims, setRenderedDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const formatMeta = BARCODE_FORMATS.find((f) => f.format === design.format) || BARCODE_FORMATS[0];

  // Render Barcode whenever value or design changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const svg = svgRef.current;
    if (!canvas || !svg) return;

    if (!value || value.trim().length === 0) {
      setErrorMsg('Please enter a barcode data value.');
      return;
    }

    const validation = validateBarcodeValue(design.format, value);
    if (!validation.isValid) {
      setErrorMsg(validation.message || 'Invalid barcode value for chosen symbology.');
      return;
    }

    setRendering(true);
    setErrorMsg(null);

    try {
      // 1. Render to SVG
      JsBarcode(svg, value.trim(), {
        format: design.format,
        lineColor: design.lineColor,
        background: design.background,
        width: design.width,
        height: design.height,
        displayValue: design.displayValue,
        text: design.text && design.text.trim().length > 0 ? design.text.trim() : undefined,
        fontOptions: design.fontOptions || undefined,
        font: design.font,
        textAlign: design.textAlign,
        textPosition: design.textPosition,
        textMargin: design.textMargin,
        fontSize: design.fontSize,
        margin: design.margin,
        valid: (valid: boolean) => {
          if (!valid) {
            setErrorMsg(`Invalid payload for ${design.format} symbology.`);
          }
        },
      });

      // 2. Render to Canvas
      JsBarcode(canvas, value.trim(), {
        format: design.format,
        lineColor: design.lineColor,
        background: design.background,
        width: design.width,
        height: design.height,
        displayValue: design.displayValue,
        text: design.text && design.text.trim().length > 0 ? design.text.trim() : undefined,
        fontOptions: design.fontOptions || undefined,
        font: design.font,
        textAlign: design.textAlign,
        textPosition: design.textPosition,
        textMargin: design.textMargin,
        fontSize: design.fontSize,
        margin: design.margin,
      });

      setRenderedDims({
        width: canvas.width,
        height: canvas.height,
      });
      setRendering(false);
    } catch (err: any) {
      console.error('Barcode Render Error:', err);
      setRendering(false);
      setErrorMsg(err.message || 'Failed to render barcode. Please check format requirements.');
    }
  }, [value, design]);

  // Download high-resolution PNG or JPEG
  const handleDownloadRaster = (fileFormat: 'png' | 'jpeg') => {
    const canvas = canvasRef.current;
    if (!canvas || errorMsg) return;

    // Generate scaled canvas for high DPI print quality
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = canvas.width * exportScale;
    scaledCanvas.height = canvas.height * exportScale;
    const ctx = scaledCanvas.getContext('2d');
    if (!ctx) return;

    // Fill background for JPEG
    if (fileFormat === 'jpeg') {
      ctx.fillStyle = design.background || '#ffffff';
      ctx.fillRect(0, 0, scaledCanvas.width, scaledCanvas.height);
    }

    ctx.imageSmoothingEnabled = false; // Keep crisp barcode edges
    ctx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);

    const safeTitle = (title || `barcode-${design.format}`).toLowerCase().replace(/[^a-z0-9]/g, '_');
    const dataUrl = scaledCanvas.toDataURL(`image/${fileFormat}`, 0.95);

    const link = document.createElement('a');
    link.download = `${safeTitle}.${fileFormat}`;
    link.href = dataUrl;
    link.click();
  };

  // Download Vector SVG
  const handleDownloadSVG = () => {
    const svg = svgRef.current;
    if (!svg || errorMsg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const safeTitle = (title || `barcode-${design.format}`).toLowerCase().replace(/[^a-z0-9]/g, '_');
    const link = document.createElement('a');
    link.download = `${safeTitle}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy Image to Clipboard
  const handleCopyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas || errorMsg) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  // Print Barcode Label
  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas || errorMsg) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dataUrl = canvas.toDataURL('image/png');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Label - ${title || value}</title>
          <style>
            @page { margin: 10mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 90vh;
              margin: 0;
              padding: 20px;
              color: #111;
            }
            .label-card {
              border: 1px dashed #999;
              padding: 16px;
              border-radius: 8px;
              text-align: center;
              max-width: 400px;
            }
            .title { font-weight: bold; font-size: 14px; margin-bottom: 8px; text-transform: uppercase; }
            img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
            .meta { font-size: 10px; color: #666; margin-top: 8px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="title">${title || formatMeta.name}</div>
            <img src="${dataUrl}" alt="Barcode" />
            <div class="meta">${design.format} • ${value}</div>
          </div>
          <script>
            window.onload = () => { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Save to history trigger
  const handleSave = () => {
    if (errorMsg) return;
    onSaveToHistory(value, design, title || `${formatMeta.name}: ${value}`);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6" id="barcode-preview-panel">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-900">
            <Scan className="w-4 h-4 text-blue-600" />
            LIVE BARCODE VIEWPORT
          </h2>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mt-0.5">
            {formatMeta.name} • {formatMeta.category}
          </span>
        </div>

        <button
          type="button"
          id="barcode-save-preset-btn"
          onClick={handleSave}
          disabled={!!errorMsg}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black text-[11px] font-black uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer ${
            saved
              ? 'bg-emerald-300 text-emerald-950'
              : 'bg-zinc-100 hover:bg-zinc-200 text-black hover:translate-y-[-1px] active:translate-y-[1px]'
          }`}
          title="Save this barcode configuration to local storage"
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>

      {/* Barcode Stage Canvas Display */}
      <div 
        className="border-2 border-black rounded-2xl p-6 flex flex-col items-center justify-center min-h-[220px] transition-colors relative overflow-hidden shadow-inner"
        style={{ backgroundColor: design.background || '#ffffff' }}
        id="barcode-viewport-canvas-stage"
      >
        {errorMsg ? (
          <div className="flex flex-col items-center justify-center text-center p-4 max-w-sm gap-2 text-amber-900 bg-amber-50 border-2 border-amber-400 rounded-2xl">
            <AlertCircle className="w-8 h-8 text-amber-600" />
            <span className="text-xs font-black uppercase tracking-wide">Encoding Warning</span>
            <p className="text-[11px] font-semibold">{errorMsg}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center max-w-full overflow-x-auto p-2">
            {/* Hidden SVG element used for vector downloads & calculations */}
            <svg ref={svgRef} className="hidden" id="barcode-vector-svg"></svg>
            
            {/* Display Canvas */}
            <canvas 
              ref={canvasRef} 
              id="barcode-display-canvas" 
              className="max-w-full h-auto drop-shadow-sm rounded"
            />
          </div>
        )}

        {rendering && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-black animate-ping"></span>
            Rendering Matrix...
          </div>
        )}
      </div>

      {/* Resolution Scale Selector for Exports */}
      <div className="flex items-center justify-between border-t-2 border-dashed border-zinc-200 pt-4" id="export-resolution-controls">
        <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
          <Maximize2 className="w-3 h-3" /> Export Resolution
        </span>
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
          {[1, 2, 3].map((scale) => (
            <button
              key={scale}
              type="button"
              id={`export-scale-btn-${scale}x`}
              onClick={() => setExportScale(scale)}
              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                exportScale === scale
                  ? 'bg-black text-white shadow-sm'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              {scale}x {scale === 2 ? '(Print)' : scale === 3 ? '(Ultra-HD)' : '(Standard)'}
            </button>
          ))}
        </div>
      </div>

      {/* Export Action Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" id="barcode-action-buttons-grid">
        {/* Download PNG */}
        <button
          type="button"
          id="download-barcode-png-btn"
          onClick={() => handleDownloadRaster('png')}
          disabled={!!errorMsg}
          className="flex items-center justify-center gap-1.5 px-3 py-3 bg-black hover:bg-zinc-800 text-white rounded-xl font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[1px] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          PNG
        </button>

        {/* Download SVG */}
        <button
          type="button"
          id="download-barcode-svg-btn"
          onClick={handleDownloadSVG}
          disabled={!!errorMsg}
          className="flex items-center justify-center gap-1.5 px-3 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[1px] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileCode className="w-4 h-4" />
          SVG
        </button>

        {/* Copy to Clipboard */}
        <button
          type="button"
          id="copy-barcode-image-btn"
          onClick={handleCopyToClipboard}
          disabled={!!errorMsg}
          className="flex items-center justify-center gap-1.5 px-3 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[1px] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>

        {/* Print Label */}
        <button
          type="button"
          id="print-barcode-label-btn"
          onClick={handlePrint}
          disabled={!!errorMsg}
          className="flex items-center justify-center gap-1.5 px-3 py-3 bg-amber-200 hover:bg-amber-300 text-black rounded-xl font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[1px] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>

      {/* Barcode Studio Telemetry Block */}
      <div className="bg-zinc-900 border-2 border-black text-white rounded-2xl p-4 flex flex-col gap-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" id="barcode-telemetry-stats">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">BARCODE TELEMETRY</span>
          <span className="text-[9px] bg-emerald-600 text-white font-black uppercase px-2 py-0.5 rounded-full border border-black">
            1D LINEAR OK
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="bg-zinc-800/60 border border-zinc-800 rounded-lg p-2">
            <span className="text-[8px] font-black uppercase text-zinc-400 block">SYMBOLOGY</span>
            <span className="text-xs font-mono font-bold text-white block mt-0.5">{design.format}</span>
          </div>

          <div className="bg-zinc-800/60 border border-zinc-800 rounded-lg p-2">
            <span className="text-[8px] font-black uppercase text-zinc-400 block">ENCODED DIMS</span>
            <span className="text-xs font-mono font-bold text-white block mt-0.5">
              {renderedDims.width}×{renderedDims.height}
            </span>
          </div>

          <div className="bg-zinc-800/60 border border-zinc-800 rounded-lg p-2">
            <span className="text-[8px] font-black uppercase text-zinc-400 block">CHAR COUNT</span>
            <span className="text-xs font-mono font-bold text-white block mt-0.5">{value.length} CHARS</span>
          </div>

          <div className="bg-zinc-800/60 border border-zinc-800 rounded-lg p-2">
            <span className="text-[8px] font-black uppercase text-zinc-400 block">HUMAN LABEL</span>
            <span className="text-xs font-mono font-bold text-white block mt-0.5">
              {design.displayValue ? `${design.textPosition.toUpperCase()}` : 'OFF'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
