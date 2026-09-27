import React, { useState, useEffect, useRef } from 'react';
import * as JsBarcodeNamespace from 'jsbarcode';
import { 
  Boxes, 
  Sparkles, 
  Printer, 
  Download, 
  Plus, 
  Trash2, 
  RefreshCw, 
  ListFilter, 
  Hash, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { BarcodeFormat, BarcodeDesign } from '../types';
import { BARCODE_FORMATS, validateBarcodeValue } from '../utils/barcodeUtils';

const JsBarcode = (JsBarcodeNamespace as any).default || JsBarcodeNamespace;

interface BatchItem {
  id: string;
  code: string;
  label?: string;
  isValid: boolean;
  error?: string;
}

interface BatchBarcodeGeneratorProps {
  baseDesign: BarcodeDesign;
}

export default function BatchBarcodeGenerator({ baseDesign }: BatchBarcodeGeneratorProps) {
  const [generationMode, setGenerationMode] = useState<'sequence' | 'manual'>('sequence');
  
  // Sequence configs
  const [prefix, setPrefix] = useState<string>('SKU-');
  const [startNum, setStartNum] = useState<number>(1001);
  const [count, setCount] = useState<number>(8);
  const [zeroPad, setZeroPad] = useState<number>(4);
  const [suffix, setSuffix] = useState<string>('');

  // Manual configs
  const [manualText, setManualText] = useState<string>(
    'SKU-1001\nSKU-1002\nSKU-1003\nSKU-1004\nSKU-1005\nSKU-1006'
  );

  const [format, setFormat] = useState<BarcodeFormat>(baseDesign.format);
  const [items, setItems] = useState<BatchItem[]>([]);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [labelsPerRow, setLabelsPerRow] = useState<number>(2); // 1, 2, 3 columns

  // Generate batch items list
  useEffect(() => {
    let generatedList: string[] = [];

    if (generationMode === 'sequence') {
      const validCount = Math.min(Math.max(count, 1), 50); // limit to 50 for smooth client UI
      for (let i = 0; i < validCount; i++) {
        const current = startNum + i;
        const padded = current.toString().padStart(zeroPad, '0');
        const code = `${prefix}${padded}${suffix}`;
        generatedList.push(code);
      }
    } else {
      generatedList = manualText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .slice(0, 50);
    }

    const validatedItems: BatchItem[] = generatedList.map((code, idx) => {
      const validation = validateBarcodeValue(format, code);
      return {
        id: `batch-${idx}-${code}`,
        code: code,
        label: code,
        isValid: validation.isValid,
        error: validation.message,
      };
    });

    setItems(validatedItems);
  }, [generationMode, prefix, startNum, count, zeroPad, suffix, manualText, format]);

  const handleCopyAll = () => {
    const text = items.map((it) => it.code).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handlePrintSheet = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Collect rendered canvas data URLs
    const canvasElements = document.querySelectorAll<HTMLCanvasElement>('.batch-barcode-canvas');
    const imagesHtml = Array.from(canvasElements)
      .map((c, i) => {
        const code = items[i]?.code || '';
        return `
        <div class="label-item">
          <img src="${c.toDataURL('image/png')}" />
          <div class="label-text">${code}</div>
        </div>
      `;
      })
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Batch Barcodes Sheet Print</title>
          <style>
            @page { margin: 10mm; size: auto; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              margin: 0;
              padding: 10px;
              color: #111;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(${labelsPerRow}, 1fr);
              gap: 12px;
            }
            .label-item {
              border: 1px dashed #bbb;
              padding: 12px;
              text-align: center;
              border-radius: 6px;
              page-break-inside: avoid;
            }
            img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
            .label-text { font-size: 11px; font-weight: bold; margin-top: 4px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="grid">${imagesHtml}</div>
          <script>
            window.onload = () => { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6" id="batch-barcode-generator-panel">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-900">
            <Boxes className="w-4 h-4 text-blue-600" />
            BATCH SERIAL & INVENTORY GENERATOR
          </h2>
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mt-1">
            Create sequences or multi-line batches of customizable barcodes ready for label sheets.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-300">
          <button
            type="button"
            onClick={() => setGenerationMode('sequence')}
            className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              generationMode === 'sequence'
                ? 'bg-black text-white shadow-sm'
                : 'text-zinc-600 hover:text-black'
            }`}
          >
            Sequence Generator
          </button>
          <button
            type="button"
            onClick={() => setGenerationMode('manual')}
            className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              generationMode === 'manual'
                ? 'bg-black text-white shadow-sm'
                : 'text-zinc-600 hover:text-black'
            }`}
          >
            Manual List
          </button>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="border-t-2 border-dashed border-zinc-200 pt-5">
        {generationMode === 'sequence' ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3" id="sequence-params-grid">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-zinc-400">Prefix</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="text-xs font-mono font-bold border-2 border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 focus:outline-none focus:border-black"
                placeholder="SKU-"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-zinc-400">Start Number</label>
              <input
                type="number"
                value={startNum}
                onChange={(e) => setStartNum(parseInt(e.target.value, 10) || 1)}
                className="text-xs font-mono font-bold border-2 border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 focus:outline-none focus:border-black"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-zinc-400">Total Count (Max 50)</label>
              <input
                type="number"
                min="1"
                max="50"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10) || 1)}
                className="text-xs font-mono font-bold border-2 border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 focus:outline-none focus:border-black"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-zinc-400">Zero Padding</label>
              <input
                type="number"
                min="1"
                max="8"
                value={zeroPad}
                onChange={(e) => setZeroPad(parseInt(e.target.value, 10) || 1)}
                className="text-xs font-mono font-bold border-2 border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 focus:outline-none focus:border-black"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-zinc-400">Suffix (Optional)</label>
              <input
                type="text"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                className="text-xs font-mono font-bold border-2 border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 focus:outline-none focus:border-black"
                placeholder="-US"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2" id="manual-text-block">
            <label className="text-[10px] font-black uppercase text-zinc-400 flex items-center justify-between">
              <span>Paste items list (one barcode per line)</span>
              <span className="text-zinc-500 font-mono font-bold">{items.length} detected</span>
            </label>
            <textarea
              rows={4}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              className="text-xs font-mono font-bold border-2 border-zinc-200 rounded-xl p-3 bg-zinc-50 focus:outline-none focus:border-black resize-y"
              placeholder="Enter one barcode value per line..."
            />
          </div>
        )}

        {/* Symbology selection for batch */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-zinc-100">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-zinc-400">Format:</span>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as BarcodeFormat)}
              className="text-xs font-bold text-zinc-900 border-2 border-zinc-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:border-black"
            >
              {BARCODE_FORMATS.map((f) => (
                <option key={f.format} value={f.format}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action toolbar */}
          <div className="flex items-center gap-2">
            {/* Sheet layout columns */}
            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-zinc-400 mr-2">
              <span>Sheet Cols:</span>
              {[1, 2, 3].map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setLabelsPerRow(col)}
                  className={`w-6 h-6 rounded-lg text-[10px] font-bold border transition-all ${
                    labelsPerRow === col
                      ? 'border-black bg-black text-white'
                      : 'border-zinc-200 bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCopyAll}
              className="flex items-center gap-1 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-black border-2 border-black rounded-xl text-[11px] font-black uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedAll ? 'Copied' : 'Copy List'}
            </button>

            <button
              type="button"
              onClick={handlePrintSheet}
              disabled={items.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-200 hover:bg-amber-300 text-black border-2 border-black rounded-xl text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Label Sheet ({items.length})
            </button>
          </div>
        </div>
      </div>

      {/* Rendered Batch Grid Stage */}
      <div className="border-t-2 border-dashed border-zinc-200 pt-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
            Rendered Barcode Matrix ({items.length} items)
          </span>
          <span className="text-[10px] font-bold text-zinc-400 uppercase">Click any item to inspect</span>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${labelsPerRow === 1 ? '1' : labelsPerRow === 2 ? '2' : '3'} gap-3 max-h-[460px] overflow-y-auto p-1`} id="batch-render-scroll-container">
          {items.map((item, idx) => (
            <BatchBarcodeCard
              key={item.id || idx}
              item={item}
              format={format}
              design={baseDesign}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface BatchBarcodeCardProps {
  key?: React.Key;
  item: BatchItem;
  format: BarcodeFormat;
  design: BarcodeDesign;
}

const BatchBarcodeCard: React.FC<BatchBarcodeCardProps> = ({ item, format, design }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!item.isValid) {
      setRenderError(item.error || 'Format mismatch');
      return;
    }

    setRenderError(null);
    try {
      JsBarcode(canvas, item.code, {
        format: format,
        lineColor: design.lineColor || '#000000',
        background: design.background || '#ffffff',
        width: Math.min(design.width, 2), // compact scale for grid cards
        height: 50,
        displayValue: true,
        font: design.font || 'monospace',
        fontSize: 12,
        margin: 6,
        valid: (valid: boolean) => {
          if (!valid) setRenderError('Invalid checksum / length');
        },
      });
    } catch (e: any) {
      setRenderError(e.message || 'Render failed');
    }
  }, [item, format, design]);

  return (
    <div className="border-2 border-black rounded-2xl p-3 bg-zinc-50 flex flex-col items-center justify-between gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-white transition-all">
      <div className="w-full flex items-center justify-between text-[10px] font-mono text-zinc-500 border-b border-zinc-200 pb-1">
        <span className="font-bold truncate">{item.code}</span>
        <span className="bg-white px-1.5 py-0.5 rounded border border-zinc-200 text-[9px] uppercase">
          {format}
        </span>
      </div>

      <div className="py-1 flex items-center justify-center w-full min-h-[60px]">
        {renderError ? (
          <div className="text-[10px] text-amber-800 bg-amber-50 border border-amber-300 rounded px-2 py-1 flex items-center gap-1 font-semibold">
            <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
            <span className="truncate">{renderError}</span>
          </div>
        ) : (
          <canvas ref={canvasRef} className="batch-barcode-canvas max-w-full h-auto" />
        )}
      </div>
    </div>
  );
}
