import { SavedScript, ScriptConfig } from '../types';

const HISTORY_STORAGE_KEY = 'netscript_saved_history';

export const saveScriptToHistory = (code: string, explanation: string, config: ScriptConfig): SavedScript => {
  const newScript: SavedScript = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    code,
    explanation,
    config
  };

  try {
    const history = getScriptHistory();
    // Keep last 50 scripts
    const updatedHistory = [newScript, ...history].slice(0, 50);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (e) {
    console.error("Failed to save script history", e);
  }

  return newScript;
};

export const getScriptHistory = (): SavedScript[] => {
  try {
    const history = localStorage.getItem(HISTORY_STORAGE_KEY);
    return history ? JSON.parse(history) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const deleteScriptFromHistory = (id: string): SavedScript[] => {
  try {
    const history = getScriptHistory();
    const updatedHistory = history.filter(script => script.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    return updatedHistory;
  } catch (e) {
    console.error("Failed to delete script", e);
    return [];
  }
};

export const clearScriptHistory = () => {
  localStorage.removeItem(HISTORY_STORAGE_KEY);
};
