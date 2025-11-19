
import React, { useState, useEffect } from 'react';
import { ScriptConfig, GitHubUser, LogEntry, SavedScript } from './types';
import { generatePythonScript, explainScript } from './services/geminiService';
import { 
  logActivity 
} from './services/logService';
import {
  saveScriptToHistory,
  getScriptHistory,
  deleteScriptFromHistory
} from './services/historyService';
import GeneratorForm from './components/GeneratorForm';
import ScriptDisplay from './components/ScriptDisplay';
import ChatAssistant from './components/ChatAssistant';
import GitHubConnect from './components/GitHubConnect';
import HistoryPanel from './components/HistoryPanel';
import { Network, ShieldAlert, Copy, Check, Github, LogOut, Clock } from 'lucide-react';

const App: React.FC = () => {
  const [config, setConfig] = useState<ScriptConfig>({
    scanWifi: true,
    scanBluetooth: true,
    includeMac: true,
    osTarget: 'cross-platform',
    scanTimeout: 5,
    deepScan: false,
    scanPorts: false,
    portRange: "22,80,443,445,3389",
    exportReport: false,
    onlineGeoIp: false,
    vulnScan: false
  });

  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [installCmdCopied, setInstallCmdCopied] = useState(false);

  // GitHub User State
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // History State
  const [history, setHistory] = useState<SavedScript[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load user and history from local storage
  useEffect(() => {
    const storedUser = localStorage.getItem('netscript_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to load user", e);
      }
    }
    setHistory(getScriptHistory());
  }, []);

  const handleLogin = (newUser: GitHubUser) => {
    setUser(newUser);
    localStorage.setItem('netscript_user', JSON.stringify(newUser));
    // This automatically sends data to the admin sheet via logService
    logActivity('LOGIN', `User logged in from ${navigator.platform}`, newUser);
  };

  const handleLogout = () => {
    if (user) {
      logActivity('LOGOUT', `User logged out`, user);
    }
    setUser(null);
    // Disable ALL gated/high-level features on logout
    setConfig(prev => ({ 
      ...prev, 
      deepScan: false, 
      vulnScan: false, 
      scanPorts: false, 
      onlineGeoIp: false 
    }));
    localStorage.removeItem('netscript_user');
  };

  const copyInstallCmd = () => {
    navigator.clipboard.writeText("pip install scapy bleak requests colorama python-nmap");
    setInstallCmdCopied(true);
    setTimeout(() => setInstallCmdCopied(false), 2000);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedCode("");
    
    // Log the attempt (sends to admin sheet)
    logActivity('GENERATE_SCRIPT', `Targets: WiFi=${config.scanWifi}, BLE=${config.scanBluetooth}, Online=${config.onlineGeoIp}, Deep=${config.deepScan}`, user);
    
    try {
      // 1. Generate the code
      const code = await generatePythonScript(config);
      setGeneratedCode(code);

      // 2. Explain the code
      const expl = await explainScript(code);
      setExplanation(expl);

      // Auto-save removed in favor of manual save button to prevent history clutter
    } catch (err) {
      setError("Failed to generate script. Please try again.");
      logActivity('ERROR', `Generation failed: ${err}`, user);
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualSave = () => {
    if (generatedCode) {
      const savedItem = saveScriptToHistory(generatedCode, explanation, config);
      setHistory(prev => [savedItem, ...prev]);
    }
  };

  const handleLoadScript = (script: SavedScript) => {
    setConfig(script.config);
    setGeneratedCode(script.code);
    setExplanation(script.explanation);
    setIsHistoryOpen(false);
  };

  const handleDeleteScript = (id: string) => {
    const updated = deleteScriptFromHistory(id);
    setHistory(updated);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 selection:bg-emerald-500/30 flex flex-col animate-fade-in">
      
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <Network className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                NetScript AI
              </h1>
              <p className="text-xs text-slate-500 font-mono">Python Network Scanner Generator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg border border-slate-700 transition-all hover:scale-105 active:scale-95"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </button>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              Powered by Gemini 3 Pro
            </div>

            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-800 animate-scale-in">
                 <a 
                   href={user.html_url} 
                   target="_blank" 
                   rel="noreferrer"
                   className="flex items-center gap-2 group"
                 >
                    <img 
                      src={user.avatar_url} 
                      alt={user.login} 
                      className="w-8 h-8 rounded-full border border-slate-600 group-hover:border-emerald-500 transition-colors"
                    />
                    <div className="hidden sm:block text-right">
                      <p className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{user.login}</p>
                      {user.name && <p className="text-[10px] text-slate-500">{user.name}</p>}
                    </div>
                 </a>
                 <button 
                   onClick={handleLogout}
                   className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                   title="Sign Out"
                 >
                   <LogOut className="w-4 h-4" />
                 </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-700 transition-all hover:scale-105 active:scale-95"
              >
                <Github className="w-4 h-4" />
                <span className="hidden sm:inline">Connect GitHub</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        
        <div className="mb-8 bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg flex gap-3 items-start animate-slide-up">
          <ShieldAlert className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-200">
            <strong className="block text-blue-300 mb-1">Disclaimer:</strong>
            This tool generates Python scripts for educational and network administration purposes. 
            Scanning networks without permission may be illegal.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Configuration */}
          <div className="lg:col-span-4 space-y-6">
            <GeneratorForm 
              config={config} 
              setConfig={setConfig} 
              isGenerating={isGenerating} 
              onGenerate={handleGenerate}
              user={user}
              onLoginRequest={() => setIsLoginModalOpen(true)}
            />

            {/* Tips Panel */}
            <div className="hidden lg:block p-6 rounded-xl bg-slate-800/30 border border-slate-800 animate-slide-up [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                Required Libraries
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Run this command to install all dependencies for the generated script:
              </p>
              <div className="bg-slate-950 p-3 rounded border border-slate-700 flex items-center justify-between group relative hover:border-slate-600 transition-colors">
                <code className="font-mono text-xs text-emerald-400 select-all break-all pr-8">
                  pip install scapy bleak requests colorama python-nmap
                </code>
                <button
                  onClick={copyInstallCmd}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1.5 rounded-md hover:bg-slate-800 transition-all"
                  title="Copy command"
                >
                  {installCmdCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 animate-scale-in" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 mt-6">
                Runtime Notes
              </h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0"></span>
                  <span><strong>Admin Rights:</strong> Raw socket access (ARP) and Bluetooth stack access usually require <code>sudo</code> (Linux/Mac) or "Run as Administrator" (Windows).</span>
                </li>
                <li className="flex items-start gap-2">
                   <span className="mt-1.5 w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></span>
                   <span><strong>Nmap Required:</strong> For advanced OS detection, you must install <a href="https://nmap.org/download" target="_blank" rel="noreferrer" className="text-orange-400 hover:underline">Nmap</a> on your system.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                  <span><strong>Windows:</strong> Ensure <a href="https://npcap.com/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Npcap</a> is installed for Wi-Fi scanning.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Output */}
          <div className="lg:col-span-8">
            {generatedCode ? (
              <div className="animate-scale-in">
                <ScriptDisplay 
                  code={generatedCode} 
                  explanation={explanation} 
                  onSave={handleManualSave}
                />
              </div>
            ) : (
              <div className="h-[600px] bg-slate-900/50 border border-slate-800 border-dashed rounded-xl flex flex-col items-center justify-center text-slate-500 p-8 text-center animate-fade-in">
                 <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 animate-pulse-slow">
                   <Network className="w-8 h-8 opacity-50" />
                 </div>
                <h3 className="text-lg font-medium text-slate-300 mb-2">Ready to Generate</h3>
                <p className="max-w-md mx-auto text-sm">
                  Configure your scanning requirements on the left and click "Generate Scanner Script". 
                  AI will write a custom, concurrent Python script for you using <code>scapy</code> (ARP), <code>bleak</code> (Bluetooth), and <code>nmap</code>.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/30 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
            <span>Want early access to new features?</span>
            <a 
              href="https://drive.google.com/file/d/1e2AFFbi_jAvWdsJBan3oZz_C25QBLGow/view?usp=drivesdk" 
              target="_blank" 
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 transition-colors underline decoration-emerald-500/30 hover:decoration-emerald-400"
            >
              Apply for the Beta Program
            </a>
          </p>
        </div>
      </footer>

      <ChatAssistant />
      <HistoryPanel 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history}
        onLoad={handleLoadScript}
        onDelete={handleDeleteScript}
      />
      
      <GitHubConnect 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onConnect={handleLogin}
      />
    </div>
  );
};

export default App;
