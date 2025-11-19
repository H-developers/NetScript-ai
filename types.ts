
export interface ScriptConfig {
  scanWifi: boolean;
  scanBluetooth: boolean;
  includeMac: boolean;
  osTarget: 'cross-platform' | 'linux' | 'windows' | 'macos';
  scanTimeout: number;
  deepScan: boolean;
  scanPorts: boolean;
  portRange: string;
  // New Features
  exportReport: boolean; // Offline: Save JSON/CSV
  onlineGeoIp: boolean;  // Online: Check Public IP & Location
  vulnScan: boolean;     // Hybrid: Nmap Vulnerability Scripts
}

export interface GeneratedResult {
  code: string;
  explanation: string;
  libraries: string[];
}

export enum ScanType {
  WIFI = 'WIFI',
  BLUETOOTH = 'BLUETOOTH',
  BOTH = 'BOTH'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio?: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  action: 'LOGIN' | 'LOGOUT' | 'GENERATE_SCRIPT' | 'DEEP_SCAN_TOGGLE' | 'CLOUD_SYNC' | 'ERROR';
  details: string;
  user?: string;
}

export interface SavedScript {
  id: string;
  timestamp: number;
  code: string;
  explanation: string;
  config: ScriptConfig;
}
