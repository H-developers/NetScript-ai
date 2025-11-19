
import React, { useState } from 'react';
import { Github, X, Loader2, AlertCircle, KeyRound, ExternalLink } from 'lucide-react';
import { GitHubUser } from '../types';

interface GitHubConnectProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (user: GitHubUser) => void;
}

const GitHubConnect: React.FC<GitHubConnectProps> = ({ isOpen, onClose, onConnect }) => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Authenticate with the token to get the REAL user profile
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Invalid Token. Please check and try again.");
        throw new Error("GitHub API Error");
      }

      const data: GitHubUser = await response.json();
      onConnect(data);
      setToken(''); // Clear token for security
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // URL to pre-fill the token generation page with correct scope
  const tokenUrl = "https://github.com/settings/tokens/new?scopes=read:user&description=NetScript+AI+Authenticator";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5 text-white" />
            <h3 className="font-bold text-white">Connect GitHub Account</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
             <div className="p-2 bg-emerald-500/10 rounded-lg">
               <KeyRound className="w-5 h-5 text-emerald-400" />
             </div>
             <div className="text-sm text-slate-300">
               <p className="font-semibold text-white mb-1">Authentication Required</p>
               To prevent impersonation, please provide a <strong className="text-emerald-400">Personal Access Token</strong>. We do not store this token.
             </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-slate-500 uppercase">Personal Access Token</label>
                <a 
                  href={tokenUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[10px] flex items-center gap-1 text-emerald-400 hover:text-emerald-300 hover:underline"
                >
                  Generate Token <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700 font-mono"
                autoFocus
              />
              <p className="text-[10px] text-slate-500 mt-2">
                Token must have <code>read:user</code> scope.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-slide-up">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Identity'}
            </button>
          </form>
          
          <div className="pt-2 text-center border-t border-slate-800/50">
             <a href="https://github.com/join" target="_blank" rel="noreferrer" className="text-xs text-slate-500 hover:text-emerald-400 transition-colors">
               Create a GitHub account
             </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubConnect;
