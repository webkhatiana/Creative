import React, { useState, useEffect } from 'react';
import { QrCode, Barcode, Boxes, Sparkles, RefreshCw, Layers } from 'lucide-react';
import QRFormatInputs from './components/QRFormatInputs';
import QRStylingControls from './components/QRStylingControls';
import QRPreview from './components/QRPreview';
import QRHistoryList from './components/QRHistoryList';
import BarcodeFormatInputs from './components/BarcodeFormatInputs';
import BarcodeStylingControls from './components/BarcodeStylingControls';
import BarcodePreview from './components/BarcodePreview';
import BarcodeHistoryList from './components/BarcodeHistoryList';
import BatchBarcodeGenerator from './components/BatchBarcodeGenerator';
import { 
  QRType, 
  QRDesign, 
  HistoryItem, 
  StudioMode, 
  BarcodeDesign, 
  BarcodeHistoryItem 
} from './types';

const QR_STORAGE_KEY = 'qr_studio_history_v1';
const BARCODE_STORAGE_KEY = 'barcode_studio_history_v1';

const DEFAULT_QR_DESIGN: QRDesign = {
  fgColor: '#000000',
  bgColor: '#ffffff',
  margin: 3,
  errorCorrection: 'Q',
  size: 512,
  logoUrl: null,
  logoSize: 0.2, // 20% size
  logoMargin: true,
};

const DEFAULT_BARCODE_DESIGN: BarcodeDesign = {
  format: 'CODE128',
  lineColor: '#000000',
  background: '#ffffff',
  width: 2,
  height: 90,
  displayValue: true,
  text: '',
  font: 'monospace',
  fontOptions: 'bold',
  fontSize: 16,
  textAlign: 'center',
  textPosition: 'bottom',
  textMargin: 4,
  margin: 14,
};

export default function App() {
  // Navigation Studio Mode
  const [studioMode, setStudioMode] = useState<StudioMode>('barcode');

  // QR State
  const [currentQRType, setCurrentQRType] = useState<QRType>('url');
  const [qrRawText, setQrRawText] = useState<string>('https://google.com');
  const [qrTitle, setQrTitle] = useState<string>('URL: google.com');
  const [qrDesign, setQrDesign] = useState<QRDesign>(DEFAULT_QR_DESIGN);
  const [qrHistory, setQrHistory] = useState<HistoryItem[]>([]);

  // Barcode State
  const [barcodeValue, setBarcodeValue] = useState<string>('STUDIO-8942-X7');
  const [barcodeTitle, setBarcodeTitle] = useState<string>('Code 128: STUDIO-8942-X7');
  const [barcodeDesign, setBarcodeDesign] = useState<BarcodeDesign>(DEFAULT_BARCODE_DESIGN);
  const [barcodeHistory, setBarcodeHistory] = useState<BarcodeHistoryItem[]>([]);

  // Load Saved Histories from LocalStorage on mount safely
  useEffect(() => {
    try {
      const storedQR = localStorage.getItem(QR_STORAGE_KEY);
      if (storedQR) {
        setQrHistory(JSON.parse(storedQR));
      }
      const storedBarcode = localStorage.getItem(BARCODE_STORAGE_KEY);
      if (storedBarcode) {
        setBarcodeHistory(JSON.parse(storedBarcode));
      }
    } catch (e) {
      console.error('Failed to load history from storage', e);
    }
  }, []);

  // QR History Handlers
  const handleSaveQRToHistory = (textToSave: string, designToSave: QRDesign, titleToSave: string) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      title: titleToSave,
      type: currentQRType,
      rawText: textToSave,
      design: { ...designToSave },
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...qrHistory];
    setQrHistory(updated);
    try {
      localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to write QR history', e);
    }
  };

  const handleDeleteQRItem = (id: string) => {
    const updated = qrHistory.filter((item) => item.id !== id);
    setQrHistory(updated);
    try {
      localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update QR history', e);
    }
  };

  const handleClearAllQR = () => {
    setQrHistory([]);
    try {
      localStorage.removeItem(QR_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear QR history', e);
    }
  };

  const handleLoadQRItem = (item: HistoryItem) => {
    setCurrentQRType(item.type);
    setQrRawText(item.rawText);
    setQrTitle(item.title);
    setQrDesign({ ...item.design });
    setStudioMode('qr');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Barcode History Handlers
  const handleSaveBarcodeToHistory = (valToSave: string, designToSave: BarcodeDesign, titleToSave: string) => {
    const newItem: BarcodeHistoryItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      title: titleToSave,
      format: designToSave.format,
      value: valToSave,
      design: { ...designToSave },
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...barcodeHistory];
    setBarcodeHistory(updated);
    try {
      localStorage.setItem(BARCODE_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to write Barcode history', e);
    }
  };

  const handleDeleteBarcodeItem = (id: string) => {
    const updated = barcodeHistory.filter((item) => item.id !== id);
    setBarcodeHistory(updated);
    try {
      localStorage.setItem(BARCODE_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update Barcode history', e);
    }
  };

  const handleClearAllBarcodes = () => {
    setBarcodeHistory([]);
    try {
      localStorage.removeItem(BARCODE_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear Barcode history', e);
    }
  };

  const handleLoadBarcodeItem = (item: BarcodeHistoryItem) => {
    setBarcodeValue(item.value);
    setBarcodeTitle(item.title);
    setBarcodeDesign({ ...item.design });
    setStudioMode('barcode');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetActiveTheme = () => {
    if (studioMode === 'qr') {
      setQrDesign(DEFAULT_QR_DESIGN);
    } else {
      setBarcodeDesign(DEFAULT_BARCODE_DESIGN);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 selection:bg-black selection:text-white pb-16 font-sans">
      {/* Visual Header Banner */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-40" id="applet-prime-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo Title */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {studioMode === 'qr' ? (
                  <QrCode className="w-5 h-5" />
                ) : studioMode === 'barcode' ? (
                  <Barcode className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Boxes className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div>
                <h1 className="text-sm font-black uppercase tracking-widest text-zinc-900 leading-none">
                  BARCODE &amp; QR STUDIO
                </h1>
                <p className="text-[9px] font-bold text-zinc-400 mt-1 uppercase tracking-widest leading-none">
                  HIGH-FIDELITY CODE ENGINE
                </p>
              </div>
            </div>

            {/* Mobile quick reset */}
            <button
              onClick={resetActiveTheme}
              type="button"
              className="sm:hidden p-2 text-black bg-amber-100 border-2 border-black rounded-xl shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              title="Reset theme"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode Switcher Pills */}
          <nav className="flex items-center bg-zinc-100 p-1 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" id="studio-mode-switcher-nav">
            <button
              type="button"
              id="mode-tab-barcode"
              onClick={() => setStudioMode('barcode')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                studioMode === 'barcode'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-zinc-700 hover:text-black hover:bg-zinc-200/60'
              }`}
            >
              <Barcode className="w-4 h-4" />
              1D Barcode
              <span className="text-[8px] bg-emerald-500 text-black px-1.5 py-0.2 rounded font-black tracking-tight ml-0.5">
                PRO
              </span>
            </button>

            <button
              type="button"
              id="mode-tab-qr"
              onClick={() => setStudioMode('qr')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                studioMode === 'qr'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-zinc-700 hover:text-black hover:bg-zinc-200/60'
              }`}
            >
              <QrCode className="w-4 h-4" />
              2D QR Code
            </button>

            <button
              type="button"
              id="mode-tab-batch"
              onClick={() => setStudioMode('batch_barcode')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                studioMode === 'batch_barcode'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-zinc-700 hover:text-black hover:bg-zinc-200/60'
              }`}
            >
              <Boxes className="w-4 h-4" />
              Batch Suite
            </button>
          </nav>

          {/* Desktop Reset Button */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={resetActiveTheme}
              type="button"
              id="global-reset-controls"
              className="px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-black bg-amber-100 hover:bg-amber-200 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[1px] transition-all cursor-pointer flex items-center gap-1.5"
              title="Reset current styles to defaults"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Style
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Stage */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col gap-6" id="applet-grid-stage">
        
        {/* ========================================================
            MODE 1: CUSTOMIZABLE 1D BARCODE GENERATOR SECTION
        ======================================================== */}
        {studioMode === 'barcode' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="barcode-bento-columns">
              {/* Inputs Column */}
              <div className="lg:col-span-7 flex flex-col gap-6" id="barcode-inputs-column">
                <BarcodeFormatInputs
                  design={barcodeDesign}
                  value={barcodeValue}
                  title={barcodeTitle}
                  onValueChange={setBarcodeValue}
                  onTitleChange={setBarcodeTitle}
                  onDesignChange={setBarcodeDesign}
                />

                <BarcodeStylingControls
                  design={barcodeDesign}
                  onDesignChange={setBarcodeDesign}
                />
              </div>

              {/* Sticky Barcode Viewport & Export Column */}
              <div className="lg:col-span-5 lg:sticky lg:top-[85px] h-fit flex flex-col gap-6" id="barcode-preview-sticky-column">
                <BarcodePreview
                  value={barcodeValue}
                  design={barcodeDesign}
                  title={barcodeTitle}
                  onSaveToHistory={handleSaveBarcodeToHistory}
                />
              </div>
            </div>

            {/* Saved Barcodes History Catalog */}
            <div className="mt-2" id="barcode-history-container">
              <BarcodeHistoryList
                items={barcodeHistory}
                onLoadItem={handleLoadBarcodeItem}
                onDeleteItem={handleDeleteBarcodeItem}
                onClearAll={handleClearAllBarcodes}
              />
            </div>
          </>
        )}

        {/* ========================================================
            MODE 2: 2D QR CODE STUDIO SECTION
        ======================================================== */}
        {studioMode === 'qr' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="qr-bento-columns">
              {/* QR Inputs Column */}
              <div className="lg:col-span-7 flex flex-col gap-6" id="qr-inputs-column">
                <QRFormatInputs
                  currentType={currentQRType}
                  onChangeType={setCurrentQRType}
                  onRawTextChanged={(text, autoTitle) => {
                    setQrRawText(text);
                    setQrTitle(autoTitle);
                  }}
                />

                <QRStylingControls
                  design={qrDesign}
                  onDesignChange={setQrDesign}
                />
              </div>

              {/* QR Preview Column */}
              <div className="lg:col-span-5 lg:sticky lg:top-[85px] h-fit flex flex-col gap-6" id="qr-preview-sticky-column">
                <QRPreview
                  rawText={qrRawText}
                  design={qrDesign}
                  title={qrTitle}
                  onSaveToHistory={handleSaveQRToHistory}
                />

                {/* QR Diagnostics Card */}
                <section className="bg-zinc-900 border-2 border-black text-white rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">QR CODE TELEMETRY</span>
                    <span className="text-[9px] bg-blue-600 text-white font-black uppercase px-2 py-0.5 rounded-full border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">2D MATRIX LIVE</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-800/50 border border-zinc-800 rounded-xl p-3">
                      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">RENDER SIZE</span>
                      <span className="text-sm font-mono font-bold text-white block mt-1">{qrDesign.size}px × {qrDesign.size}px</span>
                    </div>
                    <div className="bg-zinc-800/50 border border-zinc-800 rounded-xl p-3">
                      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">ERROR SHIELD</span>
                      <span className="text-sm font-mono font-bold text-white block mt-1">{qrDesign.errorCorrection} LOCKED</span>
                    </div>
                    <div className="bg-zinc-800/50 border border-zinc-800 rounded-xl p-3">
                      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">MARGIN QUIET</span>
                      <span className="text-sm font-mono font-bold text-white block mt-1">{qrDesign.margin} CELLS</span>
                    </div>
                    <div className="bg-zinc-800/50 border border-zinc-800 rounded-xl p-3">
                      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">SAVED QR CODES</span>
                      <span className="text-sm font-mono font-bold text-white block mt-1">{qrHistory.length} INDEXED</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Saved QR History List */}
            <div className="mt-2" id="qr-history-container">
              <QRHistoryList
                items={qrHistory}
                onLoadItem={handleLoadQRItem}
                onDeleteItem={handleDeleteQRItem}
                onClearAll={handleClearAllQR}
              />
            </div>
          </>
        )}

        {/* ========================================================
            MODE 3: BATCH BARCODE GENERATOR SECTION
        ======================================================== */}
        {studioMode === 'batch_barcode' && (
          <div className="flex flex-col gap-6" id="batch-barcode-full-container">
            <BatchBarcodeGenerator baseDesign={barcodeDesign} />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t-2 border-dashed border-zinc-200 text-center" id="minimalist-clean-footer">
        <p className="text-[11px] text-zinc-400 font-extrabold uppercase tracking-wider">
          BARCODE &amp; QR STUDIO • REAL-TIME 1D &amp; 2D GENERATION • LOCAL PERSISTENCE &amp; HIGH-RES EXPORT
        </p>
      </footer>
    </div>
  );
}

