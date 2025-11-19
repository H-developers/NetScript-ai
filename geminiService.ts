
import { GoogleGenAI, Chat } from "@google/genai";
import { ScriptConfig } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePythonScript = async (config: ScriptConfig): Promise<string> => {
  
  const prompt = `
    You are an expert Python Network Security Engineer.
    Create a single, robust, cross-platform Python script to scan nearby devices via WiFi (ARP) and Bluetooth (BLE).
    
    **Configuration:**
    - Scan WiFi/LAN: ${config.scanWifi}
    - Scan Bluetooth: ${config.scanBluetooth}
    - Show MAC: ${config.includeMac}
    - Timeout: ${config.scanTimeout}s
    - Deep Scan Mode: ${config.deepScan}
    - Scan Ports: ${config.scanPorts}
    - Port Target: ${config.portRange}
    - Export Report (JSON): ${config.exportReport}
    - Online GeoIP Lookup: ${config.onlineGeoIp}
    - Vulnerability Scan: ${config.vulnScan}
    
    **Critical Technical Requirements:**
    1. **Cross-Platform Core & OS Specifics**: 
       - The script MUST work on Windows, Linux, and macOS without modification.
       - **Windows Compatibility**: 
          - Explicitly check \`if platform.system() == 'Windows':\` and set \`asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())\` before \`asyncio.run()\`. This is crucial for subprocess/threading compatibility.
       - **Interface Detection**: 
          - Do not hardcode 'eth0' or 'wlan0'.
          - Use \`socket\` to connect to a dummy public IP (e.g., 8.8.8.8) to find the correct local interface IP and subnet dynamically.
          - If \`scapy\` is used, ensure \`conf.iface\` is set to the interface associated with that local IP.
    
    2. **Concurrency (Best Performance)**:
       - Use \`asyncio\` as the main entry point.
       - \`bleak\` is async-native.
       - \`scapy\` (ARP scan) is blocking. You MUST run the scapy logic in a \`ThreadPoolExecutor\` using \`loop.run_in_executor\` so it does not block the Bluetooth scan.
       - Run both scans concurrently using \`asyncio.gather()\`.
       
    3. **Device Data (OFFLINE ONLY)**:
       - For LAN: Extract IP, MAC.
       - **Vendor Resolution**: Use LOCAL databases only (e.g., Scapy's built-in OUI database or Nmap's internal DB). **DO NOT** make HTTP requests to external APIs for MAC vendors.
       - **Hostname**: Use standard \`socket.gethostbyaddr\` (local DNS/mDNS).
       - For Bluetooth: Extract Name, Address (UUID/MAC), and RSSI.
    
    4. **Deep Scan Logic (INTEGRATE BEST OFFLINE TOOLS)**:
       - **EXECUTE ONLY IF Deep Scan Mode is TRUE**:
       - **Packet Sniffing (Wireshark-style)**: 
         - Perform a brief, non-blocking packet capture on the active interface: \`scapy.sniff(count=50, timeout=5)\`.
         - **Traffic Analysis**: Iterate through captured packets to count protocols (TCP, UDP, ICMP, ARP, DNS, MDNS).
         - **Fingerprinting**: Print a "Network Traffic Analysis" summary table. Show the percentage distribution of protocols to identify network characteristics (e.g., High UDP = Streaming/VoIP, High MDNS = IoT/Smart Home).
       - **Nmap Integration**: Check if \`nmap\` is installed (using \`shutil.which('nmap')\`). 
         - If YES: Use \`nmap\` (via subprocess or \`python-nmap\`) to perform OS detection (\`-O\`) and Service Versioning (\`-sV\`) on discovered hosts.
         - If NO: Fallback to standard ARP/mDNS logic and print a tip: "Install Nmap for better results".
       - **Identity & Prediction**: If device name is unknown, predict device type using MAC OUI and mDNS/Bonjour (UDP 5353) traffic patterns locally.

    5. **Port Scanning (If Enabled)**:
       - If 'Scan Ports' is true:
       - **Prefer Nmap**: If \`nmap\` is available, use it for the port scan (faster and more accurate).
       - **Fallback**: If \`nmap\` is missing, perform a TCP Connect scan using \`asyncio.open_connection\` with a semaphore to limit concurrency (max 50 tasks).
       - Parse '${config.portRange}' (list or range).

    6. **Report Export (If Enabled)**:
       - If '${config.exportReport}' is True:
       - At the end of the script, collect all discovered device data into a Python list of dictionaries.
       - Write this data to a file named \`network_scan_report.json\` in the current directory.
       - Print: "[+] Report saved to network_scan_report.json"

    7. **Online & Vulnerability Features (OPTIONAL)**:
       - **GeoIP (Online)**: If '${config.onlineGeoIp}' is True:
         - Allow usage of \`requests\` to query public APIs (e.g., \`https://api.ipify.org?format=json\` for IP and \`https://ipapi.co/json/\` for location).
         - Wrap in try/except to handle no internet.
       - **Vulnerability Scan (Nmap)**: If '${config.vulnScan}' is True AND Nmap is installed:
         - Add \`--script vuln\` to the Nmap arguments.
         - Note: This is slow, print a message "Running Vulnerability Scan...".

    8. **Robust Error Handling (CRITICAL)**:
       - **Library Imports**: Wrap ALL third-party imports (\`scapy\`, \`bleak\`, \`python-nmap\`, \`requests\`) in \`try-except ImportError\`. If missing, print: "[!] Error: Library 'name' missing. Run: pip install name" and exit.
       - **Permission Checks**: Catch \`PermissionError\` or \`scapy.error.Scapy_Exception\`. Print: "[!] Permission Denied. Run with sudo/Admin rights."
       - **Partial Failure**: If Bluetooth fails (e.g., no adapter), catch the exception, print a warning, but **CONTINUE** the WiFi scan. Do not crash the whole script.
       - **Network Down**: If no network connection is found, print a clear error instead of a stack trace.

    9. **Script Header & Attribution**:
       - Add a standard Python docstring at the very top of the script.
       - Include fields for: 'Author', 'GitHub Profile', and 'Social Links'.
       - Leave these fields as placeholders (e.g., "[Insert Name Here]") for the user to fill out manually.
       
    **Output Format**:
    - Print a clean, aligned table using standard string formatting (f-strings with padding).
    - Example columns: | TYPE | IP / ADDRESS | MAC | NAME / VENDOR | PORTS/OS |
    - Use \`colorama\` for basic coloring (Green for online, Red for errors) if available.
    
    RETURN ONLY THE RAW PYTHON CODE. NO MARKDOWN. NO BACKTICKS.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    let code = response.text || "# Error: No code generated.";
    
    // Remove markdown code blocks if present
    code = code.replace(/```python/g, "").replace(/```/g, "").trim();
    
    return code;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `# Error generating script: ${error instanceof Error ? error.message : String(error)}`;
  }
};

export const explainScript = async (code: string): Promise<string> => {
  const prompt = `
    Analyze the following Python network scanner script.
    Explain how it achieves cross-platform compatibility and concurrency.
    Highlight how it integrates external tools like Nmap or Wireshark-style sniffing if present.
    Specifically mention if any Online features (GeoIP) or Vulnerability scans are enabled.
    List the libraries required.
    
    Script snippet:
    ${code.substring(0, 3000)}...
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No explanation available.";
  } catch (error) {
    return "Failed to generate explanation.";
  }
};

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are an expert Python Scripting Assistant for Network Engineering.
      
      YOUR GOAL: Help users write efficient, cross-platform Python scripts for network tasks.
      
      TECHNICAL RULES:
      1. Prioritize 'scapy' for packet manipulation and 'bleak' for Bluetooth.
      2. Recommend 'nmap' integration for advanced scanning.
      3. Ensure code is compatible with Windows, Linux, and macOS.
      4. Use 'asyncio' for performance where possible.
      5. Respect Offline vs Online boundaries. Only suggest internet APIs if the user explicitly asks for online features.
      
      Keep responses concise and code-focused.`,
    }
  });
};
