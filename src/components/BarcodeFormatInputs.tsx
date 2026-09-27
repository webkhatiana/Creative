import React from 'react';
import { BarcodeFormat, BarcodeDesign } from '../types';
import { BARCODE_FORMATS, validateBarcodeValue } from '../utils/barcodeUtils';
import { 
  Barcode, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Wand2, 
  Shuffle, 
  Tag, 
  Layers,
  HelpCircle
} from 'lucide-react';

interface BarcodeFormatInputsProps {
  design: BarcodeDesign;
  value: string;
  title: string;
  onValueChange: (val: string) => void;
  onTitleChange: (title: string) => void;
  onDesignChange: (design: BarcodeDesign) => void;
}

const PRESET_TEMPLATES = [
  {
    name: 'Retail GTIN-13',
    format: 'EAN13' as BarcodeFormat,
    value: '400638133393',
    title: 'Retail: Consumer Product 330ml',
    desc: 'EAN-13 Point of Sale',
  },
  {
    name: 'Amazon / SKU Box',
    format: 'CODE128' as BarcodeFormat,
    value: 'X0039A8F7K-GRN',
    title: 'Amazon FNSKU: Apparel Emerald',
    desc: 'Code 128 Alphanumeric',
  },
  {
    name: 'US Retail UPC-A',
    format: 'UPC' as BarcodeFormat,
    value: '01234567890',
    title: 'UPC-A: North America Retail',
    desc: '12-digit standard item',
  },
  {
    name: 'Shipping Master Carton',
    format: 'ITF14' as BarcodeFormat,
    value: '1001234567890',
    title: 'ITF-14: Master Logistics 24pk',
    desc: 'Carton shipping barcode',
  },
  {
    name: 'Warehouse Asset Tag',
    format: 'CODE39' as BarcodeFormat,
    value: 'DEPT-ENG-2026',
    title: 'Asset Tag: Engineering Server 01',
    desc: 'Code 39 High Durability',
  },
  {
    name: 'Pharma Packaging',
    format: 'pharmacode' as BarcodeFormat,
    value: '58492',
    title: 'Pharma: Capsule Batch #84',
    desc: 'Laetus Packaging Control',
  },
];

export default function BarcodeFormatInputs({
  design,
  value,
  title,
  onValueChange,
  onTitleChange,
  onDesignChange,
}: BarcodeFormatInputsProps) {
  const currentFormatMeta = BARCODE_FORMATS.find((f) => f.format === design.format) || BARCODE_FORMATS[0];
  const validation = validateBarcodeValue(design.format, value);

  const handleFormatSelect = (fmt: BarcodeFormat) => {
    const meta = BARCODE_FORMATS.find((f) => f.format === fmt);
    const newDesign: BarcodeDesign = {
      ...design,
      format: fmt,
    };
    onDesignChange(newDesign);

    // If current value is invalid for new format, auto-fill with the format's default sample
    const check = validateBarcodeValue(fmt, value);
    if (!check.isValid && meta) {
      onValueChange(meta.defaultSample);
      onTitleChange(`${meta.name}: ${meta.defaultSample}`);
    }
  };

  const applyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    onDesignChange({
      ...design,
      format: preset.format,
    });
    onValueChange(preset.value);
    onTitleChange(preset.title);
  };

  const generateRandomCode = () => {
    switch (design.format) {
      case 'EAN13': {
        const rand12 = Math.floor(100000000000 + Math.random() * 900000000000).toString();
        onValueChange(rand12);
        onTitleChange(`EAN-13 Item #${rand12.slice(-4)}`);
        break;
      }
      case 'UPC': {
        const rand11 = Math.floor(10000000000 + Math.random() * 90000000000).toString();
        onValueChange(rand11);
        onTitleChange(`UPC-A Item #${rand11.slice(-4)}`);
        break;
      }
      case 'EAN8': {
        const rand7 = Math.floor(1000000 + Math.random() * 9000000).toString();
        onValueChange(rand7);
        onTitleChange(`EAN-8 Item #${rand7.slice(-3)}`);
        break;
      }
      case 'ITF14': {
        const rand13 = Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
        onValueChange(rand13);
        onTitleChange(`ITF-14 Carton #${rand13.slice(-4)}`);
        break;
      }
      case 'pharmacode': {
        const rand = Math.floor(100 + Math.random() * 50000).toString();
        onValueChange(rand);
        onTitleChange(`Pharma Batch #${rand}`);
        break;
      }
      case 'CODE39': {
        const randNum = Math.floor(1000 + Math.random() * 9000);
        const code = `AST-${randNum}`;
        onValueChange(code);
        onTitleChange(`Asset: ${code}`);
        break;
      }
      default: {
        const randNum = Math.floor(100000 + Math.random() * 900000);
        const code = `SKU-${randNum}`;
        onValueChange(code);
        onTitleChange(`SKU Item: ${code}`);
      }
    }
  };

  const applySuggestedFix = () => {
    if (validation.suggestedFix) {
      onValueChange(validation.suggestedFix);
    }
  };

  return (
    <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6" id="barcode-inputs-panel">
      {/* Title & Quick Action */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-900">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block"></span>
            1. BARCODE SPECIFICATION & PAYLOAD
          </h2>
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mt-1">
            Select 1D barcode symbology and configure payload data with instant verification.
          </p>
        </div>

        <button
          type="button"
          onClick={generateRandomCode}
          id="generate-random-barcode-btn"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 border-2 border-black rounded-xl text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[1px] transition-all cursor-pointer"
          title="Generate sample code for selected format"
        >
          <Shuffle className="w-3.5 h-3.5 text-blue-600" />
          Random Sample
        </button>
      </div>

      {/* Preset Quick Loader Strip */}
      <div className="flex flex-col gap-2 border-t-2 border-dashed border-zinc-200 pt-4" id="barcode-presets-strip">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Standard Industry Presets
          </span>
          <span className="text-[9px] font-bold text-zinc-400 uppercase">One-Click Setup</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRESET_TEMPLATES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              id={`preset-btn-${idx}`}
              onClick={() => applyPreset(preset)}
              className={`p-2.5 text-left rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                design.format === preset.format && value === preset.value
                  ? 'border-black bg-blue-50/80 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'border-zinc-200 bg-zinc-50 hover:border-black hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-tight text-zinc-900 truncate">
                  {preset.name}
                </span>
                <span className="text-[9px] font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-zinc-300">
                  {preset.format}
                </span>
              </div>
              <span className="text-[9px] font-medium text-zinc-500 truncate">
                {preset.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Format Symbology Selector */}
      <div className="flex flex-col gap-3 border-t-2 border-dashed border-zinc-200 pt-5" id="symbology-selector-block">
        <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-blue-500" />
          Barcode Symbology Standard
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BARCODE_FORMATS.map((fmt) => {
            const isSelected = design.format === fmt.format;
            return (
              <button
                key={fmt.format}
                type="button"
                id={`format-chip-${fmt.format}`}
                onClick={() => handleFormatSelect(fmt.format)}
                className={`p-3 rounded-2xl border-2 transition-all text-left flex flex-col justify-between gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'border-black bg-zinc-900 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                    : 'border-zinc-200 bg-white hover:border-black hover:bg-zinc-50 text-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-zinc-800 text-blue-400' : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {fmt.category}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                </div>

                <div>
                  <span className={`text-xs font-black block tracking-tight ${isSelected ? 'text-white' : 'text-zinc-900'}`}>
                    {fmt.name}
                  </span>
                  <span className={`text-[9px] font-mono block mt-0.5 ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {fmt.lengthHint}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Symbology Info Card */}
        <div className="bg-blue-50/60 border-2 border-black rounded-2xl p-3.5 flex items-start gap-3 mt-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <HelpCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-black text-blue-900 uppercase tracking-wide mr-1.5">
              {currentFormatMeta.name}:
            </span>
            <span className="text-zinc-700 font-medium">{currentFormatMeta.description}</span>
            <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-zinc-600">
              <span className="font-bold">Allowed Characters:</span>
              <span className="bg-white/80 px-1.5 py-0.5 rounded border border-blue-200">{currentFormatMeta.charSet}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Value Data Payload Input */}
      <div className="flex flex-col gap-3 border-t-2 border-dashed border-zinc-200 pt-5" id="barcode-value-block">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Barcode className="w-4 h-4 text-blue-500" />
            Barcode Data String
          </label>
          
          {/* Live Validation Pill */}
          {validation.isValid ? (
            <span className="text-[9px] bg-emerald-100 text-emerald-800 border-2 border-black font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Validated Symbology
            </span>
          ) : (
            <span className="text-[9px] bg-amber-100 text-amber-900 border-2 border-black font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <AlertTriangle className="w-2.5 h-2.5 text-amber-700" /> Input Alert
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 border-2 border-zinc-300 rounded-2xl px-4 py-3 bg-zinc-50 focus-within:border-black focus-within:bg-white transition-all shadow-inner">
            <input
              type="text"
              id="barcode-value-input"
              value={value}
              onChange={(e) => {
                onValueChange(e.target.value);
                if (!title || title.startsWith('Barcode') || title.includes(':')) {
                  onTitleChange(`${currentFormatMeta.name}: ${e.target.value}`);
                }
              }}
              className="text-base font-mono font-black text-zinc-900 bg-transparent w-full focus:outline-none tracking-wider"
              placeholder={currentFormatMeta.defaultSample}
            />
            {value && (
              <button
                type="button"
                onClick={() => onValueChange('')}
                className="text-[10px] font-bold text-zinc-400 hover:text-black uppercase px-2 py-1 bg-zinc-200/60 rounded-lg hover:bg-zinc-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Validation correction prompt if needed */}
          {!validation.isValid && validation.message && (
            <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-3 flex items-center justify-between gap-3 text-[11px] text-amber-900 font-semibold" id="validation-fix-alert">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{validation.message}</span>
              </div>
              {validation.suggestedFix && (
                <button
                  type="button"
                  id="auto-fix-checksum-btn"
                  onClick={applySuggestedFix}
                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-black border-2 border-black rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                >
                  <Wand2 className="w-3 h-3" />
                  Auto-Fix
                </button>
              )}
            </div>
          )}
        </div>

        {/* Title / Description Field */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Item Label / Title (Memo)
            </span>
            <input
              type="text"
              id="barcode-title-input"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="text-xs font-bold text-zinc-800 border-2 border-zinc-200 rounded-xl px-3 py-2.5 bg-zinc-50 focus-within:border-black focus-within:bg-white focus:outline-none transition-all"
              placeholder="e.g. SKU-8902 - Warehouse Bin A1"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Custom Text Override (Optional)
            </span>
            <input
              type="text"
              id="barcode-custom-text-input"
              value={design.text}
              onChange={(e) => onDesignChange({ ...design, text: e.target.value })}
              className="text-xs font-mono font-bold text-zinc-800 border-2 border-zinc-200 rounded-xl px-3 py-2.5 bg-zinc-50 focus-within:border-black focus-within:bg-white focus:outline-none transition-all"
              placeholder="Leave empty to show raw value"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
