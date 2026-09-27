import React, { useState } from 'react';
import { History, Trash, ExternalLink, Calendar, Link, Wifi, Mail, MessageSquare, Phone, UserCheck, Type, FolderX } from 'lucide-react';
import { HistoryItem } from '../types';

interface QRHistoryListProps {
  items: HistoryItem[];
  onLoadItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export default function QRHistoryList({ items, onLoadItem, onDeleteItem, onClearAll }: QRHistoryListProps) {
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  // Map types to descriptive text and small icon elements
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'url':
        return { label: 'LINK', bg: 'bg-blue-100 text-blue-900 border-2 border-black', icon: Link };
      case 'text':
        return { label: 'TEXT', bg: 'bg-zinc-100 text-zinc-800 border-2 border-black', icon: Type };
      case 'wifi':
        return { label: 'WIFI', bg: 'bg-emerald-100 text-emerald-900 border-2 border-black', icon: Wifi };
      case 'email':
        return { label: 'EMAIL', bg: 'bg-indigo-100 text-indigo-900 border-2 border-black', icon: Mail };
      case 'sms':
        return { label: 'SMS', bg: 'bg-amber-100 text-amber-900 border-2 border-black', icon: MessageSquare };
      case 'phone':
        return { label: 'PHONE', bg: 'bg-rose-100 text-rose-900 border-2 border-black', icon: Phone };
      case 'vcard':
        return { label: 'VCARD', bg: 'bg-purple-100 text-purple-900 border-2 border-black', icon: UserCheck };
      default:
        return { label: 'DATA', bg: 'bg-zinc-100 text-zinc-800 border-2 border-black', icon: Type };
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'RECENT';
    }
  };

  return (
    <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6" id="qr-history-panel">
      {/* Header section with Clear history trigger */}
      <div className="flex items-center justify-between gap-4 border-b-2 border-dashed border-zinc-200 pb-5">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-900">
            <History className="w-4 h-4 text-zinc-650" />
            BOOKMARK CHRONICLE LIBRARY ({items.length})
          </h2>
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mt-1">Direct access and reconfiguration hub for custom outputs.</p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center">
            {!confirmClear ? (
              <button
                type="button"
                id="clear-all-prompt-btn"
                onClick={() => setConfirmClear(true)}
                className="text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-red-650 bg-zinc-100 border-2 border-transparent hover:border-black rounded-lg py-1.5 px-3.5 transition-all cursor-pointer"
              >
                Clear Library
              </button>
            ) : (
              <div className="flex items-center gap-2" id="clear-all-confirmation">
                <button
                  type="button"
                  id="confirm-clear-yes"
                  onClick={() => {
                    onClearAll();
                    setConfirmClear(false);
                  }}
                  className="text-[10px] font-black uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  Yes, Clear
                </button>
                <button
                  type="button"
                  id="confirm-clear-no"
                  onClick={() => setConfirmClear(false)}
                  className="text-[10px] font-black uppercase tracking-wider text-zinc-700 bg-zinc-100 border-2 border-zinc-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* History Items Roll */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50" id="history-empty-placeholder">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center text-zinc-400 mb-3.5 shadow-sm">
            <FolderX className="w-5 h-5" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-zinc-700 block">No Bookmarks Recorded</span>
          <span className="text-[10px] font-semibold text-zinc-400 mt-1 block max-w-xs leading-normal uppercase">
            Click &quot;Save Setup&quot; in the primary control layout to index your unique presets here.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id="history-items-grid">
          {items.map((item) => {
            const badge = getTypeBadge(item.type);
            const IconComponent = badge.icon;
            return (
              <div
                key={item.id}
                id={`history-item-card-${item.id}`}
                className="group border-2 border-black rounded-2xl p-4 bg-zinc-50 hover:bg-zinc-100/50 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative flex flex-col justify-between gap-3.5"
              >
                {/* Details banner */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${badge.bg} flex items-center gap-1`}>
                      <IconComponent className="w-3 h-3" />
                      {badge.label}
                    </span>
                    
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1 font-medium select-none">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800 mt-3 truncate leading-tight select-all pr-4 group-hover:text-blue-600 transition-colors" title={item.title}>
                    {item.title}
                  </h3>

                  <p className="text-[10px] font-mono text-zinc-400 mt-1 truncate max-w-full select-all" title={item.rawText}>
                    {item.rawText}
                  </p>
                </div>

                {/* Palette visual dots and load control */}
                <div className="flex items-center justify-between border-t-2 border-dashed border-zinc-200 pt-3.5 mt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full border-2 border-black block shadow-sm" style={{ backgroundColor: item.design.fgColor }} title={`FG: ${item.design.fgColor}`}></span>
                    <span className="w-4 h-4 rounded-full border-2 border-black block shadow-sm" style={{ backgroundColor: item.design.bgColor }} title={`BG: ${item.design.bgColor}`}></span>
                    {item.design.logoUrl && (
                      <span className="text-[8px] font-black bg-emerald-100 text-emerald-950 border border-black px-1.5 py-0.5 rounded shadow-sm scale-90 uppercase">LOGO</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      id={`load-history-item-${item.id}`}
                      onClick={() => onLoadItem(item)}
                      className="text-[10px] font-black uppercase tracking-wider text-black bg-white hover:bg-zinc-900 hover:text-white px-2.5 py-1.5 rounded-lg border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      LOAD
                    </button>
                    
                    <button
                      type="button"
                      id={`delete-history-item-${item.id}`}
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-black rounded-lg transition-all cursor-pointer"
                      title="Delete saved configuration"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
