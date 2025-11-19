
import React from 'react';
import { X, Clock, Trash2, ChevronRight, Terminal, Settings, Calendar } from 'lucide-react';
import { SavedScript } from '../types';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: SavedScript[];
  onLoad: (script: SavedScript) => void;
  onDelete: (id: string) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onLoad, onDelete }) => {
  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" 
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full animate-slide-in-right">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-lg">Script History</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 animate-fade-in">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No history found.</p>
              <p className="text-xs opacity-70">Generate a script to save it here.</p>
            </div>
          ) : (
            history.map((item, index) => (
              <div 
                key={item.id} 
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-emerald-500/30 transition-all group animate-slide-up [animation-fill-mode:forwards]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.timestamp)}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                    className="text-slate-600 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {item.config.deepScan && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      DEEP SCAN
                    </span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 border border-slate-600">
                    {item.config.osTarget === 'cross-platform' ? 'Cross-Platform' : item.config.osTarget}
                  </span>
                  {item.config.scanWifi && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-400 border border-emerald-500/20">WiFi</span>}
                  {item.config.scanBluetooth && <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/50 text-blue-400 border border-blue-500/20">BLE</span>}
                </div>

                <button
                  onClick={() => onLoad(item)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-slate-700 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
                >
                  <Terminal className="w-3 h-3" />
                  Load Script
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;
