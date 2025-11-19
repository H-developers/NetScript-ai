
import React from 'react';
import { ScriptConfig, GitHubUser } from '../types';
import { Settings, Wifi, Bluetooth, ShieldCheck, Clock, Zap, Router, Lock, FileOutput, Globe, Siren, Laptop } from 'lucide-react';

interface GeneratorFormProps {
  config: ScriptConfig;
  setConfig: (config: ScriptConfig) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  user: GitHubUser | null;
  onLoginRequest: () => void;
}

const GeneratorForm: React.FC<GeneratorFormProps> = ({ config, setConfig, isGenerating, onGenerate, user, onLoginRequest }) => {
  
  const handleChange = <K extends keyof ScriptConfig>(key: K, value: ScriptConfig[K]) => {
    setConfig({ ...config, [key]: value });
  };

  // Handler for features that require authentication
  const handleLockedToggle = (key: keyof ScriptConfig) => {
    if (!user) {
      onLoginRequest();
      return;
    }
    handleChange(key, !config[key] as boolean);
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-xl backdrop-blur-sm animate-slide-up">
      <div className="flex items-center gap-2 mb-6 text-emerald-400 animate-fade-in">
        <Settings className="w-5 h-5" />
        <h2 className="text-lg font-semibold text-white">Scan Configuration</h2>
      </div>

      <div className="space-y-8">
        
        {/* SECTION 1: BASIC SCAN (Unlocked) */}
        <div className="space-y-3 opacity-0 animate-slide-up [animation-fill-mode:forwards] [animation-delay:100ms]">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 animate-fade-in">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            Basic Discovery (Unlocked)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleChange('scanWifi', !config.scanWifi)}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                config.scanWifi 
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300' 
                  : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <Wifi className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">WiFi / LAN</div>
                <div className="text-xs opacity-70">ARP Scan (Layer 2)</div>
              </div>
            </button>

            <button
              onClick={() => handleChange('scanBluetooth', !config.scanBluetooth)}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                config.scanBluetooth 
                  ? 'bg-blue-500/10 border-blue-500/50 text-blue-300' 
                  : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <Bluetooth className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Bluetooth</div>
                <div className="text-xs opacity-70">BLE & Classic</div>
              </div>
            </button>
          </div>
        </div>

        {/* SECTION 2: HIGH LEVEL SCAN (Locked) */}
        <div className="space-y-3 relative opacity-0 animate-slide-up [animation-fill-mode:forwards] [animation-delay:200ms]">
          <label className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2 animate-fade-in">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
            High Level Intelligence
            {!user && <Lock className="w-3 h-3 ml-1" />}
          </label>
          
          <div className={`grid grid-cols-1 gap-3 ${!user ? 'opacity-70' : ''}`}>
            
            {/* Deep Scan (Parent Feature) */}
            <button
              onClick={() => handleLockedToggle('deepScan')}
              className={`w-full flex items-center justify-between gap-3 p-3 rounded-lg border transition-all duration-300 group hover:scale-[1.01] ${
                config.deepScan
                  ? 'bg-purple-500/10 border-purple-500/50 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.1)]' 
                  : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-purple-500/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md transition-colors ${config.deepScan ? 'bg-purple-500/20' : 'bg-slate-800'}`}>
                  <Zap className={`w-4 h-4 ${config.deepScan ? 'text-purple-400' : 'text-slate-500'}`} />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm flex items-center gap-2">
                    Deep Scan Mode
                  </div>
                  <div className="text-[10px] opacity-70">Traffic Analysis & Identity Prediction</div>
                </div>
              </div>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${config.deepScan ? 'bg-purple-500' : 'bg-slate-700'}`}>
                <div className={`absolute top-[2px] left-[2px] w-3 h-3 rounded-full bg-white transition-transform ${config.deepScan ? 'translate-x-4' : ''}`}></div>
              </div>
            </button>

            {/* Deep Scan Sub-Features (Visible but Disabled if Deep Scan OFF) */}
            <div className={`ml-6 pl-4 border-l-2 border-purple-500/20 space-y-3 transition-all duration-300 ${!config.deepScan && user ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
              
              {/* Vulnerability Scan */}
              <button
                onClick={() => handleLockedToggle('vulnScan')}
                disabled={!config.deepScan}
                className={`w-full flex items-center justify-between gap-3 p-3 rounded-lg border transition-all duration-300 hover:scale-[1.01] ${
                  config.vulnScan
                    ? 'bg-red-500/10 border-red-500/50 text-red-300' 
                    : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-red-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md transition-colors ${config.vulnScan ? 'bg-red-500/20' : 'bg-slate-800'}`}>
                    <Siren className={`w-4 h-4 ${config.vulnScan ? 'text-red-400' : 'text-slate-500'}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm flex items-center gap-2">
                      Vulnerability Scan
                      <span className="text-[9px] border border-red-500/30 px-1 rounded text-red-400">NMAP</span>
                    </div>
                    <div className="text-[10px] opacity-70">Run CVE detection scripts</div>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${config.vulnScan ? 'bg-red-500' : 'bg-slate-700'}`}>
                  <div className={`absolute top-[2px] left-[2px] w-3 h-3 rounded-full bg-white transition-transform ${config.vulnScan ? 'translate-x-4' : ''}`}></div>
                </div>
              </button>

              {/* Online GeoIP */}
              <button
                onClick={() => handleLockedToggle('onlineGeoIp')}
                disabled={!config.deepScan}
                className={`w-full flex items-center justify-between gap-3 p-3 rounded-lg border transition-all duration-300 hover:scale-[1.01] ${
                  config.onlineGeoIp
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300' 
                    : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md transition-colors ${config.onlineGeoIp ? 'bg-cyan-500/20' : 'bg-slate-800'}`}>
                    <Globe className={`w-4 h-4 ${config.onlineGeoIp ? 'text-cyan-400' : 'text-slate-500'}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm flex items-center gap-2">
                      Online GeoIP
                      <span className="text-[9px] border border-cyan-500/30 px-1 rounded text-cyan-400">WEB</span>
                    </div>
                    <div className="text-[10px] opacity-70">Public IP & Location Lookup</div>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${config.onlineGeoIp ? 'bg-cyan-500' : 'bg-slate-700'}`}>
                  <div className={`absolute top-[2px] left-[2px] w-3 h-3 rounded-full bg-white transition-transform ${config.onlineGeoIp ? 'translate-x-4' : ''}`}></div>
                </div>
              </button>
            </div>

            {/* Port Scanning (Sibling Feature) */}
            <div className={`rounded-lg border transition-all duration-200 overflow-hidden hover:scale-[1.01] ${
                config.scanPorts
                  ? 'bg-orange-500/10 border-orange-500/50' 
                  : 'bg-slate-900/50 border-slate-700'
              }`}>
              <button
                onClick={() => handleLockedToggle('scanPorts')}
                className="w-full flex items-center justify-between p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md transition-colors ${config.scanPorts ? 'bg-orange-500/20' : 'bg-slate-800'}`}>
                    <Router className={`w-4 h-4 ${config.scanPorts ? 'text-orange-400' : 'text-slate-500'}`} />
                  </div>
                  <div className="text-left">
                    <div className={`font-medium text-sm ${config.scanPorts ? 'text-orange-300' : 'text-slate-400'}`}>
                      Port Scanning
                    </div>
                    <div className="text-[10px] opacity-70 text-slate-500">Detect open services</div>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${config.scanPorts ? 'bg-orange-500' : 'bg-slate-700'}`}>
                  <div className={`absolute top-[2px] left-[2px] w-3 h-3 rounded-full bg-white transition-transform ${config.scanPorts ? 'translate-x-4' : ''}`}></div>
                </div>
              </button>
              
              {config.scanPorts && user && (
                <div className="px-3 pb-3 pt-0 animate-slide-up">
                  <input 
                    type="text" 
                    value={config.portRange}
                    onChange={(e) => handleChange('portRange', e.target.value)}
                    className="w-full bg-slate-800/50 border border-orange-500/30 text-slate-200 text-xs rounded focus:ring-orange-500 focus:border-orange-500 block p-2 font-mono placeholder-slate-600"
                    placeholder="e.g., 22,80,443"
                  />
                </div>
              )}
            </div>

            {/* Lock Overlay for non-users */}
            {!user && (
              <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center cursor-pointer rounded-lg border border-slate-700/50 hover:bg-slate-900/50 transition-colors animate-fade-in"
                onClick={onLoginRequest}
              >
                <div className="p-3 bg-slate-900 rounded-full border border-slate-700 shadow-xl mb-2 group animate-scale-in">
                  <Lock className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </div>
                <span className="text-xs font-bold text-white">Login to Unlock High Level Features</span>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: GENERAL SETTINGS */}
        <div className="space-y-3 pt-2 border-t border-slate-800 opacity-0 animate-slide-up [animation-fill-mode:forwards] [animation-delay:300ms]">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider animate-fade-in">General Settings</label>
          
          <div className="grid grid-cols-2 gap-3">
             {/* File Export */}
             <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-3 flex flex-col justify-between gap-2 hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-2 text-slate-300">
                  <FileOutput className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium">Save JSON</span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer self-end">
                  <input 
                    type="checkbox" 
                    checked={config.exportReport} 
                    onChange={(e) => handleChange('exportReport', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-7 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                </div>
             </div>

             {/* Show MAC */}
             <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-3 flex flex-col justify-between gap-2 hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium">Show MAC</span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer self-end">
                  <input 
                    type="checkbox" 
                    checked={config.includeMac} 
                    onChange={(e) => handleChange('includeMac', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-7 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                </div>
             </div>

             {/* Target OS */}
             <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-3 flex flex-col justify-between gap-2 hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-2 text-slate-300">
                  <Laptop className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium">Target OS</span>
                </div>
                <select
                  value={config.osTarget}
                  onChange={(e) => handleChange('osTarget', e.target.value as any)}
                  className="bg-slate-800 border border-slate-600 text-slate-200 text-xs rounded focus:ring-emerald-500 focus:border-emerald-500 block w-full p-1 outline-none cursor-pointer"
                >
                  <option value="cross-platform">Universal</option>
                  <option value="linux">Linux</option>
                  <option value="windows">Windows</option>
                  <option value="macos">macOS</option>
                </select>
             </div>

             {/* Timeout */}
             <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-3 flex flex-col justify-between gap-2 hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-medium">Timeout (s)</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={config.scanTimeout}
                  onChange={(e) => handleChange('scanTimeout', parseInt(e.target.value))}
                  className="bg-slate-800 border border-slate-600 text-slate-200 text-xs rounded focus:ring-emerald-500 focus:border-emerald-500 block w-full p-1 text-center transition-colors outline-none"
                />
             </div>
          </div>
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 animate-slide-up [animation-delay:400ms] [animation-fill-mode:forwards] opacity-0
            ${isGenerating 
              ? 'bg-slate-600 cursor-not-allowed opacity-75' 
              : 'bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] hover:shadow-emerald-500/20'
            }`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Scanner Script'
          )}
        </button>
      </div>
    </div>
  );
};

export default GeneratorForm;
