import React from 'react';
import { BarcodeDesign } from '../types';
import { Palette, Sliders, Type, AlignCenter, AlignLeft, AlignRight, MoveVertical, Eye, EyeOff } from 'lucide-react';

interface BarcodeStylingControlsProps {
  design: BarcodeDesign;
  onDesignChange: (design: BarcodeDesign) => void;
}

const BARCODE_PALETTES = [
  { name: 'Monochrome', bar: '#000000', bg: '#ffffff' },
  { name: 'Blueprint Navy', bar: '#0f172a', bg: '#eff6ff' },
  { name: 'Emerald Logistics', bar: '#064e3b', bg: '#ecfdf5' },
  { name: 'Amber Industrial', bar: '#18181b', bg: '#fef3c7' },
  { name: 'Cyber Crimson', bar: '#881337', bg: '#fff1f2' },
  { name: 'Dark Slate Matrix', bar: '#ffffff', bg: '#09090b' },
];

const FONT_FAMILIES = [
  { label: 'Monospace', value: 'monospace' },
  { label: 'Sans-Serif', value: 'sans-serif' },
  { label: 'Serif', value: 'serif' },
  { label: 'Courier', value: 'Courier' },
];

const FONT_WEIGHTS = [
  { label: 'Normal', value: '' },
  { label: 'Bold', value: 'bold' },
  { label: 'Italic', value: 'italic' },
  { label: 'Bold Italic', value: 'bold italic' },
];

export default function BarcodeStylingControls({
  design,
  onDesignChange,
}: BarcodeStylingControlsProps) {
  const updateKey = <K extends keyof BarcodeDesign>(key: K, val: BarcodeDesign[K]) => {
    onDesignChange({
      ...design,
      [key]: val,
    });
  };

  const selectPalette = (bar: string, bg: string) => {
    onDesignChange({
      ...design,
      lineColor: bar,
      background: bg,
    });
  };

  return (
    <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6" id="barcode-styling-panel">
      {/* Title */}
      <div>
        <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-900">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 block"></span>
          2. BARCODE STYLE & GEOMETRY CUSTOMIZER
        </h2>
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mt-1">
          Tune bar dimensions, quiet zone boundaries, color schemes, and human-readable typography.
        </p>
      </div>

      {/* Colors Section */}
      <div className="flex flex-col gap-4 border-t-2 border-dashed border-zinc-200 pt-5" id="barcode-colors-section">
        <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-emerald-500" />
          Color Palette Presets
        </label>

        {/* Preset Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BARCODE_PALETTES.map((p, idx) => (
            <button
              key={idx}
              id={`barcode-palette-chip-${idx}`}
              type="button"
              onClick={() => selectPalette(p.bar, p.bg)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-zinc-200 hover:border-black bg-zinc-50 hover:bg-zinc-100 transition-all text-left cursor-pointer font-bold text-xs"
            >
              <div className="flex -space-x-1">
                <span className="w-3.5 h-3.5 rounded-full border border-white block" style={{ backgroundColor: p.bar }}></span>
                <span className="w-3.5 h-3.5 rounded-full border border-black block" style={{ backgroundColor: p.bg }}></span>
              </div>
              <span className="text-[10px] uppercase font-black text-zinc-600 truncate">{p.name}</span>
            </button>
          ))}
        </div>

        {/* Custom hex colors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1" id="barcode-custom-colors">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Bar Line Color (Foreground)</span>
            <div className="flex items-center gap-2 border-2 border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 focus-within:border-black transition-all">
              <input
                type="color"
                id="barcode-lineColor-picker"
                value={design.lineColor}
                onChange={(e) => updateKey('lineColor', e.target.value)}
                className="w-6 h-6 rounded-md cursor-pointer border-0 p-0 bg-transparent"
              />
              <input
                type="text"
                id="barcode-lineColor-input"
                value={design.lineColor}
                onChange={(e) => updateKey('lineColor', e.target.value)}
                className="text-xs font-mono font-bold text-zinc-700 bg-transparent w-full focus:outline-none"
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Background Color</span>
            <div className="flex items-center gap-2 border-2 border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 focus-within:border-black transition-all">
              <input
                type="color"
                id="barcode-bgColor-picker"
                value={design.background}
                onChange={(e) => updateKey('background', e.target.value)}
                className="w-6 h-6 rounded-md cursor-pointer border-0 p-0 bg-transparent"
              />
              <input
                type="text"
                id="barcode-bgColor-input"
                value={design.background}
                onChange={(e) => updateKey('background', e.target.value)}
                className="text-xs font-mono font-bold text-zinc-700 bg-transparent w-full focus:outline-none"
                placeholder="#FFFFFF"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Dimensions & Geometry */}
      <div className="flex flex-col gap-4 border-t-2 border-dashed border-zinc-200 pt-5" id="barcode-geometry-section">
        <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-emerald-500" />
          Dimension & Geometry Tuning
        </label>

        {/* Bar Width Scale */}
        <div className="flex flex-col gap-1" id="barcode-width-slider">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-500">
            <span>Single Bar Width Scale</span>
            <span className="font-mono text-zinc-800">{design.width}x Multiplier</span>
          </div>
          <div className="grid grid-cols-5 gap-2 mt-1">
            {[1, 2, 3, 4, 5].map((w) => (
              <button
                key={w}
                type="button"
                id={`bar-width-btn-${w}`}
                onClick={() => updateKey('width', w)}
                className={`py-2 px-1 text-center font-black text-xs rounded-xl border-2 transition-all cursor-pointer ${
                  design.width === w
                    ? 'border-black bg-zinc-900 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:border-black hover:bg-zinc-50 hover:text-black'
                }`}
              >
                {w}x
              </button>
            ))}
          </div>
        </div>

        {/* Bar Height Slider */}
        <div className="flex flex-col gap-1" id="barcode-height-slider">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-500">
            <span>Barcode Height</span>
            <span className="font-mono text-zinc-800">{design.height} PX</span>
          </div>
          <input
            type="range"
            min="30"
            max="180"
            step="5"
            value={design.height}
            onChange={(e) => updateKey('height', parseInt(e.target.value, 10))}
            className="w-full accent-black mt-1.5 cursor-ew-resize"
          />
        </div>

        {/* Margin Quiet Zone */}
        <div className="flex flex-col gap-1" id="barcode-margin-slider">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-500">
            <span>Quiet Zone Margin (Padding)</span>
            <span className="font-mono text-zinc-800">{design.margin} PX</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            step="2"
            value={design.margin}
            onChange={(e) => updateKey('margin', parseInt(e.target.value, 10))}
            className="w-full accent-black mt-1.5 cursor-ew-resize"
          />
        </div>
      </div>

      {/* Human-Readable Text Configuration */}
      <div className="flex flex-col gap-4 border-t-2 border-dashed border-zinc-200 pt-5" id="barcode-text-section">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Type className="w-4 h-4 text-emerald-500" />
            Human-Readable Text Label
          </label>

          <button
            type="button"
            id="toggle-display-value-btn"
            onClick={() => updateKey('displayValue', !design.displayValue)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-2 border-black transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer ${
              design.displayValue
                ? 'bg-emerald-100 text-emerald-900'
                : 'bg-zinc-200 text-zinc-600'
            }`}
          >
            {design.displayValue ? (
              <>
                <Eye className="w-3 h-3 text-emerald-700" /> Text Enabled
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3 text-zinc-500" /> Text Hidden
              </>
            )}
          </button>
        </div>

        {design.displayValue && (
          <div className="flex flex-col gap-4 bg-zinc-50 border-2 border-zinc-200 rounded-2xl p-4 mt-1" id="text-controls-subpanel">
            {/* Position & Alignment Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                  <MoveVertical className="w-3 h-3" /> Text Position
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateKey('textPosition', 'bottom')}
                    className={`py-1.5 text-xs font-black uppercase rounded-lg border-2 transition-all cursor-pointer ${
                      design.textPosition === 'bottom'
                        ? 'border-black bg-zinc-900 text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-black'
                    }`}
                  >
                    Bottom
                  </button>
                  <button
                    type="button"
                    onClick={() => updateKey('textPosition', 'top')}
                    className={`py-1.5 text-xs font-black uppercase rounded-lg border-2 transition-all cursor-pointer ${
                      design.textPosition === 'top'
                        ? 'border-black bg-zinc-900 text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-black'
                    }`}
                  >
                    Top
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                  <AlignCenter className="w-3 h-3" /> Alignment
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateKey('textAlign', 'left')}
                    className={`py-1.5 flex justify-center items-center rounded-lg border-2 transition-all cursor-pointer ${
                      design.textAlign === 'left'
                        ? 'border-black bg-zinc-900 text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-black'
                    }`}
                    title="Left Align"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateKey('textAlign', 'center')}
                    className={`py-1.5 flex justify-center items-center rounded-lg border-2 transition-all cursor-pointer ${
                      design.textAlign === 'center'
                        ? 'border-black bg-zinc-900 text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-black'
                    }`}
                    title="Center Align"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateKey('textAlign', 'right')}
                    className={`py-1.5 flex justify-center items-center rounded-lg border-2 transition-all cursor-pointer ${
                      design.textAlign === 'right'
                        ? 'border-black bg-zinc-900 text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-black'
                    }`}
                    title="Right Align"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Typography Font & Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Font Family</span>
                <select
                  value={design.font}
                  onChange={(e) => updateKey('font', e.target.value)}
                  className="text-xs font-bold text-zinc-800 border-2 border-zinc-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-black"
                >
                  {FONT_FAMILIES.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Font Weight / Style</span>
                <select
                  value={design.fontOptions}
                  onChange={(e) => updateKey('fontOptions', e.target.value)}
                  className="text-xs font-bold text-zinc-800 border-2 border-zinc-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-black"
                >
                  {FONT_WEIGHTS.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Font Size & Text Margin Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  <span>Font Size</span>
                  <span className="font-mono text-zinc-800">{design.fontSize} PX</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="28"
                  step="1"
                  value={design.fontSize}
                  onChange={(e) => updateKey('fontSize', parseInt(e.target.value, 10))}
                  className="w-full accent-black mt-1 cursor-ew-resize"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  <span>Text Margin</span>
                  <span className="font-mono text-zinc-800">{design.textMargin} PX</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={design.textMargin}
                  onChange={(e) => updateKey('textMargin', parseInt(e.target.value, 10))}
                  className="w-full accent-black mt-1 cursor-ew-resize"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
