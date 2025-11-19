
import React, { useState, useEffect } from 'react';
import { Copy, Check, Terminal, FileText, QrCode, X, Save } from 'lucide-react';
import QRCode from 'qrcode';

interface ScriptDisplayProps {
  code: string;
  explanation: string;
  onSave: () => void;
}

const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ code, explanation, onSave }) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'explanation'>('code');
  
  // QR Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveClick = () => {
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Generate QR code when modal opens
  useEffect(() => {
    if (isQrModalOpen && code) {
      // Reset state
      setQrDataUrl(null);
      setQrError(null);

      QRCode.toDataURL(code, {
        errorCorrectionLevel: 'L', // Low error correction to maximize character capacity
        margin: 2,
        width: 400,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      .then(url => {
        setQrDataUrl(url);
      })
      .catch(err => {
        console.error("QR Generation Error:", err);
        setQrError("This script is too long to generate a standard QR code. Please copy the text manually.");
      });
    }
  }, [isQrModalOpen, code]);

  return (
    <>
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[600px] animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'code' ? 'bg-slate-700 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              script.py
            </button>
            <button
              onClick={() => setActiveTab('explanation')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'explanation' ? 'bg-slate-700 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Explanation
            </button>
          </div>
          
          {activeTab === 'code' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveClick}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-700 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs transition-all border border-slate-600 hover:border-emerald-500 hover:scale-105 active:scale-95"
                title="Save to History"
              >
                {saved ? <Check className="w-3.5 h-3.5 animate-scale-in" /> : <Save className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{saved ? 'Saved!' : 'Save'}</span>
              </button>
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs transition-all border border-slate-600 hover:scale-105 active:scale-95"
                title="Generate QR Code"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">QR Code</span>
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs transition-all border border-slate-600 hover:scale-105 active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 animate-scale-in" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-[#0d1117] text-slate-300 p-4 relative">
          {activeTab === 'code' ? (
            <pre className="font-mono text-sm leading-relaxed animate-fade-in">
              <code>{code}</code>
            </pre>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none animate-fade-in">
              <div className="whitespace-pre-wrap font-sans text-slate-300 leading-7">
                {explanation}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in">
          <div 
            className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-semibold text-white">Scan Script</h3>
              </div>
              <button 
                onClick={() => setIsQrModalOpen(false)} 
                className="text-slate-400 hover:text-white hover:bg-slate-700 p-1 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 flex flex-col items-center justify-center min-h-[320px] bg-slate-900">
              {qrError ? (
                <div className="text-center text-red-300 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-scale-in">
                  <p className="text-sm font-medium">{qrError}</p>
                </div>
              ) : qrDataUrl ? (
                <div className="bg-white p-3 rounded-xl shadow-xl animate-scale-in">
                  <img src={qrDataUrl} alt="Script QR Code" className="w-64 h-64 object-contain" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                  <p className="text-slate-400 text-sm animate-pulse">Encoding script...</p>
                </div>
              )}
              
              <p className="mt-6 text-sm text-slate-400 text-center max-w-xs leading-relaxed">
                Scan to transfer the code to your mobile device.
                {qrDataUrl && <span className="block text-xs text-slate-500 mt-2">Note: Requires a QR scanner that supports large text payloads.</span>}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ScriptDisplay;
