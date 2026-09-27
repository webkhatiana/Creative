import React, { useRef } from 'react';
import { Palette, Maximize2, FileImage, Trash2, ShieldAlert, Sparkles, Sliders } from 'lucide-react';
import { QRDesign } from '../types';

interface QRStylingControlsProps {
  design: QRDesign;
  onDesignChange: (design: QRDesign) => void;
}

const COLOR_PALETTES = [
  { name: 'Pure Dark', fg: '#000000', bg: '#ffffff' },
  { name: 'Royal Indigo', fg: '#312e81', bg: '#f8fafc' },
  { name: 'Forest Moss', fg: '#064e3b', bg: '#f0fdf4' },
  { name: 'Deep Crimson', fg: '#7f1d1d', bg: '#fff5f5' },
  { name: 'Midnight Violet', fg: '#4c1d95', bg: '#faf5ff' },
  { name: 'Warm Charcoal', fg: '#27272a', bg: '#fafafa' },
];

export default function QRStylingControls({ design, onDesignChange }: QRStylingControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateKey = <K extends keyof QRDesign>(key: K, value: QRDesign[K]) => {
    onDesignChange({
      ...design,
      [key]: value
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          updateKey('logoUrl', event.target.result);
          // Set error correction to Q or H if logo uploaded so scanning remains robust
          if (design.errorCorrection === 'L' || design.errorCorrection === 'M') {
            onDesignChange({
              ...design,
              logoUrl: event.target.result,
              errorCorrection: 'H' // High resistance needed for overlays
            });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    updateKey('logoUrl', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const selectPalette = (fg: string, bg: string) => {
    onDesignChange({
      ...design,
      fgColor: fg,
      bgColor: bg
    });
  };

  return (
    <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6" id="styling-controls-panel">
      {/* Title */}
      <div>
        <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-900">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 block"></span>
          2. STYLE CUSTOMIZER
        </h2>
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mt-1">Configure layout, colors, and embedded watermark graphics.</p>
      </div>

      {/* Colors Section */}
      <div className="flex flex-col gap-4 border-t-2 border-dashed border-zinc-200 pt-5" id="styling-colors-section">
        <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-emerald-500" />
          Color Palette Preset
        </label>
        
        {/* Preset Palette Chips */}
        <div className="grid grid-cols-2 xs:grid-cols-3 gap-2" id="palette-chips-grid">
          {COLOR_PALETTES.map((p, idx) => (
            <button
              key={idx}
              id={`palette-chip-${idx}`}
              type="button"
              onClick={() => selectPalette(p.fg, p.bg)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-zinc-200 hover:border-black bg-zinc-50 hover:bg-zinc-100 transition-all text-left cursor-pointer font-bold text-xs"
            >
              <div className="flex -space-x-1">
                <span className="w-3.5 h-3.5 rounded-full border border-white block" style={{ backgroundColor: p.fg }}></span>
                <span className="w-3.5 h-3.5 rounded-full border border-white block" style={{ backgroundColor: p.bg }}></span>
              </div>
              <span className="text-[10px] uppercase font-black text-zinc-600 truncate">{p.name}</span>
            </button>
          ))}
        </div>

        {/* Custom hex colors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1" id="custom-hex-inputs">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Foreground Color</span>
            <div className="flex items-center gap-2 border-2 border-zinc-200 rounded-xl px-3 py-2 bg-zinc-50 focus-within:border-black transition-all">
              <input
                type="color"
                id="design-fgColor-picker"
                value={design.fgColor}
                onChange={(e) => updateKey('fgColor', e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                id="design-fgColor-input"
                value={design.fgColor}
                onChange={(e) => updateKey('fgColor', e.target.value)}
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
                id="design-bgColor-picker"
                value={design.bgColor}
                onChange={(e) => updateKey('bgColor', e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                id="design-bgColor-input"
                value={design.bgColor}
                onChange={(e) => updateKey('bgColor', e.target.value)}
                className="text-xs font-mono font-bold text-zinc-700 bg-transparent w-full focus:outline-none"
                placeholder="#FFFFFF"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Embed Logo / Badge */}
      <div className="flex flex-col gap-4 border-t-2 border-dashed border-zinc-200 pt-5" id="styling-logo-section">
        <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 justify-between">
          <span className="flex items-center gap-1.5">
            <FileImage className="w-4 h-4 text-emerald-500" />
            Center Branding Overlays
          </span>
          {design.logoUrl && (
            <span className="text-[9px] bg-emerald-100 text-emerald-800 border-2 border-black font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <Sparkles className="w-2.5 h-2.5 text-emerald-600 animate-spin" /> Robust Protection Active
            </span>
          )}
        </label>

        {!design.logoUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-300 hover:border-black hover:bg-zinc-50/40 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
            id="logo-upload-dropzone"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-100 border-2 border-zinc-200 group-hover:bg-zinc-900 group-hover:text-white group-hover:border-black flex items-center justify-center text-zinc-500 transition-colors">
              <FileImage className="w-5 h-5 animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <span className="text-xs font-black uppercase text-zinc-700 tracking-wider block">Click to upload watermarks</span>
              <span className="text-[10px] font-medium text-zinc-400 mt-1 block">Transparent PNG formats work beautifully (Auto-correct updates automatically)</span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-file-input"
            />
          </div>
        ) : (
          <div className="bg-zinc-50 rounded-2xl border-2 border-zinc-200 p-4 flex items-center justify-between gap-4" id="logo-loaded-preview">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border-2 border-black p-1 flex items-center justify-center overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <img src={design.logoUrl} alt="Logo preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-zinc-800 block">Custom branding is live</span>
                <span className="text-[10px] font-semibold text-zinc-400 block mt-0.5">We set H-level error correction to keep code readable.</span>
              </div>
            </div>
            <button
              type="button"
              id="remove-logo-btn"
              onClick={handleRemoveLogo}
              className="p-2 bg-white hover:bg-red-550 border-2 border-transparent hover:border-black hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              title="Remove branding logo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Logo sizing & backing */}
        {design.logoUrl && (
          <div className="flex flex-col gap-3.5 bg-zinc-50 border-2 border-zinc-200 rounded-2xl p-4" id="logo-overlay-settings">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-500">
                <span>Logo Dimensions Scaling</span>
                <span className="font-mono text-zinc-800">{Math.round(design.logoSize * 100)}%</span>
              </div>
              <input
                type="range"
                id="design-logoSize-slider"
                min="0.1"
                max="0.3"
                step="0.02"
                value={design.logoSize}
                onChange={(e) => updateKey('logoSize', parseFloat(e.target.value))}
                className="w-full accent-black mt-1.5 cursor-ew-resize"
              />
            </div>

            <div className="flex items-center justify-between border-t-2 border-dashed border-zinc-200 pt-3">
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-700">Logo Shield Boundary</span>
                <span className="text-[10px] text-zinc-400 font-medium">Clear quiet background space behind watermark.</span>
              </div>
              <button
                type="button"
                id="logo-shield-toggle"
                onClick={() => updateKey('logoMargin', !design.logoMargin)}
                className={`w-11 h-6 rounded-full transition-all cursor-pointer relative border border-black ${
                  design.logoMargin ? 'bg-emerald-600' : 'bg-zinc-300'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${
                  design.logoMargin ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Geometry parameters */}
      <div className="flex flex-col gap-4 border-t-2 border-dashed border-zinc-200 pt-5" id="styling-advanced-geometry-section">
        <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-emerald-500" />
          Dimension Tuning Parameters
        </label>

        {/* Size Slider */}
        <div className="flex flex-col gap-1" id="qp-resolution-slider">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-500">
            <span>Render Resolution (Pixels)</span>
            <span className="font-mono text-zinc-800">{design.size} x {design.size} PX</span>
          </div>
          <input
            type="range"
            id="design-size-slider"
            min="128"
            max="1024"
            step="16"
            value={design.size}
            onChange={(e) => updateKey('size', parseInt(e.target.value))}
            className="w-full accent-black mt-1.5 cursor-ew-resize"
          />
        </div>

        {/* Margin Slider */}
        <div className="flex flex-col gap-1" id="qp-margin-slider">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-500">
            <span>Outer Quiet Zone (Border Margin)</span>
            <span className="font-mono text-zinc-800">{design.margin} BLOCKS</span>
          </div>
          <input
            type="range"
            id="design-margin-slider"
            min="0"
            max="6"
            step="1"
            value={design.margin}
            onChange={(e) => updateKey('margin', parseInt(e.target.value))}
            className="w-full accent-black mt-1.5 cursor-ew-resize"
          />
        </div>

        {/* Error Correction Selection */}
        <div className="flex flex-col gap-1.5" id="qp-error-correction">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-500">
            <span className="flex items-center gap-1">
              Error Correction Level
              <span className="group relative cursor-help">
                <ShieldAlert className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-650" />
                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-zinc-900 border-2 border-black text-white text-[10px] p-2 rounded-lg shadow-lg text-center leading-normal z-50">
                  Higher levels resist data loss due to scratch damage or branding logo obstruction.
                </span>
              </span>
            </span>
            <span className="font-black text-[9px] uppercase text-emerald-700">
              {design.errorCorrection === 'L' && '7% Damage Shield'}
              {design.errorCorrection === 'M' && '15% Damage Shield'}
              {design.errorCorrection === 'Q' && '25% Damage Shield'}
              {design.errorCorrection === 'H' && '30% Damage Shield'}
            </span>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mt-1" id="err-correction-levels">
            {(['L', 'M', 'Q', 'H'] as const).map((level) => {
              const active = design.errorCorrection === level;
              const disabled = design.logoUrl !== null && (level === 'L' || level === 'M'); // disable lower correction when logo exists

              return (
                <button
                  key={level}
                  id={`err-level-${level}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => updateKey('errorCorrection', level)}
                  className={`py-2 px-1 text-center font-black text-sm rounded-xl border-2 transition-all cursor-pointer ${
                    active
                      ? 'border-black bg-zinc-900 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : disabled
                      ? 'border-zinc-200 bg-zinc-100/50 text-zinc-350 cursor-not-allowed'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:border-black hover:bg-zinc-50 hover:text-black'
                  }`}
                  title={disabled ? "Disabled: High correction level is required when embedding logo." : ""}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
