import React from 'react';
import { BarcodeHistoryItem } from '../types';
import { Barcode, History, Trash2, ArrowUpRight, Copy, Check, Calendar, Tag } from 'lucide-react';

interface BarcodeHistoryListProps {
  items: BarcodeHistoryItem[];
  onLoadItem: (item: BarcodeHistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export default function BarcodeHistoryList({
  items,
  onLoadItem,
  onDeleteItem,
  onClearAll,
}: BarcodeHistoryListProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white border-2 border-black rounded-3xl p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center flex flex-col items-center justify-center gap-3" id="barcode-history-empty">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 border-2 border-black flex items-center justify-center text-zinc-400">
          <History className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">No Saved Barcodes Yet</h3>
          <p className="text-xs font-semibold text-zinc-400 mt-1 max-w-sm">
            Save your customized barcodes using the "Save" button in the Live Barcode Viewport to quickly recall presets anytime.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6" id="barcode-history-panel">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900">
              SAVED BARCODE LIBRARY ({items.length})
            </h2>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Local persistent storage catalog
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClearAll}
          className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-black rounded-xl text-[11px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[1px] cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border-t-2 border-dashed border-zinc-200 pt-5">
        {items.map((item) => (
          <div
            key={item.id}
            className="border-2 border-black rounded-2xl p-4 bg-zinc-50 hover:bg-white hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-between gap-3 group"
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded-md">
                  {item.format}
                </span>
                <span className="text-[9px] font-mono font-bold text-zinc-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h4 className="text-xs font-black text-zinc-900 truncate mt-1">
                {item.title}
              </h4>
              <p className="text-[11px] font-mono font-bold text-zinc-600 bg-white border border-zinc-200 rounded-lg p-2 truncate">
                {item.value}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-200 pt-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCopy(item.id, item.value)}
                  className="p-1.5 rounded-lg border border-zinc-300 hover:border-black bg-white text-zinc-700 hover:text-black transition-all cursor-pointer"
                  title="Copy barcode value"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 rounded-lg border border-zinc-300 hover:border-rose-600 bg-white text-zinc-700 hover:text-rose-600 transition-all cursor-pointer"
                  title="Delete item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => onLoadItem(item)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] cursor-pointer"
              >
                Load Studio
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
